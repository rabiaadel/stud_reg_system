$ErrorActionPreference = 'Stop'

$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$extractedDir = Join-Path $rootDir 'db-extracted'
$coursesPath = Join-Path $extractedDir 'specialization_courses_complete.json'
$bylawsPath = Join-Path $extractedDir 'bylaws_complete.json'
$outputPath = Join-Path $PSScriptRoot '002_tanta_bylaws_seed.sql'

$coursesData = Get-Content $coursesPath -Raw | ConvertFrom-Json
$bylawsData = Get-Content $bylawsPath -Raw | ConvertFrom-Json

function Escape-Sql {
  param([object]$Value)
  if ($null -eq $Value) { return 'NULL' }
  $text = [string]$Value
  $escaped = $text.Replace("'", "''")
  return "'$escaped'"
}

function Slug-ToCode {
  param([string]$Value)
  if (-not $Value) { return '' }
  $code = ($Value.ToUpper() -replace '[^A-Z0-9]+', '_').Trim('_')
  if ($code.Length -gt 50) { $code = $code.Substring(0, 50) }
  return $code
}

$facultyCode = 'FCI'
$universityCode = 'TANTA'
$facultyNameEn = $bylawsData.institution_structure.faculty_name.en
$facultyNameAr = $bylawsData.institution_structure.faculty_name.ar
$universityNameEn = $bylawsData.institution_structure.university_name.en
$universityNameAr = $bylawsData.institution_structure.university_name.ar

if (-not $facultyNameEn) { $facultyNameEn = 'Faculty of Computers and Informatics' }
if (-not $universityNameEn) { $universityNameEn = 'Tanta University' }

$courseMap = @{}
$prereqPairs = New-Object System.Collections.Generic.HashSet[string]
$requirementPairs = New-Object System.Collections.Generic.HashSet[string]
$categorySet = New-Object System.Collections.Generic.HashSet[string]

function Add-Course {
  param(
    [object]$Course,
    [hashtable]$Overrides
  )

  if (-not $Course -or [string]::IsNullOrWhiteSpace([string]$Course.code)) { return }

  if (-not $courseMap.ContainsKey($Course.code)) {
    $creditsValue = 0
    if ($Course.PSObject.Properties.Name -contains 'credits' -and $null -ne $Course.credits) {
      $creditsValue = $Course.credits
    } elseif ($Course.PSObject.Properties.Name -contains 'credit_hours' -and $null -ne $Course.credit_hours) {
      $creditsValue = $Course.credit_hours
    }

    $courseMap[$Course.code] = [ordered]@{
      code = $Course.code
      name = $Course.name
      credits = [int]$creditsValue
      level = $Course.level
      category = $Course.category
      mandatory = $Course.mandatory
      specialization = $null
    }
  }

  $record = $courseMap[$Course.code]
  if (-not $record.name) { $record.name = $Course.name }
  if (-not $record.category -and $Overrides.category) { $record.category = $Overrides.category }
  if ($Overrides.ContainsKey('mandatory')) { $record.mandatory = $Overrides.mandatory }
  if ($Overrides.ContainsKey('specialization')) { $record.specialization = $Overrides.specialization }

  $prereqList = $null
  if ($Course.PSObject.Properties.Name -contains 'prerequisites') { $prereqList = $Course.prerequisites }
  if (-not $prereqList -and ($Course.PSObject.Properties.Name -contains 'prerequisite')) { $prereqList = $Course.prerequisite }

  if ($null -ne $prereqList) {
    $normalized = @()
    if ($prereqList -is [string]) { $normalized = @($prereqList) }
    elseif ($prereqList -is [System.Collections.IEnumerable]) { $normalized = @($prereqList) }
    else { $normalized = @($prereqList) }

    foreach ($prereq in $normalized) {
      if ($prereq -and -not [string]::IsNullOrWhiteSpace([string]$prereq)) {
        [void]$prereqPairs.Add("$($Course.code)::$prereq")
      }
    }
  }
}

function Add-Requirement {
  param(
    [string]$SpecCode,
    [string]$CourseCode,
    [string]$RequirementType,
    [bool]$IsMandatory
  )

  if ([string]::IsNullOrWhiteSpace($SpecCode) -or [string]::IsNullOrWhiteSpace($CourseCode)) { return }
  $flag = if ($IsMandatory) { '1' } else { '0' }
  [void]$requirementPairs.Add("$SpecCode::$CourseCode::$RequirementType::$flag")
}

$specKeys = $coursesData.PSObject.Properties.Name | Where-Object { $_ -like '*_specialization' }
$specializationSpecs = @()
foreach ($key in $specKeys) {
  $spec = $coursesData.$key
  if ($spec -and $spec.code) { $specializationSpecs += $spec }
}

$allSpecCodes = $specializationSpecs | ForEach-Object { $_.code }

function Push-CommonCourses {
  param(
    [object[]]$Courses,
    [string]$Category,
    [string]$RequirementType
  )

  if (-not $Courses) { return }
  foreach ($course in $Courses) {
    Add-Course -Course $course -Overrides @{ category = $Category; mandatory = ($course.mandatory -ne $false) }
  }

  foreach ($specCode in $allSpecCodes) {
    foreach ($course in $Courses) {
      Add-Requirement -SpecCode $specCode -CourseCode $course.code -RequirementType $RequirementType -IsMandatory ($course.mandatory -ne $false)
    }
  }
}

Push-CommonCourses -Courses $coursesData.general_courses.university_requirements -Category 'General University Requirements' -RequirementType 'university'
Push-CommonCourses -Courses $coursesData.basic_sciences_mathematics.courses -Category 'Basic Sciences and Mathematics' -RequirementType 'basic'
Push-CommonCourses -Courses $coursesData.basic_computing_sciences -Category 'Basic Computing' -RequirementType 'basic'

foreach ($spec in $specializationSpecs) {
  $mandatoryCourses = if ($spec.PSObject.Properties.Name -contains 'mandatory_courses') { $spec.mandatory_courses } else { @() }
  foreach ($course in $mandatoryCourses) {
    $categoryName = if ($course.PSObject.Properties.Name -contains 'category' -and $course.category) { $course.category } else { "$($spec.name) Core" }
    Add-Course -Course $course -Overrides @{ category = $categoryName; mandatory = $true; specialization = $spec.code }
    Add-Requirement -SpecCode $spec.code -CourseCode $course.code -RequirementType 'core' -IsMandatory $true
  }

  $electiveCourses = if ($spec.PSObject.Properties.Name -contains 'elective_courses') { $spec.elective_courses } else { @() }
  foreach ($course in $electiveCourses) {
    $categoryName = if ($course.PSObject.Properties.Name -contains 'category' -and $course.category) { $course.category } else { "$($spec.name) Elective" }
    Add-Course -Course $course -Overrides @{ category = $categoryName; mandatory = $false; specialization = $spec.code }
    Add-Requirement -SpecCode $spec.code -CourseCode $course.code -RequirementType 'elective' -IsMandatory $false
  }
}

foreach ($course in $courseMap.Values) {
  if ($course.category) { [void]$categorySet.Add($course.category) }
}

$sql = New-Object System.Collections.Generic.List[string]

function Add-Statement {
  param([string]$Statement)
  $sql.Add($Statement.Trim())
}

Add-Statement @'
-- ============================================================================
-- Auto-generated seed: Tanta University bylaws + course catalog
-- Source: db-extracted/bylaws_complete.json, specialization_courses_complete.json
-- ============================================================================
BEGIN;
'@

Add-Statement @"
INSERT INTO universities (code, name_en, name_ar, country, city, is_active)
VALUES ('$universityCode', $(Escape-Sql $universityNameEn), $(Escape-Sql $universityNameAr), 'Egypt', 'Tanta', TRUE)
ON CONFLICT (code) DO NOTHING;
"@

Add-Statement @"
INSERT INTO faculties (university_id, code, name_en, name_ar, description, is_active)
SELECT u.id, '$facultyCode', $(Escape-Sql $facultyNameEn), $(Escape-Sql $facultyNameAr), 'Official faculty for computing programs', TRUE
FROM universities u
WHERE u.code = '$universityCode'
ON CONFLICT (code) DO NOTHING;
"@

$departments = @()
if ($bylawsData.institution_structure.departments) {
  foreach ($dept in $bylawsData.institution_structure.departments) {
    if ($dept.code -and $dept.name_en) {
      $departments += @{
        code = $dept.code
        name_en = $dept.name_en
        name_ar = $dept.name_ar
      }
    }
  }
}

if (-not $departments -or $departments.Count -eq 0) {
  $departments = @(
    @{ code = 'CS'; name_en = 'Computer Science'; name_ar = $null },
    @{ code = 'IS'; name_en = 'Information Systems'; name_ar = $null },
    @{ code = 'IT'; name_en = 'Information Technology'; name_ar = $null },
    @{ code = 'SE'; name_en = 'Software Engineering'; name_ar = $null }
  )
}

foreach ($dept in $departments) {
  Add-Statement @"
INSERT INTO departments (faculty_id, code, name_en, name_ar, is_active)
SELECT f.id, $(Escape-Sql $dept.code), $(Escape-Sql $dept.name_en), $(Escape-Sql $dept.name_ar), TRUE
FROM faculties f
WHERE f.code = '$facultyCode'
ON CONFLICT (code) DO NOTHING;
"@
}

foreach ($spec in $specializationSpecs) {
  Add-Statement @"
INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
SELECT d.id, f.id, $(Escape-Sql $spec.code), $(Escape-Sql $spec.name), $(Escape-Sql $spec.name), $(Escape-Sql ($spec.name + ' specialization')), 132, 2.0, 3, 4, 66, TRUE
FROM departments d
JOIN faculties f ON f.id = d.faculty_id
WHERE d.code = $(Escape-Sql $spec.code) AND f.code = '$facultyCode'
ON CONFLICT (code) DO NOTHING;
"@
}

foreach ($categoryName in $categorySet) {
  Add-Statement @"
INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, $(Escape-Sql (Slug-ToCode $categoryName)), $(Escape-Sql $categoryName), $(Escape-Sql ("Imported category: " + $categoryName)), FALSE
FROM faculties f
WHERE f.code = '$facultyCode'
ON CONFLICT (code) DO NOTHING;
"@
}

foreach ($course in $courseMap.Values) {
  $specializationClause = if ($course.specialization) { "(SELECT id FROM specializations WHERE code = $(Escape-Sql $course.specialization))" } else { 'NULL' }
  $levelValue = if ($course.level) { $course.level } else { 'NULL' }
  $creditValue = if ($course.credits) { $course.credits } else { 0 }
  $categoryName = if ($course.category) { $course.category } else { 'Specialization' }
  $categoryCode = Slug-ToCode $categoryName
  $mandatoryValue = if ($course.mandatory -eq $false) { 'FALSE' } else { 'TRUE' }

  Add-Statement @"
INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, $specializationClause, $(Escape-Sql $course.code), $(Escape-Sql $course.name), $creditValue, $levelValue,
  (SELECT id FROM course_categories WHERE code = $(Escape-Sql $categoryCode)),
  $mandatoryValue, TRUE
FROM faculties f
WHERE f.code = '$facultyCode'
ON CONFLICT (code) DO NOTHING;
"@
}

foreach ($pair in $requirementPairs) {
  $parts = $pair.Split('::')
  if ($parts.Length -lt 4) { continue }
  $specCode = $parts[0]
  $courseCode = $parts[1]
  $requirementType = $parts[2]
  $mandatoryFlag = if ($parts[3] -eq '1') { 'TRUE' } else { 'FALSE' }

  if ([string]::IsNullOrWhiteSpace($courseCode) -or [string]::IsNullOrWhiteSpace($specCode)) { continue }

  Add-Statement @"
INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, $(Escape-Sql $requirementType), $mandatoryFlag
FROM specializations s, courses c
WHERE s.code = $(Escape-Sql $specCode) AND c.code = $(Escape-Sql $courseCode)
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;
"@
}

foreach ($pair in $prereqPairs) {
  $parts = $pair.Split('::')
  if ($parts.Length -lt 2) { continue }
  $courseCode = $parts[0]
  $prereqCode = $parts[1]

  if ([string]::IsNullOrWhiteSpace($courseCode) -or [string]::IsNullOrWhiteSpace($prereqCode)) { continue }

  Add-Statement @"
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = $(Escape-Sql $courseCode) AND p.code = $(Escape-Sql $prereqCode)
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;
"@
}

$ruleEntries = @()
$seenRules = New-Object System.Collections.Generic.HashSet[string]

function Collect-Rules {
  param(
    [object]$Value,
    [string[]]$Path
  )

  if ($null -eq $Value) { return }

  if ($Value.PSObject -and $Value.rule_id -and $Value.title) {
    if (-not $seenRules.Contains($Value.rule_id)) {
      [void]$seenRules.Add($Value.rule_id)
      $ruleEntries += [ordered]@{
        rule_id = $Value.rule_id
        title = $Value.title
        category = if ($Path) { ($Path -join ' > ') } else { 'bylaws' }
        payload = $Value
      }
    }
  }

  foreach ($prop in $Value.PSObject.Properties) {
    if ($prop.Name -in @('rule_id', 'title')) { continue }
    $child = $prop.Value
    if ($child -is [string]) { continue }

    if ($child -is [System.Collections.IEnumerable]) {
      $index = 0
      foreach ($item in $child) {
        $index++
        Collect-Rules -Value $item -Path ($Path + @($prop.Name, "$index"))
      }
    } elseif ($child -is [psobject]) {
      Collect-Rules -Value $child -Path ($Path + @($prop.Name))
    }
  }
}

Collect-Rules -Value $bylawsData -Path @()

foreach ($rule in $ruleEntries) {
  $jsonPayload = $rule.payload | ConvertTo-Json -Depth 32 -Compress

  Add-Statement @"
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, $(Escape-Sql $rule.rule_id), $(Escape-Sql $rule.category), $(Escape-Sql $rule.title), NULL, 'bylaw', $(Escape-Sql $jsonPayload)::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = '$facultyCode'
ON CONFLICT (rule_code) DO NOTHING;
"@
}

Add-Statement 'COMMIT;'

Set-Content -Path $outputPath -Value ($sql -join "`n`n") -Encoding utf8
Write-Host "Seed file generated at $outputPath"

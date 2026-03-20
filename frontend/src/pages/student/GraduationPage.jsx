/**
 * GraduationPage Component
 * Display graduation eligibility, missing requirements, and graduation status
 * Features:
 * - Comprehensive graduation checklist
 * - Missing requirements display
 * - Project status tracking
 * - Credit hour progress
 * - GPA tracking
 * - Graduation date estimation
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Card, Progress, Badge, Button, Table, Tag, Alert, Spin, Empty, Statistic, Row, Col, Divider, List } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined, 
  CalendarOutlined,
  FileTextOutlined,
  BookOutlined
} from '@ant-design/icons';
import FormalLayout from '../components/layout/FormalLayout';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const GraduationPage = () => {
  const studentId = localStorage.getItem('studentId');
  const [downloadingDiploma, setDownloadingDiploma] = useState(false);

  // Fetch graduation eligibility
  const { data: graduationData, isLoading } = useQuery({
    queryKey: ['graduationEligibility', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get('/registrations/graduation-eligibility', {
        params: { studentId }
      });
      return data;
    },
    enabled: !!studentId
  });

  if (isLoading) {
    return <Spin />;
  }

  if (!graduationData) {
    return (
      <FormalLayout title="Graduation Status">
        <Empty description="Unable to load graduation data" />
      </FormalLayout>
    );
  }

  const {
    eligible_for_graduation,
    eligibility_details,
    graduation_estimate,
    missing_requirements_count
  } = graduationData;

  const details = eligibility_details;

  // Requirements checklist
  const requirements = [
    {
      key: 'academic_standing',
      title: 'Academic Standing',
      value: details.academicStanding.status,
      status: details.academicStanding.status === 'GOOD' ? 'passed' : 'failed',
      description: details.academicStanding.message,
      severity: details.academicStanding.missing.length > 0 ? 'error' : 'success'
    },
    {
      key: 'total_credits',
      title: 'Total Credits',
      value: `${details.creditsStatus.completed_credits}/${details.creditsStatus.required_credits}`,
      status: details.creditsStatus.completed_credits >= details.creditsStatus.required_credits ? 'passed' : 'incomplete',
      description: `${details.creditsStatus.completed_credits} of ${details.creditsStatus.required_credits} credits completed`,
      severity: details.creditsStatus.missing.length > 0 ? 'error' : 'success'
    },
    {
      key: 'gpa_requirement',
      title: 'GPA Requirement',
      value: `${details.creditsStatus.gpa} / ${details.creditsStatus.min_gpa}`,
      status: parseFloat(details.creditsStatus.gpa) >= details.creditsStatus.min_gpa ? 'passed' : 'failed',
      description: `Current GPA: ${details.creditsStatus.gpa} (Minimum: ${details.creditsStatus.min_gpa})`,
      severity: parseFloat(details.creditsStatus.gpa) >= details.creditsStatus.min_gpa ? 'success' : 'error'
    },
    {
      key: 'graduation_projects',
      title: 'Graduation Projects',
      value: `PR411: ${details.projectsStatus.pr411_completed ? '✓' : '✗'} | PR412: ${details.projectsStatus.pr412_completed ? '✓' : '✗'}`,
      status: (details.projectsStatus.pr411_completed && details.projectsStatus.pr412_completed) ? 'passed' : 'incomplete',
      description: 'Required: PR411 (Project 1) and PR412 (Project 2)',
      severity: (details.projectsStatus.pr411_completed && details.projectsStatus.pr412_completed) ? 'success' : 'warning'
    },
    {
      key: 'training',
      title: 'Training/Internship',
      value: details.trainingStatus.training_completed ? '✓ Completed' : '✗ Pending',
      status: details.trainingStatus.training_completed ? 'passed' : 'incomplete',
      description: 'Required: Training course completion (3 credits)',
      severity: details.trainingStatus.training_completed ? 'success' : 'warning'
    },
    {
      key: 'required_courses',
      title: 'Required Courses',
      value: `${details.requiredCoursesStatus.completed_required_courses}/${details.requiredCoursesStatus.total_required_courses}`,
      status: details.requiredCoursesStatus.completed_required_courses >= details.requiredCoursesStatus.total_required_courses ? 'passed' : 'incomplete',
      description: `${details.requiredCoursesStatus.completed_required_courses} of ${details.requiredCoursesStatus.total_required_courses} required courses completed`,
      severity: details.requiredCoursesStatus.missing.length > 0 ? 'warning' : 'success'
    },
    {
      key: 'course_distribution',
      title: 'Course Distribution by Category',
      value: `${details.distributionStatus.distribution_requirements - details.distributionStatus.missing.length}/${details.distributionStatus.distribution_requirements}`,
      status: details.distributionStatus.missing.length === 0 ? 'passed' : 'incomplete',
      description: 'All course category requirements',
      severity: details.distributionStatus.missing.length === 0 ? 'success' : 'warning'
    }
  ];

  // Missing requirements table columns
  const missingColumns = [
    {
      title: 'Requirement',
      dataIndex: 'requirement',
      key: 'requirement'
    },
    {
      title: 'Current Status',
      dataIndex: 'current',
      key: 'current',
      render: (current) => <strong>{current || 'N/A'}</strong>
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required'
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        let color = 'default';
        if (severity === 'CRITICAL') color = 'red';
        if (severity === 'HIGH') color = 'orange';
        if (severity === 'MEDIUM') color = 'gold';
        return <Tag color={color}>{severity}</Tag>;
      }
    }
  ];

  const handleDownloadDiploma = async () => {
    try {
      setDownloadingDiploma(true);
      // TODO: Implement diploma generation and download
      alert('Diploma download will be available after graduation confirmation');
    } catch (error) {
      alert('Error downloading diploma: ' + error.message);
    } finally {
      setDownloadingDiploma(false);
    }
  };

  return (
    <FormalLayout title="Graduation Status">
      <div className="space-y-6">
        {/* Status Summary */}
        <Card>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Graduation Status"
                value={eligible_for_graduation ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                valueStyle={{ color: eligible_for_graduation ? '#52c41a' : '#ff4d4f' }}
                prefix={eligible_for_graduation ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Missing Requirements"
                value={missing_requirements_count}
                valueStyle={{ color: missing_requirements_count === 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Estimated Graduation"
                value={graduation_estimate.estimated_graduation}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Credits Progress"
                value={`${details.creditsStatus.completed_credits}/${details.creditsStatus.required_credits}`}
                suffix="credits"
              />
            </Col>
          </Row>
        </Card>

        {/* Overall Progress Bar */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-4">Overall Progress</h3>
            <Progress
              percent={Math.round((details.creditsStatus.completed_credits / details.creditsStatus.required_credits) * 100)}
              status={eligible_for_graduation ? 'success' : 'active'}
              type="line"
              size="large"
            />
            <p className="text-sm text-gray-600 mt-2">
              {details.creditsStatus.completed_credits} of {details.creditsStatus.required_credits} credit hours completed
              ({Math.round((details.creditsStatus.completed_credits / details.creditsStatus.required_credits) * 100)}%)
            </p>
          </div>
        </Card>

        {/* Eligibility Alert */}
        {eligible_for_graduation ? (
          <Alert
            message="Congratulations!"
            description="You meet all graduation requirements. Please contact your department to submit your graduation application."
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={handleDownloadDiploma}
                loading={downloadingDiploma}
              >
                Download Diploma
              </Button>
            }
          />
        ) : (
          <Alert
            message="Graduation Requirements Not Met"
            description={`You have ${missing_requirements_count} missing requirement(s). Complete these items to become eligible for graduation.`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
          />
        )}

        {/* Requirements Checklist */}
        <Card>
          <h3 className="text-lg font-bold mb-6">Graduation Requirements Checklist</h3>

          <div className="space-y-4">
            {requirements.map((req) => (
              <div key={req.key} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {req.status === 'passed' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                      ) : req.status === 'failed' ? (
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                      ) : (
                        <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
                      )}
                      <strong className="text-base">{req.title}</strong>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{req.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <Tag color={
                      req.severity === 'success' ? 'green' :
                      req.severity === 'error' ? 'red' :
                      'orange'
                    }>
                      {req.value}
                    </Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Missing Requirements Detail */}
        {missing_requirements_count > 0 && (
          <Card>
            <h3 className="text-lg font-bold mb-4">Detailed Missing Requirements</h3>
            <Table
              columns={missingColumns}
              dataSource={details.missing_requirements}
              rowKey="requirement"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )}

        {/* Graduation Project Status */}
        <Card>
          <h3 className="text-lg font-bold mb-4">
            <FileTextOutlined className="mr-2" />
            Graduation Project Status
          </h3>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Card size="small">
                <Statistic
                  title="Project 1 (PR411)"
                  value={details.projectsStatus.pr411_completed ? 'Completed' : 'Pending'}
                  valueStyle={{ color: details.projectsStatus.pr411_completed ? '#52c41a' : '#bfbfbf' }}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Graduation Project 1 (3 credits)
                  <br />
                  {details.projectsStatus.pr411_completed ? 'Completed ✓' : 'Required before PR412'}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small">
                <Statistic
                  title="Project 2 (PR412)"
                  value={details.projectsStatus.pr412_completed ? 'Completed' : 'Pending'}
                  valueStyle={{ color: details.projectsStatus.pr412_completed ? '#52c41a' : '#bfbfbf' }}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Graduation Project 2 (3 credits)
                  <br />
                  {details.projectsStatus.pr412_completed ? 'Completed ✓' : 'Requires PR411 completion'}
                </p>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* GPA and Academic Standing */}
        <Card>
          <h3 className="text-lg font-bold mb-4">
            <BookOutlined className="mr-2" />
            Academic Performance
          </h3>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Current GPA"
                value={details.creditsStatus.gpa}
                suffix={`/ ${details.creditsStatus.min_gpa} required`}
                valueStyle={{
                  color: parseFloat(details.creditsStatus.gpa) >= details.creditsStatus.min_gpa ? '#52c41a' : '#ff4d4f'
                }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Academic Standing"
                value={details.academicStanding.status}
                valueStyle={{
                  color: details.academicStanding.status === 'GOOD' ? '#52c41a' : '#ff4d4f'
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* Graduation Timeline */}
        <Card>
          <h3 className="text-lg font-bold mb-4">
            <CalendarOutlined className="mr-2" />
            Graduation Timeline
          </h3>

          <List
            dataSource={[
              { title: 'Credits Needed', desc: `${graduation_estimate.remaining_credits} more credits` },
              { title: 'Semesters Needed', desc: `Approximately ${graduation_estimate.semesters_needed} semester(s)` },
              { title: 'Estimated Date', desc: graduation_estimate.message }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={item.desc}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </FormalLayout>
  );
};

export default GraduationPage;

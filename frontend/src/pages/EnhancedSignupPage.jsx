import React, { useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Radio, Card, Alert, Spin, message, Tabs } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, IdcardOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig';
import './EnhancedSignup.css';

export const EnhancedSignupPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userType, setUserType] = useState('student');
  const [faculties, setFaculties] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      const response = await axios.get(`${APP_CONFIG.API_BASE_URL}/public/faculties`);
      setFaculties(response.data.data || []);
    } catch (error) {
      console.error('Failed to load faculties', error);
      message.error('Failed to load faculties');
    }
  };

  const loadSpecializations = async (facultyId) => {
    try {
      const response = await axios.get(
        `${APP_CONFIG.API_BASE_URL}/public/faculties/${facultyId}/specializations`
      );
      setSpecializations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load specializations', error);
    }
  };

  const loadDepartments = async (facultyId) => {
    try {
      const response = await axios.get(
        `${APP_CONFIG.API_BASE_URL}/public/faculties/${facultyId}/departments`
      );
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty(facultyId);
    if (userType === 'student') {
      loadSpecializations(facultyId);
    } else {
      loadDepartments(facultyId);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const signupData = {
        role: userType,
        email: values.email,
        password: values.password,
        first_name_en: values.first_name,
        last_name_en: values.last_name,
        first_name_ar: values.first_name_ar,
        last_name_ar: values.last_name_ar,
        phone: values.phone,
        national_id: values.national_id,
        gender: values.gender,
        date_of_birth: values.date_of_birth?.format('YYYY-MM-DD'),
        faculty_id: selectedFaculty,
        ...(userType === 'student' && {
          student_id: values.student_id,
          specialization_id: values.specialization_id,
          admission_type: values.admission_type,
        }),
        ...(userType === 'doctor' && {
          employee_id: values.employee_id,
          title: values.title,
          academic_degree: values.academic_degree,
          department_id: values.department_id,
        }),
      };

      const response = await axios.post(
        `${APP_CONFIG.API_BASE_URL}/auth/register`,
        signupData
      );

      message.success(response.data.message);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Your account request is pending approval. Admin will verify your information soon.' 
          } 
        });
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      message.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="signup-container submitted">
        <Card className="signup-card">
          <div className="submission-success">
            <div className="success-icon">✓</div>
            <h2>Account Request Submitted</h2>
            <p>Your account request has been successfully submitted!</p>
            <Alert 
              message="Pending Admin Review"
              description="Your request will be reviewed by the faculty admin. You will receive a notification once your account is created and approved."
              type="info"
              showIcon
            />
            <Link to="/login">
              <Button type="primary" className="return-btn">
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p className="subtitle">
            {APP_CONFIG.APP_NAME_EN}
            <br />
            {APP_CONFIG.APP_NAME_AR}
          </p>
        </div>

        <div className="user-type-selector">
          <h3>Select Account Type</h3>
          <Radio.Group value={userType} onChange={(e) => setUserType(e.target.value)}>
            <Radio.Button value="student" className="radio-btn student-type">
              <div className="radio-content">
                <div className="radio-icon">🎓</div>
                <div className="radio-text">
                  <div className="radio-label">Student</div>
                  <div className="radio-desc">Register as a Faculty Student</div>
                </div>
              </div>
            </Radio.Button>
            <Radio.Button value="doctor" className="radio-btn doctor-type">
              <div className="radio-content">
                <div className="radio-icon">👨‍🏫</div>
                <div className="radio-text">
                  <div className="radio-label">Doctor/Instructor</div>
                  <div className="radio-desc">Register as Faculty Staff</div>
                </div>
              </div>
            </Radio.Button>
          </Radio.Group>
        </div>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="signup-form"
            requiredMark="optional"
          >
            {/* Basic Information */}
            <div className="form-section">
              <h3>Personal Information</h3>

              <Form.Item
                label="First Name (English)"
                name="first_name"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input placeholder="John" prefix={<UserOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                label="Last Name (English)"
                name="last_name"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input placeholder="Doe" prefix={<UserOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                label="الاسم الأول (العربية)"
                name="first_name_ar"
                rules={[{ required: true, message: 'Arabic first name is required' }]}
              >
                <Input placeholder="محمد" size="large" dir="rtl" />
              </Form.Item>

              <Form.Item
                label="الاسم الأخير (العربية)"
                name="last_name_ar"
                rules={[{ required: true, message: 'Arabic last name is required' }]}
              >
                <Input placeholder="علي" size="large" dir="rtl" />
              </Form.Item>

              <Form.Item
                label="Date of Birth"
                name="date_of_birth"
                rules={[{ required: true, message: 'Date of birth is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select placeholder="Select gender">
                  <Select.Option value="M">Male</Select.Option>
                  <Select.Option value="F">Female</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="National ID"
                name="national_id"
                rules={[
                  { required: true, message: 'National ID is required' },
                  { pattern: /^\d{10,20}$/, message: 'Valid national ID is required' }
                ]}
              >
                <Input placeholder="1234567890" prefix={<IdcardOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: 'Phone is required' },
                  { pattern: /^(\+2|0)\d{10}$/, message: 'Valid Egyptian phone number is required' }
                ]}
              >
                <Input placeholder="+201001234567" prefix={<PhoneOutlined />} size="large" />
              </Form.Item>
            </div>

            {/* Faculty Information */}
            <div className="form-section">
              <h3>Faculty Information</h3>

              <Form.Item
                label="Faculty"
                name="faculty_id"
                rules={[{ required: true, message: 'Faculty is required' }]}
              >
                <Select 
                  placeholder="Select your faculty"
                  onChange={handleFacultyChange}
                >
                  {faculties.map(faculty => (
                    <Select.Option key={faculty.id} value={faculty.id}>
                      {faculty.name_en} - {faculty.name_ar}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {userType === 'student' && (
                <>
                  <Form.Item
                    label="Student ID"
                    name="student_id"
                    rules={[{ required: true, message: 'Student ID is required' }]}
                  >
                    <Input placeholder="STU2024001" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Specialization"
                    name="specialization_id"
                    rules={[{ required: true, message: 'Specialization is required' }]}
                  >
                    <Select placeholder="Select specialization">
                      {specializations.map(spec => (
                        <Select.Option key={spec.id} value={spec.id}>
                          {spec.name_en} - {spec.name_ar}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Admission Type"
                    name="admission_type"
                    rules={[{ required: true, message: 'Admission type is required' }]}
                  >
                    <Select placeholder="Select admission type">
                      <Select.Option value="regular">Regular Admission</Select.Option>
                      <Select.Option value="transfer">Transfer Student</Select.Option>
                      <Select.Option value="special">Special Admission</Select.Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              {userType === 'doctor' && (
                <>
                  <Form.Item
                    label="Employee ID"
                    name="employee_id"
                    rules={[{ required: true, message: 'Employee ID is required' }]}
                  >
                    <Input placeholder="EMP2024001" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Department"
                    name="department_id"
                    rules={[{ required: true, message: 'Department is required' }]}
                  >
                    <Select placeholder="Select department">
                      {departments.map(dept => (
                        <Select.Option key={dept.id} value={dept.id}>
                          {dept.name_en} - {dept.name_ar}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Academic Title"
                    name="title"
                    rules={[{ required: true, message: 'Title is required' }]}
                  >
                    <Select placeholder="Select academic title">
                      <Select.Option value="professor">Professor</Select.Option>
                      <Select.Option value="associate_professor">Associate Professor</Select.Option>
                      <Select.Option value="assistant_professor">Assistant Professor</Select.Option>
                      <Select.Option value="lecturer">Lecturer</Select.Option>
                      <Select.Option value="teaching_assistant">Teaching Assistant</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Academic Degree"
                    name="academic_degree"
                    rules={[{ required: true, message: 'Academic degree is required' }]}
                  >
                    <Input placeholder="Ph.D., M.Sc., etc." size="large" />
                  </Form.Item>
                </>
              )}
            </div>

            {/* Account Credentials */}
            <div className="form-section">
              <h3>Account Credentials</h3>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Invalid email format' }
                ]}
              >
                <Input placeholder="your.email@tanta.edu.eg" prefix={<MailOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                    message: 'Password must contain uppercase, lowercase, and numbers' 
                  }
                ]}
              >
                <Input.Password placeholder="Enter strong password" prefix={<LockOutlined />} size="large" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirm_password"
                rules={[
                  { required: true, message: 'Confirm password is required' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm your password" prefix={<LockOutlined />} size="large" />
              </Form.Item>
            </div>

            {/* Submit */}
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                block
                className="signup-submit-btn"
                loading={loading}
              >
                Submit Account Request
              </Button>
            </Form.Item>

            <div className="login-link">
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default EnhancedSignupPage;

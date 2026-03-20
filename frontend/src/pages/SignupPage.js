import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Radio, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authService, publicService } from '../services/api';
import { APP_NAME_AR, APP_NAME_EN } from '../config/appMeta';

export const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const role = Form.useWatch('role', form);
  const facultyId = Form.useWatch('faculty_id', form);
  const departmentId = Form.useWatch('department_id', form);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await publicService.getFaculties();
        setFaculties(data || []);
      } catch (error) {
        message.error('Failed to load faculties');
      }
    };

    fetchFaculties();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!facultyId) {
        setDepartments([]);
        form.setFieldsValue({ department_id: undefined, specialization_id: undefined });
        return;
      }

      try {
        const data = await publicService.getDepartments(facultyId);
        setDepartments(data || []);
        form.setFieldsValue({ department_id: undefined, specialization_id: undefined });
      } catch (error) {
        message.error('Failed to load departments');
      }
    };

    fetchDepartments();
  }, [facultyId, form]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      if (!departmentId) {
        setSpecializations([]);
        form.setFieldsValue({ specialization_id: undefined });
        return;
      }

      try {
        const data = await publicService.getSpecializations(departmentId);
        setSpecializations(data || []);
        form.setFieldsValue({ specialization_id: undefined });
      } catch (error) {
        message.error('Failed to load specializations');
      }
    };

    fetchSpecializations();
  }, [departmentId, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
      };

      await authService.register({
        ...payload,
        role: values.role,
      });
      message.success('Registration submitted. Await admin approval.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-mark">حاسب</div>
            <div>
              <div className="auth-title">{APP_NAME_AR}</div>
              <div className="auth-subtitle">{APP_NAME_EN}</div>
            </div>
          </div>

        <div className="auth-body">
          <h2 className="auth-heading">Create a New Account</h2>
          <p className="auth-muted">
            Submit your details and an administrator will review your eligibility.
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: 'student', admission_type: 'Regular' }}
          >
            <Form.Item
              name="role"
              label="Account Type"
              rules={[{ required: true, message: 'Please select account type' }]}
            >
              <Radio.Group>
                <Radio value="student">Student</Radio>
                <Radio value="doctor">Doctor</Radio>
              </Radio.Group>
            </Form.Item>

            <div className="auth-grid">
              <Form.Item
                name="first_name_en"
                label="First Name (English)"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input placeholder="Ahmed" />
              </Form.Item>
              <Form.Item
                name="last_name_en"
                label="Last Name (English)"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input placeholder="Hassan" />
              </Form.Item>
            </div>

            <div className="auth-grid">
              <Form.Item name="first_name_ar" label="First Name (Arabic)">
                <Input placeholder="أحمد" />
              </Form.Item>
              <Form.Item name="last_name_ar" label="Last Name (Arabic)">
                <Input placeholder="حسن" />
              </Form.Item>
            </div>

            <div className="auth-grid">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input placeholder="student@university.edu" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Password is required' }]}
              >
                <Input.Password placeholder="Minimum 8 characters" />
              </Form.Item>
            </div>

            <div className="auth-grid">
              <Form.Item name="phone" label="Phone">
                <Input placeholder="+20..." />
              </Form.Item>
              <Form.Item
                name="national_id"
                label="National ID"
                rules={[{ required: true, message: 'National ID is required' }]}
              >
                <Input placeholder="14-digit national ID" />
              </Form.Item>
            </div>

            <div className="auth-grid">
              <Form.Item
                name="faculty_id"
                label="Faculty"
                rules={[{ required: true, message: 'Faculty is required' }]}
              >
                <Select
                  placeholder="Select faculty"
                  options={(faculties || []).map((f) => ({
                    value: f.id,
                    label: f.name_en || f.code,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="department_id"
                label="Department"
                rules={[{ required: role === 'doctor', message: 'Department is required' }]}
              >
                <Select
                  placeholder="Select department"
                  disabled={!facultyId}
                  options={(departments || []).map((d) => ({
                    value: d.id,
                    label: d.name_en || d.code,
                  }))}
                />
              </Form.Item>
            </div>

            {role === 'student' && (
              <div className="auth-grid">
                <Form.Item
                  name="student_id"
                  label="Student ID"
                  rules={[{ required: true, message: 'Student ID is required' }]}
                >
                  <Input placeholder="2024xxxx" />
                </Form.Item>
                <Form.Item
                  name="specialization_id"
                  label="Specialization"
                  rules={[{ required: true, message: 'Specialization is required' }]}
                >
                  <Select
                    placeholder="Select specialization"
                    disabled={!departmentId}
                    options={(specializations || []).map((s) => ({
                      value: s.id,
                      label: s.name_en || s.code,
                    }))}
                  />
                </Form.Item>
              </div>
            )}

            {role === 'student' && (
              <div className="auth-grid">
                <Form.Item
                  name="admission_type"
                  label="Admission Type"
                  rules={[{ required: true, message: 'Admission type is required' }]}
                >
                  <Select
                    placeholder="Select admission type"
                    options={[
                      { value: 'Regular', label: 'Regular' },
                      { value: 'Transfer', label: 'Transfer' },
                      { value: 'Special', label: 'Special' },
                    ]}
                  />
                </Form.Item>
              </div>
            )}

            {role === 'doctor' && (
              <div className="auth-grid">
                <Form.Item
                  name="employee_id"
                  label="Employee ID"
                  rules={[{ required: true, message: 'Employee ID is required' }]}
                >
                  <Input placeholder="EMP-0001" />
                </Form.Item>
                <Form.Item
                  name="title"
                  label="Academic Title"
                  rules={[{ required: true, message: 'Title is required' }]}
                >
                  <Select
                    placeholder="Select title"
                    options={[
                      { value: 'Professor', label: 'Professor' },
                      { value: 'Associate Professor', label: 'Associate Professor' },
                      { value: 'Assistant Professor', label: 'Assistant Professor' },
                      { value: 'Lecturer', label: 'Lecturer' },
                    ]}
                  />
                </Form.Item>
              </div>
            )}

            <div className="auth-grid">
              <Form.Item name="gender" label="Gender">
                <Select
                  placeholder="Select"
                  options={[
                    { value: 'M', label: 'Male' },
                    { value: 'F', label: 'Female' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="date_of_birth" label="Date of Birth">
                <DatePicker className="w-full" />
              </Form.Item>
            </div>

            <div className="auth-actions">
              <Button type="default" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit for Approval
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

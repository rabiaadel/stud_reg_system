import React, { useState } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { APP_NAME_AR, APP_NAME_EN } from '../config/appMeta';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.email, values.password);
      const user = response?.user || useAuthStore.getState().user;

      message.success('Login successful!');

      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Spin spinning={loading} className="w-full max-w-md">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-mark">حاسب</div>
            <div>
              <div className="auth-title">{APP_NAME_AR}</div>
              <div className="auth-subtitle">{APP_NAME_EN}</div>
            </div>
          </div>

          <div className="auth-body">
            <h2 className="auth-heading">Sign In</h2>
            <p className="auth-muted">Use your approved account to access the portal.</p>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-primary" />}
                  placeholder="student@university.edu"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input your password!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-primary" />}
                  placeholder="••••••••"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-full"
                  loading={loading}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <span className="text-sm text-gray-500">New here?</span>
              <Link to="/signup" className="auth-link">Create an account</Link>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Spin,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  DatePicker,
  Empty,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  AlertOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SendOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { adminService } from '../services/api';
import dayjs from 'dayjs';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [recalculateLoading, setRecalculateLoading] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, logs] = await Promise.all([
        adminService.getDashboardStatistics(),
        adminService.getAuditLogs(),
      ]);

      setDashboardStats(stats);
      setAuditLogs(logs || []);
    } catch (error) {
      message.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateGPA = async () => {
    setRecalculateLoading(true);
    try {
      await adminService.recalculateAllGPA();
      message.success('GPA recalculation completed successfully');
      fetchDashboardData();
    } catch (error) {
      message.error('Failed to recalculate GPA');
    } finally {
      setRecalculateLoading(false);
    }
  };

  const handleSendNotifications = async (values) => {
    setNotifyLoading(true);
    try {
      await adminService.sendNotifications({
        message: values.message,
        recipient_type: values.recipient_type,
        filters: values.filters || {},
      });

      message.success('Notifications sent successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send notifications');
    } finally {
      setNotifyLoading(false);
    }
  };

  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) =>
        new Date(text).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      sorter: (a, b) =>
        new Date(b.created_at) - new Date(a.created_at),
    },
    {
      title: 'User',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Entity',
      dataIndex: 'entity_type',
      key: 'entity_type',
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      render: (text) => (
        <span className="text-xs text-gray-600">{text || 'N/A'}</span>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Total Students"
                  value={dashboardStats?.total_students || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Active Semesters"
                  value={dashboardStats?.active_semesters || 0}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Total Courses"
                  value={dashboardStats?.total_courses || 0}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Academic Warnings"
                  value={dashboardStats?.academic_warnings || 0}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Additional Statistics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Dismissed Students"
                  value={dashboardStats?.dismissed_students || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Avg Student GPA"
                  value={dashboardStats?.average_gpa?.toFixed(2) || 0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Active Registrations"
                  value={dashboardStats?.active_registrations || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card loading={loading}>
                <Statistic
                  title="Graduation Eligible"
                  value={dashboardStats?.graduation_eligible || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'tools',
      label: 'Admin Tools',
      children: (
        <div className="space-y-6">
          {/* Bulk Operations */}
          <Card title="Bulk Operations">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Button
                  type="primary"
                  danger
                  icon={<ReloadOutlined />}
                  size="large"
                  className="w-full"
                  loading={recalculateLoading}
                  onClick={handleRecalculateGPA}
                >
                  Recalculate All GPA
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Notifications */}
          <Card title="Send Notifications">
            <Form form={form} layout="vertical" onFinish={handleSendNotifications}>
              <Form.Item
                name="recipient_type"
                label="Recipient Type"
                rules={[{ required: true, message: 'Please select recipient type' }]}
              >
                <Select
                  placeholder="Select recipients"
                  options={[
                    { label: 'All Students', value: 'all_students' },
                    { label: 'Academic Warning', value: 'warning' },
                    { label: 'Graduation Eligible', value: 'graduation_eligible' },
                    { label: 'Dismissed', value: 'dismissed' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message"
                rules={[
                  { required: true, message: 'Please enter a message' },
                  {
                    max: 500,
                    message: 'Message cannot exceed 500 characters',
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Enter notification message"
                  rows={4}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={notifyLoading}
                >
                  Send Notifications
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Rule Management */}
          <Card title="Academic Rules Management">
            <p className="text-gray-600 mb-4">
              Configure academic rules and policies for the institution
            </p>
            <Button type="primary" href="/admin/rules">
              Manage Rules
            </Button>
          </Card>
        </div>
      ),
    },
    {
      key: 'audit',
      label: 'Audit Logs',
      children: (
        <div>
          {auditLogs && auditLogs.length > 0 ? (
            <Table
              columns={auditColumns}
              dataSource={auditLogs}
              rowKey="audit_log_id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                showTotal: (total) => `Total ${total} logs`,
              }}
              scroll={{ x: 1200 }}
              loading={loading}
            />
          ) : (
            <Empty description="No audit logs available" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">
            System administration and monitoring
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchDashboardData}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <Card loading={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Quick Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="System Health">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium">Database Connection</span>
                <Tag color="green">Active</Tag>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium">API Status</span>
                <Tag color="green">Running</Tag>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium">Last Sync</span>
                <span className="text-sm text-gray-600">Just now</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <p className="text-gray-600 text-sm mb-2">
              • {dashboardStats?.total_students || 0} active students
            </p>
            <p className="text-gray-600 text-sm mb-2">
              • {dashboardStats?.academic_warnings || 0} academic warnings issued
            </p>
            <p className="text-gray-600 text-sm mb-2">
              • {dashboardStats?.active_registrations || 0} active course registrations
            </p>
            <p className="text-gray-600 text-sm">
              • {dashboardStats?.graduation_eligible || 0} students eligible for
              graduation
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
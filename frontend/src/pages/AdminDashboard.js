import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
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
  Empty,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  AlertOutlined,
  ReloadOutlined,
  SendOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { adminService } from '../services/api';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [recalculateLoading, setRecalculateLoading] = useState(false);
  const [singleRecalcLoading, setSingleRecalcLoading] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, logs, requests] = await Promise.all([
        adminService.getDashboardStatistics(),
        adminService.getAuditLogs(),
        adminService.getAccountRequests({ status: 'pending' }),
      ]);

      setDashboardStats(stats);
      setAuditLogs(logs || []);
      setAccountRequests(requests || []);
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

  const handleRecalculateStudent = async () => {
    if (!targetStudentId) {
      message.warning('Enter a student ID first');
      return;
    }
    setSingleRecalcLoading(true);
    try {
      const resp = await adminService.recalculateStudent(targetStudentId);
      message.success('Student standing refreshed');
      if (resp?.cgpa !== undefined) {
        message.info(`CGPA now ${resp.cgpa}, warning: ${resp.is_on_warning ? 'yes' : 'no'}`);
      }
      fetchDashboardData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to recalc student');
    } finally {
      setSingleRecalcLoading(false);
    }
  };

  const handleSendNotifications = async (values) => {
    setNotifyLoading(true);
    try {
      await adminService.sendNotifications({
        message: values.message,
        title: values.title || 'Admin Notice',
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

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    reviewForm.setFieldsValue({
      eligibility_status: request?.eligibility_status || 'verified',
      eligibility_notes: request?.eligibility_notes || '',
      rejection_reason: '',
    });
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedRequest(null);
    reviewForm.resetFields();
  };

  const handleReviewDecision = async (decision) => {
    if (!selectedRequest) return;
    setAccountLoading(true);
    try {
      const values = await reviewForm.validateFields();
      if (decision === 'reject' && !values.rejection_reason) {
        message.warning('Please provide a rejection reason');
        return;
      }

      if (decision === 'approve') {
        await adminService.approveAccountRequest(selectedRequest.id, {
          eligibility_status: values.eligibility_status || 'verified',
          eligibility_notes: values.eligibility_notes || null,
        });
        message.success('Account approved');
      } else {
        await adminService.rejectAccountRequest(selectedRequest.id, {
          reason: values.rejection_reason || 'Rejected by admin',
          eligibility_status: 'failed',
          eligibility_notes: values.eligibility_notes || null,
        });
        message.success('Account rejected');
      }

      closeReviewModal();
      fetchDashboardData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to review account');
    } finally {
      setAccountLoading(false);
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
      render: (text) => <Tag color="blue" className="rounded-md font-semibold">{text}</Tag>,
    },
    {
      title: 'Entity',
      dataIndex: 'entity_type',
      key: 'entity_type',
      render: (text) => <span className="font-semibold text-gray-700">{text}</span>
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      render: (text) => (
        <span className="text-xs font-mono text-gray-500 bg-gray-50 p-1 rounded">{text || 'N/A'}</span>
      ),
    },
  ];

  const accountColumns = [
    {
      title: 'Applicant',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.first_name_en} {record.last_name_en}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'doctor' ? 'blue' : 'green'} className="rounded-md font-semibold">
          {role}
        </Tag>
      ),
    },
    {
      title: 'ID Number',
      key: 'id_number',
      render: (_, record) => (
        <span className="font-mono text-sm text-gray-700">
          {record.role === 'student' ? record.student_id : record.employee_id}
        </span>
      ),
    },
    {
      title: 'National ID',
      dataIndex: 'national_id',
      key: 'national_id',
      render: (text) => <span className="font-mono text-xs text-gray-500">{text || 'N/A'}</span>,
    },
    {
      title: 'Requested',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => openReviewModal(record)}
            loading={accountLoading}
            className="rounded-md"
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  const reviewDetails = selectedRequest
    ? [
        { label: 'Applicant', value: `${selectedRequest.first_name_en} ${selectedRequest.last_name_en}`.trim() },
        { label: 'Email', value: selectedRequest.email },
        { label: 'Role', value: selectedRequest.role },
        { label: 'Phone', value: selectedRequest.phone || 'N/A' },
        { label: 'Gender', value: selectedRequest.gender || 'N/A' },
        { label: 'Date of Birth', value: selectedRequest.date_of_birth ? new Date(selectedRequest.date_of_birth).toLocaleDateString() : 'N/A' },
        { label: 'ID Number', value: selectedRequest.role === 'student' ? selectedRequest.student_id : selectedRequest.employee_id },
        { label: 'National ID', value: selectedRequest.national_id || 'N/A' },
        { label: 'Faculty', value: selectedRequest.faculty_name || 'N/A' },
        { label: 'Department', value: selectedRequest.department_name || 'N/A' },
        { label: 'Specialization', value: selectedRequest.specialization_name || 'N/A' },
        { label: 'Admission Type', value: selectedRequest.admission_type || 'N/A' },
        { label: 'Academic Title', value: selectedRequest.title || 'N/A' },
        { label: 'Requested', value: selectedRequest.requested_at ? new Date(selectedRequest.requested_at).toLocaleString() : 'N/A' },
      ]
    : [];

  const tabItems = [
    {
      key: 'overview',
      label: <span className="font-semibold px-4 text-base">Overview</span>,
      children: (
        <div className="space-y-6 pt-4">
          {/* Statistics Cards */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                 <UserOutlined className="text-4xl text-primary mb-3" />
                 <div className="text-3xl font-bold text-gray-800">{dashboardStats?.total_students || 0}</div>
                 <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Total Students</div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                 <BookOutlined className="text-4xl text-success mb-3" />
                 <div className="text-3xl font-bold text-gray-800">{dashboardStats?.active_semesters || 0}</div>
                 <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Active Semesters</div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                 <TrophyOutlined className="text-4xl text-warning mb-3" />
                 <div className="text-3xl font-bold text-gray-800">{dashboardStats?.total_courses || 0}</div>
                 <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Total Courses</div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                 <AlertOutlined className="text-4xl text-error mb-3" />
                 <div className="text-3xl font-bold text-gray-800">{dashboardStats?.academic_warnings || 0}</div>
                 <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Academic Warnings</div>
              </div>
            </Col>
          </Row>

          {/* Additional Statistics */}
          <div className="glass-panel p-6 mt-6">
             <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Secondary Metrics</h2>
             <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex justify-between items-center">
                     <div>
                        <div className="text-sm text-red-600 font-medium">Dismissed Students</div>
                        <div className="text-2xl font-bold text-red-800">{dashboardStats?.dismissed_students || 0}</div>
                     </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex justify-between items-center">
                     <div>
                        <div className="text-sm text-secondary font-medium">Avg Student GPA</div>
                        <div className="text-2xl font-bold text-secondary-dark">{Number(dashboardStats?.average_gpa || 0).toFixed(2)}</div>
                     </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                     <div>
                        <div className="text-sm text-primary font-medium">Active Registrations</div>
                        <div className="text-2xl font-bold text-primary-dark">{dashboardStats?.active_registrations || 0}</div>
                     </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex justify-between items-center">
                     <div>
                        <div className="text-sm text-green-600 font-medium">Graduation Eligible</div>
                        <div className="text-2xl font-bold text-green-800">{dashboardStats?.graduation_eligible || 0}</div>
                     </div>
                  </div>
                </Col>
              </Row>
          </div>
        </div>
      ),
    },
    {
      key: 'tools',
      label: <span className="font-semibold px-4 text-base">Admin Tools</span>,
      children: (
        <div className="space-y-6 pt-4">
          <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                {/* Bulk Operations */}
                <div className="glass-panel p-6 shadow-sm h-full">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Bulk Operations</h2>
                    <div className="p-6 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center h-48 text-center">
                        <AlertOutlined className="text-4xl text-red-400 mb-3" />
                        <h3 className="text-red-800 font-semibold mb-2">Recalculate All GPAs</h3>
                        <p className="text-sm text-red-600 mb-4">This evaluates every student against current scales.</p>
                        <Button
                          type="primary"
                          danger
                          icon={<ReloadOutlined />}
                          size="large"
                          loading={recalculateLoading}
                          onClick={handleRecalculateGPA}
                          className="rounded-lg shadow-sm font-medium"
                        >
                          Trigger Recalculation
                        </Button>
                    </div>
                    <div className="p-6 bg-primary/10 rounded-xl border border-primary/20 flex flex-col gap-3 mt-4">
                      <h3 className="text-primary-dark font-semibold">Recalculate One Student</h3>
                      <p className="text-sm text-primary">Refresh GPA/standing after manual grade changes.</p>
                      <Input
                        placeholder="Student ID"
                        value={targetStudentId}
                        onChange={(e) => setTargetStudentId(e.target.value)}
                      />
                      <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        loading={singleRecalcLoading}
                        onClick={handleRecalculateStudent}
                        disabled={!targetStudentId}
                        className="rounded-lg"
                      >
                        Recalculate Student
                      </Button>
                    </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                  {/* Notifications */}
                  <div className="glass-panel p-6 shadow-sm h-full">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Broadcast Notification</h2>
                    <Form form={form} layout="vertical" onFinish={handleSendNotifications}>
                      <Form.Item
                        name="recipient_type"
                        label={<span className="font-medium text-gray-700">Recipient Group</span>}
                        rules={[{ required: true, message: 'Please select recipient type' }]}
                      >
                        <Select
                          size="large"
                          placeholder="Select recipients"
                          className="rounded-lg"
                          options={[
                            { label: 'All Students', value: 'all' },
                            { label: 'Academic Warning', value: 'warning' },
                            { label: 'Graduation Eligible', value: 'graduation_eligible' },
                            { label: 'Dismissed', value: 'dismissed' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name="title"
                        label={<span className="font-medium text-gray-700">Title</span>}
                        rules={[{ required: true, message: 'Please enter a title' }]}
                      >
                        <Input placeholder="Notification title" />
                      </Form.Item>

                      <Form.Item
                        name="message"
                        label={<span className="font-medium text-gray-700">Message Content</span>}
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
                          rows={3}
                          className="rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item className="mb-0">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SendOutlined />}
                          loading={notifyLoading}
                          className="w-full bg-gradient-to-r from-primary to-primary-light border-0 shadow-neon-primary rounded-lg h-10 font-semibold"
                        >
                          Send Broadcast
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
              </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'audit',
      label: <span className="font-semibold px-4 text-base">Audit Logs</span>,
      children: (
        <div className="glass-panel p-6 mt-4">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-800">System Activity</h2>
          </div>
          {auditLogs && auditLogs.length > 0 ? (
            <Table
              className="bg-transparent"
              columns={auditColumns}
              dataSource={auditLogs}
              rowKey="audit_log_id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                showTotal: (total) => `Total ${total} logs`,
                className: "mt-4"
              }}
              scroll={{ x: 1000 }}
              loading={loading}
            />
          ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl">
               <Empty description={<span className="text-gray-400">No recent audit logs available</span>} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'accounts',
      label: <span className="font-semibold px-4 text-base">Account Requests</span>,
      children: (
        <div className="glass-panel p-6 mt-4">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-800">Pending Approvals</h2>
          </div>
          {accountRequests && accountRequests.length > 0 ? (
            <Table
              className="bg-transparent"
              columns={accountColumns}
              dataSource={accountRequests}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={accountLoading}
            />
          ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl">
               <Empty description={<span className="text-gray-400">No pending account requests</span>} />
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading && !dashboardStats) {
       return (
         <div className="flex justify-center items-center h-96">
           <Spin size="large" className="text-primary" />
         </div>
       );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
             Administrator Dashboard
           </h1>
           <p className="text-gray-500 mt-2 font-medium">
             System administration, governance, and monitoring
           </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchDashboardData}
          loading={loading}
          size="large"
          className="rounded-lg shadow-sm border-gray-300 font-medium text-gray-700"
        >
          Refresh Data
        </Button>
      </div>

      {/* Main Content */}
      <div className="glass-panel p-2 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="px-4"
          animated={{ inkBar: true, tabPane: true }}
        />
      </div>

      {/* Quick Statistics Row shown conditionally */}
      {activeTab === 'overview' && (
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={12}>
          <div className="glass-panel p-6 h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">System Health Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Database Connection</span>
                <Tag color="success" className="px-3 py-1 rounded-full font-bold">ACTIVE</Tag>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">API Gateway</span>
                <Tag color="processing" className="px-3 py-1 rounded-full font-bold">RUNNING</Tag>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Last Telemetry Sync</span>
                <span className="text-sm text-gray-500 font-medium">Just now</span>
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="glass-panel p-6 bg-gradient-to-br from-primary-dark to-primary border-none text-white h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/20 pb-2 relative z-10">System Insights</h2>
            <div className="space-y-4 relative z-10">
                <p className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-green-400 block"></span>
                   <span className="text-slate-100"><strong className="text-white text-lg">{dashboardStats?.total_students || 0}</strong> students currently enrolled</span>
                </p>
                <p className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-red-400 block"></span>
                   <span className="text-slate-100"><strong className="text-white text-lg">{dashboardStats?.academic_warnings || 0}</strong> new warnings issued this term</span>
                </p>
                <p className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-secondary block"></span>
                   <span className="text-slate-100"><strong className="text-white text-lg">{dashboardStats?.active_registrations || 0}</strong> active course registrations</span>
                </p>
                <div className="mt-6 pt-4 border-t border-white/20">
                    <Button type="primary" ghost className="border-white/50 text-white hover:text-white hover:border-white w-full" href="/admin/rules">
                         Review Academic Rules
                    </Button>
                </div>
            </div>
          </div>
        </Col>
      </Row>
      )}

      <Modal
        title="Review Account Request"
        open={reviewModalOpen}
        onCancel={closeReviewModal}
        footer={[
          <Button key="cancel" onClick={closeReviewModal}>
            Cancel
          </Button>,
          <Button
            key="reject"
            danger
            loading={accountLoading}
            onClick={() => handleReviewDecision('reject')}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={accountLoading}
            onClick={() => handleReviewDecision('approve')}
          >
            Approve
          </Button>,
        ]}
      >
        {selectedRequest ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {reviewDetails.map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
                  <div className="font-semibold text-gray-800 break-words">{item.value}</div>
                </div>
              ))}
            </div>

            <Form form={reviewForm} layout="vertical">
              <Form.Item name="eligibility_status" label="Eligibility Status">
                <Select
                  options={[
                    { value: 'verified', label: 'Verified' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'pending', label: 'Pending' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="eligibility_notes" label="Eligibility Notes">
                <Input.TextArea rows={3} placeholder="Add any verification notes or eligibility checks." />
              </Form.Item>
              <Form.Item name="rejection_reason" label="Rejection Reason (if rejecting)">
                <Input placeholder="Reason for rejection" />
              </Form.Item>
            </Form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

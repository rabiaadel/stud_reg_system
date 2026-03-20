import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Button,
  Table,
  message,
  Spin,
  Tag,
  Modal,
  Alert,
  Row,
  Col,
  Empty,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { studentService, courseService } from '../services/api';

export const RegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [eligibilityInfo, setEligibilityInfo] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eligibility, courses] = await Promise.all([
          studentService.checkEligibility(),
          courseService.getCourses(),
        ]);

        setEligibilityInfo(eligibility);
        setAvailableCourses(courses);

        // Fetch current registrations
        if (eligibility.is_eligible) {
          // Mock fetch registrations
          setRegistrations([]);
        }
      } catch (error) {
        message.error('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegisterCourses = async (values) => {
    if (selectedCourses.length === 0) {
      message.warning('Please select at least one course');
      return;
    }
    if (!eligibilityInfo?.semester?.id) {
      message.warning('No active semester found for registration');
      return;
    }

    setLoading(true);
    try {
      await studentService.registerCourses({
        course_ids: selectedCourses.map((course) => course.course_id),
        semester_id: eligibilityInfo.semester.id,
      });

      message.success('Courses registered successfully');
      setShowAddModal(false);
      setSelectedCourses([]);
      form.resetFields();

      // Refresh registrations
      // fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Failed to register courses'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawCourse = async (courseId) => {
    if (!eligibilityInfo?.semester?.id) {
      message.warning('No active semester found for withdrawal');
      return;
    }
    setLoading(true);
    try {
      await studentService.withdrawCourse({
        course_id: courseId,
        semester_id: eligibilityInfo.semester.id,
        reason: 'Student withdrawal request',
        is_excused: false,
      });
      message.success('Course withdrawn successfully');
      // Refresh registrations
      // fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Failed to withdraw course'
      );
    } finally {
      setLoading(false);
    }
  };

  const registrationColumns = [
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      key: 'course_code',
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      key: 'course_name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (text) => <Tag color="blue" className="px-3 rounded-full font-bold">{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'registration_status',
      key: 'registration_status',
      render: (text) => (
        <Tag
          color={text === 'registered' ? 'success' : 'warning'}
          icon={text === 'registered' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          className="px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-xs"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Registration Date',
      dataIndex: 'registration_date',
      key: 'registration_date',
      render: (text) => <span className="text-gray-500">{new Date(text).toLocaleDateString()}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Withdraw Course"
          description="Are you sure you want to withdraw from this course? This action cannot be undone."
          onConfirm={() => handleWithdrawCourse(record.course_id)}
          okText="Yes, withdraw"
          cancelText="No, keep it"
          okButtonProps={{ danger: true, className: "rounded-lg" }}
          cancelButtonProps={{ className: "rounded-lg border-gray-300" }}
        >
          <Button
            danger
            type="text"
            className="hover:bg-red-50 rounded-lg text-red-500 font-medium"
            icon={<DeleteOutlined />}
            loading={loading}
          >
            Withdraw
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading && !eligibilityInfo) {
      return (
          <div className="flex justify-center items-center h-96">
             <Spin size="large" className="text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Course Registration
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your academic schedule and enroll in new classes.</p>
      </div>

      {/* Eligibility Alert */}
      {eligibilityInfo && (
        <div className={`p-4 rounded-xl border ${eligibilityInfo.is_eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} flex items-start gap-4 mb-6 shadow-sm`}>
            {eligibilityInfo.is_eligible ? (
                <CheckCircleOutlined className="text-2xl text-green-500 mt-0.5" />
            ) : (
                <ExclamationCircleOutlined className="text-2xl text-red-500 mt-0.5" />
            )}
            <div>
               <h3 className={`font-bold text-lg ${eligibilityInfo.is_eligible ? 'text-green-800' : 'text-red-800'}`}>
                   {eligibilityInfo.is_eligible ? 'Registration is Open' : 'Action Required: Registration Blocked'}
               </h3>
               <p className={`mt-1 ${eligibilityInfo.is_eligible ? 'text-green-700' : 'text-red-700'}`}>
                   {eligibilityInfo.reason || (eligibilityInfo.is_eligible ? 'You are eligible to register for courses this semester.' : 'Please resolve any holds on your account to proceed.')}
               </p>
            </div>
        </div>
      )}

      {/* Eligibility Information */}
      {eligibilityInfo && (
         <div className="glass-panel p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                <InfoCircleOutlined className="text-primary" /> Registration Metrics
            </h2>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                     <p className="text-gray-500 text-sm font-medium mb-1">Current GPA</p>
                     <p className="text-2xl font-bold text-gray-800">
                        {eligibilityInfo.current_gpa?.toFixed(2) || 'N/A'}
                     </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                     <p className="text-gray-500 text-sm font-medium mb-1">Credits Completed</p>
                     <p className="text-2xl font-bold text-gray-800">
                        {eligibilityInfo.credits_completed || 0}
                     </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                     <p className="text-gray-500 text-sm font-medium mb-1">Max Credits Available</p>
                     <p className="text-2xl font-bold text-primary">
                        {eligibilityInfo.max_credits_available || 0}
                     </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full flex flex-col justify-center">
                     <p className="text-gray-500 text-sm font-medium mb-2">Standing Status</p>
                     <div>
                         <Tag color={eligibilityInfo.is_eligible ? 'success' : 'error'} className="px-3 py-1 rounded-full font-bold text-sm">
                            {eligibilityInfo.status || (eligibilityInfo.is_eligible ? 'GOOD STANDING' : 'ON HOLD')}
                         </Tag>
                     </div>
                  </div>
                </Col>
            </Row>
         </div>
      )}

      {/* Current Registrations */}
      <div className="glass-panel p-6 shadow-sm">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
             <div>
                <h2 className="text-xl font-bold text-gray-800">Your Class Schedule</h2>
                <p className="text-gray-500 mt-1">Courses you are currently enrolled in for this term.</p>
             </div>
             {eligibilityInfo?.is_eligible && (
               <Button
                 type="primary"
                 icon={<PlusOutlined />}
                 onClick={() => setShowAddModal(true)}
                 size="large"
                 className="bg-gradient-to-r from-primary to-primary-light border-0 shadow-neon-primary rounded-lg font-semibold px-6"
               >
                 Register New Course
               </Button>
             )}
         </div>

         {registrations && registrations.length > 0 ? (
           <Table
             className="bg-transparent"
             columns={registrationColumns}
             dataSource={registrations}
             rowKey="course_id"
             pagination={false}
             scroll={{ x: 800 }}
             rowClassName="hover:bg-primary/5 transition-colors"
           />
         ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-50/50">
               <Empty
                 image={Empty.PRESENTED_IMAGE_SIMPLE}
                 description={
                   <span className="text-gray-400 font-medium">No courses registered yet. Click 'Register New Course' to begin.</span>
                 }
               />
            </div>
         )}
      </div>

      {/* Add Courses Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
             <PlusOutlined className="text-primary text-xl" />
             <span className="text-xl font-display font-bold text-gray-800">Course Catalog</span>
          </div>
        }
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setSelectedCourses([]);
          form.resetFields();
        }}
        width={900}
        closeIcon={<span className="text-gray-400 hover:text-gray-700 transition-colors">✕</span>}
        className="rounded-2xl overflow-hidden glass-modal"
        footer={
           <div className="flex justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-100 mt-4 rounded-b-2xl">
              <span className="text-gray-500 font-medium font-mono bg-white px-3 py-1 rounded border border-gray-200">
                 {selectedCourses.length} selected
              </span>
              <div className="space-x-3">
                  <Button key="cancel" onClick={() => setShowAddModal(false)} className="rounded-lg font-medium border-gray-300">
                    Cancel
                  </Button>
                  <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={() => handleRegisterCourses({})}
                    disabled={selectedCourses.length === 0}
                    className="bg-gradient-to-r from-success to-emerald-400 border-0 shadow-sm rounded-lg font-semibold px-6 disabled:opacity-50"
                  >
                    Confirm Registration
                  </Button>
              </div>
           </div>
        }
      >
        <Spin spinning={loading} className="py-8">
          <div className="space-y-4 mt-6">
            <Table
              className="border border-gray-100 rounded-xl overflow-hidden"
              columns={[
                {
                  title: 'Course Code',
                  dataIndex: 'course_code',
                  key: 'course_code',
                  width: '20%',
                  render: (text) => <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">{text}</span>
                },
                {
                  title: 'Course Title',
                  dataIndex: 'course_name',
                  key: 'course_name',
                  width: '40%',
                  render: (text) => <span className="font-medium">{text}</span>
                },
                {
                  title: 'Credits',
                  dataIndex: 'credits',
                  key: 'credits',
                  width: '15%',
                  render: (text) => <Tag color="blue" className="rounded-full font-bold">{text}</Tag>
                },
                {
                  title: 'Doctor',
                  dataIndex: 'instructor',
                  key: 'instructor',
                  width: '25%',
                  render: (text) => <span className="text-gray-600">{text || 'TBD'}</span>
                },
              ]}
              dataSource={availableCourses}
              rowKey="course_id"
              pagination={{
                  pageSize: 5,
                  className: "px-4 pb-2"
              }}
              rowSelection={{
                selectedRowKeys: selectedCourses.map((c) => c.course_id),
                onChange: (selectedKeys, selectedRows) => {
                  setSelectedCourses(selectedRows);
                },
              }}
              scroll={{ x: 600 }}
              rowClassName={(record) => selectedCourses.find(c => c.course_id === record.course_id) ? 'bg-primary/5' : ''}
            />
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

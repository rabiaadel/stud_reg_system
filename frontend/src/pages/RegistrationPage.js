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

    setLoading(true);
    try {
      await studentService.registerCourses({
        course_ids: selectedCourses.map((course) => course.course_id),
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
    setLoading(true);
    try {
      await studentService.withdrawCourse(courseId);
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
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      key: 'course_name',
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'registration_status',
      key: 'registration_status',
      render: (text) => (
        <Tag
          color={text === 'registered' ? 'green' : 'orange'}
          icon={text === 'registered' ? <CheckCircleOutlined /> : null}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Registration Date',
      dataIndex: 'registration_date',
      key: 'registration_date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Withdraw Course"
          description="Are you sure you want to withdraw this course?"
          onConfirm={() => handleWithdrawCourse(record.course_id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={loading}
          >
            Withdraw
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Course Registration</h1>
        <p className="text-gray-500 mt-2">Manage your course registrations</p>
      </div>

      {/* Eligibility Alert */}
      {eligibilityInfo && (
        <Alert
          message={
            eligibilityInfo.is_eligible
              ? 'You are eligible to register'
              : 'You are not eligible to register'
          }
          type={eligibilityInfo.is_eligible ? 'success' : 'error'}
          showIcon
          description={eligibilityInfo.reason || ''}
        />
      )}

      {/* Eligibility Information */}
      {eligibilityInfo && (
        <Card title="Registration Eligibility">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <p className="text-gray-600 text-sm">Current GPA</p>
              <p className="text-lg font-semibold">
                {eligibilityInfo.current_gpa?.toFixed(2) || 'N/A'}
              </p>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <p className="text-gray-600 text-sm">Credits Completed</p>
              <p className="text-lg font-semibold">
                {eligibilityInfo.credits_completed}
              </p>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <p className="text-gray-600 text-sm">Max Credits Available</p>
              <p className="text-lg font-semibold">
                {eligibilityInfo.max_credits_available}
              </p>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <p className="text-gray-600 text-sm">Status</p>
              <Tag
                color={eligibilityInfo.is_eligible ? 'green' : 'red'}
              >
                {eligibilityInfo.status}
              </Tag>
            </Col>
          </Row>
        </Card>
      )}

      {/* Current Registrations */}
      <Card
        title="Your Registrations"
        extra={
          eligibilityInfo?.is_eligible && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
            >
              Add Courses
            </Button>
          )
        }
        loading={loading}
      >
        {registrations && registrations.length > 0 ? (
          <Table
            columns={registrationColumns}
            dataSource={registrations}
            rowKey="course_id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty description="No courses registered yet" />
        )}
      </Card>

      {/* Add Courses Modal */}
      <Modal
        title="Register Courses"
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setSelectedCourses([]);
          form.resetFields();
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => handleRegisterCourses({})}
          >
            Register Selected Courses
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Selected: {selectedCourses.length} course(s)
            </p>

            <Table
              columns={[
                {
                  title: 'Course Code',
                  dataIndex: 'course_code',
                  key: 'course_code',
                  width: '20%',
                },
                {
                  title: 'Course Name',
                  dataIndex: 'course_name',
                  key: 'course_name',
                  width: '40%',
                },
                {
                  title: 'Credits',
                  dataIndex: 'credits',
                  key: 'credits',
                  width: '15%',
                },
                {
                  title: 'Instructor',
                  dataIndex: 'instructor',
                  key: 'instructor',
                  width: '25%',
                },
              ]}
              dataSource={availableCourses}
              rowKey="course_id"
              pagination={{ pageSize: 5 }}
              rowSelection={{
                selectedRowKeys: selectedCourses.map((c) => c.course_id),
                onChange: (selectedKeys, selectedRows) => {
                  setSelectedCourses(selectedRows);
                },
              }}
              scroll={{ x: 600 }}
            />
          </div>
        </Spin>
      </Modal>
    </div>
  );
};
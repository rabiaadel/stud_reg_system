import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Spin,
  message,
  Empty,
} from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { studentService } from '../services/api';
import { useStudentStore } from '../store';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [academicStanding, setAcademicStanding] = useState(null);
  const { student, grades } = useStudentStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profile, standing] = await Promise.all([
          studentService.getProfile(),
          studentService.getAcademicStanding(),
        ]);

        setStudentProfile(profile);
        setAcademicStanding(standing);
      } catch (error) {
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const standingStatus = academicStanding?.warning_issued
    ? 'warning'
    : academicStanding?.is_dismissed
    ? 'error'
    : 'success';

  const standingColor =
    standingStatus === 'success'
      ? 'green'
      : standingStatus === 'warning'
      ? 'orange'
      : 'red';

  const statusIcon =
    standingStatus === 'success'
      ? CheckCircleOutlined
      : standingStatus === 'warning'
      ? ClockCircleOutlined
      : CloseCircleOutlined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, {studentProfile?.full_name}!
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Current GPA"
              value={academicStanding?.cgpa?.toFixed(2) || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Credits Earned"
              value={academicStanding?.total_credits_earned || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Registered Courses"
              value={grades?.length || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Academic Standing"
              value={
                academicStanding?.is_dismissed
                  ? 'Dismissed'
                  : academicStanding?.warning_issued
                  ? 'Warning'
                  : 'Good'
              }
              prefix={React.createElement(statusIcon)}
              valueStyle={{ color: standingColor }}
            />
          </Card>
        </Col>
      </Row>

      {/* Profile Information */}
      <Card title="Student Information" loading={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <p className="text-gray-600 text-sm">Student ID</p>
            <p className="text-lg font-semibold">{studentProfile?.student_id}</p>
          </Col>
          <Col xs={24} sm={12}>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-lg font-semibold">{studentProfile?.email}</p>
          </Col>
          <Col xs={24} sm={12}>
            <p className="text-gray-600 text-sm">Department</p>
            <p className="text-lg font-semibold">
              {studentProfile?.department}
            </p>
          </Col>
          <Col xs={24} sm={12}>
            <p className="text-gray-600 text-sm">Specialization</p>
            <p className="text-lg font-semibold">
              {studentProfile?.specialization}
            </p>
          </Col>
          <Col xs={24} sm={12}>
            <p className="text-gray-600 text-sm">Academic Level</p>
            <p className="text-lg font-semibold">
              {studentProfile?.academic_level}
            </p>
          </Col>
          <Col xs={24} sm={12}>
            <p className="text-gray-600 text-sm">Enrollment Status</p>
            <Tag
              color={
                studentProfile?.enrollment_status === 'active'
                  ? 'green'
                  : 'red'
              }
            >
              {studentProfile?.enrollment_status}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Recent Grades */}
      {grades && grades.length > 0 ? (
        <Card title="Recent Grades" loading={loading}>
          <Table
            dataSource={grades.slice(0, 5)}
            columns={[
              {
                title: 'Course Code',
                dataIndex: 'course_code',
                key: 'course_code',
              },
              {
                title: 'Course Name',
                dataIndex: 'course_name',
                key: 'course_name',
              },
              {
                title: 'Grade',
                dataIndex: 'grade_letter',
                key: 'grade_letter',
                render: (text) => <Tag color="blue">{text}</Tag>,
              },
              {
                title: 'Score',
                dataIndex: 'final_score',
                key: 'final_score',
                render: (text) => `${text?.toFixed(2) || 0}%`,
              },
            ]}
            pagination={false}
            rowKey="student_grade_id"
          />
        </Card>
      ) : (
        <Card loading={loading}>
          <Empty description="No grades available yet" />
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <a href="/registration">
              <Card
                hoverable
                className="text-center h-full flex flex-col justify-center items-center"
              >
                <BookOutlined className="text-3xl text-blue-500 mb-2" />
                <p className="font-semibold">Register Courses</p>
              </Card>
            </a>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <a href="/courses">
              <Card
                hoverable
                className="text-center h-full flex flex-col justify-center items-center"
              >
                <TeamOutlined className="text-3xl text-green-500 mb-2" />
                <p className="font-semibold">View Courses</p>
              </Card>
            </a>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <a href="/grades">
              <Card
                hoverable
                className="text-center h-full flex flex-col justify-center items-center"
              >
                <TrophyOutlined className="text-3xl text-yellow-500 mb-2" />
                <p className="font-semibold">View Grades</p>
              </Card>
            </a>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <a href="/academic-standing">
              <Card
                hoverable
                className="text-center h-full flex flex-col justify-center items-center"
              >
                <CheckCircleOutlined className="text-3xl text-purple-500 mb-2" />
                <p className="font-semibold">Academic Status</p>
              </Card>
            </a>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
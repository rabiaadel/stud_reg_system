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
      <div className="flex justify-center items-center h-96">
        <Spin size="large" className="text-primary" />
      </div>
    );
  }

  const standingStatus = academicStanding?.warning_issued
    ? 'warning'
    : academicStanding?.is_dismissed
    ? 'error'
    : 'success';

  const fullName = studentProfile
    ? `${studentProfile.first_name_en || ''} ${studentProfile.last_name_en || ''}`.trim()
    : '';

  const enrollmentStatus = studentProfile
    ? (studentProfile.is_active ? (studentProfile.is_dismissed ? 'dismissed' : 'active') : 'inactive')
    : 'inactive';

  const standingColor =
    standingStatus === 'success'
      ? 'text-success'
      : standingStatus === 'warning'
      ? 'text-warning'
      : 'text-error';

  const statusIcon =
    standingStatus === 'success'
      ? CheckCircleOutlined
      : standingStatus === 'warning'
      ? ClockCircleOutlined
      : CloseCircleOutlined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Student Dashboard
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Welcome back, <span className="text-gray-800 font-semibold">{fullName || 'Student'}</span>! Here's your academic overview.
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <BookOutlined className="text-4xl text-primary mb-3" />
             <div className="text-3xl font-bold text-gray-800">{academicStanding?.cgpa?.toFixed(2) || 0}</div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Current GPA</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <TrophyOutlined className="text-4xl text-success mb-3" />
             <div className="text-3xl font-bold text-gray-800">{academicStanding?.total_credits_earned || studentProfile?.total_credits_passed || 0}</div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Credits Earned</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <BookOutlined className="text-4xl text-warning mb-3" />
             <div className="text-3xl font-bold text-gray-800">{grades?.length || 0}</div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Registered Courses</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className={`absolute -right-4 -top-4 w-24 h-24 ${standingStatus === 'success' ? 'bg-success/10' : 'bg-error/10'} rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
             {React.createElement(statusIcon, { className: `text-4xl ${standingColor} mb-3` })}
             <div className="text-xl font-bold text-gray-800 text-center mt-2">
                 {academicStanding?.is_dismissed ? 'Dismissed' : academicStanding?.warning_issued ? 'Warning' : 'Good Standing'}
             </div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Academic Status</div>
          </div>
        </Col>
      </Row>

      {/* Profile Information & Recent Grades Row */}
      <Row gutter={[24, 24]} className="mt-2">
        <Col xs={24} lg={10}>
          <div className="glass-panel p-6 h-full">
             <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Student Information</h2>
             <div className="space-y-4">
                 <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-lg">
                    <span className="text-gray-500 font-medium">Student ID</span>
                    <span className="font-semibold text-gray-800">{studentProfile?.student_id}</span>
                 </div>
                 <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-lg">
                    <span className="text-gray-500 font-medium">Department</span>
                    <span className="font-semibold text-gray-800">{studentProfile?.department_name || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-lg">
                    <span className="text-gray-500 font-medium">Specialization</span>
                    <span className="font-semibold text-gray-800">{studentProfile?.specialization_name || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-lg">
                    <span className="text-gray-500 font-medium">Academic Level</span>
                    <span className="font-semibold text-primary">{studentProfile?.current_level || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-lg">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className={`font-semibold ${enrollmentStatus === 'active' ? 'text-success' : 'text-error'}`}>
                        {enrollmentStatus.toUpperCase()}
                    </span>
                 </div>
             </div>
          </div>
        </Col>

        {/* Recent Grades */}
        <Col xs={24} lg={14}>
            <div className="glass-panel p-6 h-full">
             <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Recent Performance</h2>
              {grades && grades.length > 0 ? (
                  <Table
                    dataSource={grades.slice(0, 5)}
                    className="bg-transparent"
                    columns={[
                      {
                        title: 'Course Code',
                        dataIndex: 'course_code',
                        key: 'course_code',
                        render: (text) => <span className="font-semibold text-gray-700">{text}</span>
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
                        render: (text) => <Tag color={text?.includes('A') ? 'green' : text?.includes('B') ? 'blue' : 'orange'} className="font-bold">{text}</Tag>,
                      },
                      {
                        title: 'Score',
                        dataIndex: 'final_score',
                        key: 'final_score',
                        render: (text) => <span className="font-medium">{text?.toFixed(2) || 0}%</span>,
                      },
                    ]}
                    pagination={false}
                    rowKey="student_grade_id"
                  />
              ) : (
                <div className="flex flex-col justify-center items-center h-48">
                    <Empty description={<span className="text-gray-400">No grades available yet</span>} />
                </div>
              )}
            </div>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="glass-panel p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Quick Actions</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <a href="/registration" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full">
                <BookOutlined className="text-3xl text-primary mb-2" />
                <p className="font-semibold text-primary-dark">Register Courses</p>
              </div>
            </a>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <a href="/courses" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full">
                <TeamOutlined className="text-3xl text-green-500 mb-2" />
                <p className="font-semibold text-green-800">View Catalog</p>
              </div>
            </a>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <a href="/grades" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full">
                <TrophyOutlined className="text-3xl text-orange-500 mb-2" />
                <p className="font-semibold text-orange-800">Transcript</p>
              </div>
            </a>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <a href="/academic-standing" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 border border-secondary/20 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full">
                <CheckCircleOutlined className="text-3xl text-secondary mb-2" />
                <p className="font-semibold text-secondary-dark">Standing</p>
              </div>
            </a>
          </Col>
        </Row>
      </div>
    </div>
  );
};

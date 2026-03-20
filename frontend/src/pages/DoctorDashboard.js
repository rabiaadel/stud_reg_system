import React, { useEffect, useState } from 'react';
import { Table, Spin, message, Tag, Row, Col } from 'antd';
import { BookOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { instructorService, semesterService } from '../services/api';
import { useAuthStore } from '../store';

export const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.profile_id || !user?.faculty_id) return;
      setLoading(true);
      try {
        const semester = await semesterService.getActiveSemester(user.faculty_id);
        setActiveSemester(semester);

        if (!semester?.id) {
          setAssignments([]);
          return;
        }

        const data = await instructorService.getAssignments(user.profile_id, { semester_id: semester.id });
        setAssignments(data || []);
      } catch (error) {
        message.error('Failed to load doctor assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user?.profile_id, user?.faculty_id]);

  const assignmentColumns = [
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
      render: (text) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: (text) => <Tag color="blue" className="rounded-md">{text || 'A'}</Tag>,
    },
    {
      title: 'Enrollment',
      dataIndex: 'current_enrollment',
      key: 'current_enrollment',
      render: (text) => <span className="font-mono">{text || 0}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Doctor Dashboard
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Welcome back, {user?.name || 'Doctor'}.
        </p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <div className="glass-card p-6 flex items-center gap-4">
            <BookOutlined className="text-3xl text-primary" />
            <div>
              <div className="text-sm text-gray-500">Assigned Courses</div>
              <div className="text-2xl font-bold text-gray-800">{assignments.length}</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div className="glass-card p-6 flex items-center gap-4">
            <CalendarOutlined className="text-3xl text-primary" />
            <div>
              <div className="text-sm text-gray-500">Active Semester</div>
              <div className="text-xl font-bold text-gray-800">
                {activeSemester ? `${activeSemester.semester_name} ${activeSemester.academic_year}` : 'Not set'}
              </div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div className="glass-card p-6 flex items-center gap-4">
            <TeamOutlined className="text-3xl text-primary" />
            <div>
              <div className="text-sm text-gray-500">Total Enrollment</div>
              <div className="text-2xl font-bold text-gray-800">
                {assignments.reduce((sum, item) => sum + (item.current_enrollment || 0), 0)}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <div className="glass-panel p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
          Current Teaching Assignments
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Spin size="large" className="text-primary" />
          </div>
        ) : (
          <Table
            className="bg-transparent"
            columns={assignmentColumns}
            dataSource={assignments}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
    </div>
  );
};

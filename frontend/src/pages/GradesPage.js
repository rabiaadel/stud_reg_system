import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Spin,
  message,
  Empty,
  Select,
} from 'antd';
import { BarChartOutlined, TrophyOutlined } from '@ant-design/icons';
import { studentService } from '../services/api';
import { useStudentStore } from '../store';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const GradesPage = () => {
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const { grades: storeGrades, setStudentGrades } = useStudentStore();

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await studentService.getStudentGrades();
        setGrades(data);
        setStudentGrades(data);
      } catch (error) {
        message.error('Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [setStudentGrades]);

  const filteredGrades =
    selectedSemester === 'all'
      ? grades
      : grades.filter((grade) => grade.semester_id === selectedSemester);

  // Calculate statistics
  const stats = {
    totalCourses: filteredGrades.length,
    averageScore:
      filteredGrades.length > 0
        ? (filteredGrades.reduce((sum, g) => sum + (g.final_score || 0), 0) /
            filteredGrades.length).toFixed(2)
        : 0,
    passedCourses: filteredGrades.filter(
      (g) => g.final_score >= 60
    ).length,
    gpa:
      filteredGrades.length > 0
        ? (filteredGrades.reduce((sum, g) => sum + (g.grade_point || 0), 0) /
            filteredGrades.length).toFixed(2)
        : 0,
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'orange';
    if (score >= 60) return 'volcano';
    return 'red';
  };

  const gradeLetter = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const gradeColumns = [
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      key: 'course_code',
      width: '15%',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      key: 'course_name',
      width: '30%',
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      width: '10%',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Coursework',
      dataIndex: 'coursework_score',
      key: 'coursework_score',
      width: '12%',
      render: (text) => `${text?.toFixed(2) || 0}%`,
    },
    {
      title: 'Final Exam',
      dataIndex: 'final_exam_score',
      key: 'final_exam_score',
      width: '12%',
      render: (text) => `${text?.toFixed(2) || 0}%`,
    },
    {
      title: 'Final Score',
      dataIndex: 'final_score',
      key: 'final_score',
      width: '12%',
      render: (text) => (
        <Tag color={getGradeColor(text)} className="text-base">
          {text?.toFixed(2) || 0}%
        </Tag>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade_letter',
      key: 'grade_letter',
      width: '9%',
      render: (text, record) => (
        <Tag
          color={getGradeColor(record.final_score)}
          className="text-base font-bold"
        >
          {text || gradeLetter(record.final_score)}
        </Tag>
      ),
    },
  ];

  // Prepare chart data
  const chartData = {
    labels: filteredGrades.slice(0, 10).map((g) => g.course_code),
    datasets: [
      {
        label: 'Final Score',
        data: filteredGrades.slice(0, 10).map((g) => g.final_score),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: filteredGrades.slice(0, 10).map((g) => g.course_code),
    datasets: [
      {
        label: 'Coursework (40%)',
        data: filteredGrades.slice(0, 10).map((g) => g.coursework_score),
        backgroundColor: '#1890ff',
      },
      {
        label: 'Final Exam (60%)',
        data: filteredGrades.slice(0, 10).map((g) => g.final_exam_score),
        backgroundColor: '#52c41a',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Grades</h1>
        <p className="text-gray-500 mt-2">View your academic performance</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Courses"
              value={stats.totalCourses}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Average Score"
              value={stats.averageScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Passed Courses"
              value={stats.passedCourses}
              suffix={`/ ${stats.totalCourses}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="GPA"
              value={stats.gpa}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      {filteredGrades.length > 0 && (
        <>
          <Card title="Grade Trend" loading={loading}>
            <Line data={chartData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                },
              },
            }} />
          </Card>

          <Card title="Assessment Breakdown" loading={loading}>
            <Bar data={barData} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                },
              },
            }} />
          </Card>
        </>
      )}

      {/* Filters */}
      {grades.length > 0 && (
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Select
                placeholder="Filter by semester"
                value={selectedSemester}
                onChange={setSelectedSemester}
                options={[
                  { label: 'All Semesters', value: 'all' },
                  { label: 'Fall 2023', value: '1' },
                  { label: 'Spring 2024', value: '2' },
                ]}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Grades Table */}
      {filteredGrades && filteredGrades.length > 0 ? (
        <Card title="Grade Details" loading={loading}>
          <Table
            columns={gradeColumns}
            dataSource={filteredGrades}
            rowKey="student_grade_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showTotal: (total) => `Total ${total} grades`,
            }}
            scroll={{ x: 900 }}
          />
        </Card>
      ) : (
        <Card loading={loading}>
          <Empty description="No grades available" />
        </Card>
      )}
    </div>
  );
};
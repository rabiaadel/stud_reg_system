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
import { BarChartOutlined, TrophyOutlined, RiseOutlined, FileDoneOutlined } from '@ant-design/icons';
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
    if (score >= 60) return '#faad14';
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
      render: (text) => <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">{text}</span>,
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      key: 'course_name',
      width: '30%',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      width: '10%',
      render: (text) => <Tag color="blue" className="rounded-full px-2 font-bold">{text}</Tag>,
    },
    {
      title: 'Coursework',
      dataIndex: 'coursework_score',
      key: 'coursework_score',
      width: '12%',
      render: (text) => <span className="text-gray-600 font-medium">{text?.toFixed(2) || 0}%</span>,
    },
    {
      title: 'Final Exam',
      dataIndex: 'final_exam_score',
      key: 'final_exam_score',
      width: '12%',
      render: (text) => <span className="text-gray-600 font-medium">{text?.toFixed(2) || 0}%</span>,
    },
    {
      title: 'Final Score',
      dataIndex: 'final_score',
      key: 'final_score',
      width: '12%',
      render: (text) => (
        <span className="font-bold text-gray-800">
          {text?.toFixed(2) || 0}%
        </span>
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
          className="text-lg font-bold px-3 py-1 rounded-lg"
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
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: "'Inter', sans-serif", size: 14, weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif", size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b' }
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b' }
        }
      },
  };

  const barData = {
    labels: filteredGrades.slice(0, 10).map((g) => g.course_code),
    datasets: [
      {
        label: 'Coursework',
        data: filteredGrades.slice(0, 10).map((g) => g.coursework_score),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'Final Exam',
        data: filteredGrades.slice(0, 10).map((g) => g.final_exam_score),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { boxWidth: 12, usePointStyle: true, font: { family: "'Inter', sans-serif" } }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: "'Inter', sans-serif", size: 14, weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif", size: 13 },
            padding: 12,
            cornerRadius: 8,
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            stacked: true,
            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
            ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b' }
          },
          x: {
            stacked: true,
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b' }
          }
        },
  };

  if (loading && grades.length === 0) {
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
            Academic Performance
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Review your grades, transcripts, and academic progress over time.</p>
      </div>

      {/* Statistics Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <BarChartOutlined className="text-4xl text-primary mb-3" />
             <div className="text-3xl font-bold text-gray-800">{stats.totalCourses}</div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Total Courses</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <TrophyOutlined className="text-4xl text-yellow-500 mb-3" />
             <div className="flex items-baseline gap-1">
                 <div className="text-3xl font-bold text-gray-800">{stats.averageScore}</div>
                 <div className="text-lg font-bold text-gray-500">%</div>
             </div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Average Score</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <FileDoneOutlined className="text-4xl text-green-500 mb-3" />
             <div className="flex items-baseline gap-2">
                 <div className="text-3xl font-bold text-gray-800">{stats.passedCourses}</div>
                 <div className="text-lg font-semibold text-gray-400">/ {stats.totalCourses}</div>
             </div>
             <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Passed Courses</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full group bg-gradient-to-br from-secondary/5 to-secondary/15">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <RiseOutlined className="text-4xl text-secondary mb-3" />
             <div className="text-3xl font-bold text-secondary-dark">{stats.gpa}</div>
             <div className="text-sm font-bold text-secondary uppercase tracking-wider mt-1">Cumulative GPA</div>
          </div>
        </Col>
      </Row>

      {/* Charts */}
      {filteredGrades.length > 0 && (
        <Row gutter={[24, 24]} className="mt-6">
            <Col xs={24} lg={12}>
              <div className="glass-panel p-6 shadow-sm h-full">
                 <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Score Distribution Trend</h2>
                 <div className="h-64 mt-4 w-full">
                    <Line data={chartData} options={chartOptions} />
                 </div>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="glass-panel p-6 shadow-sm h-full">
                 <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Assessment Breakdown</h2>
                 <div className="h-64 mt-4 w-full">
                    <Bar data={barData} options={barOptions} />
                 </div>
              </div>
            </Col>
        </Row>
      )}

      {/* Filters */}
      <div className="glass-panel p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
          <div className="font-semibold text-gray-700 whitespace-nowrap">Filter Transcripts</div>
          <Select
            className="w-full sm:w-64"
            size="large"
            value={selectedSemester}
            onChange={setSelectedSemester}
            options={[
              { label: 'All Semesters', value: 'all' },
              { label: 'Fall 2023', value: '1' },
              { label: 'Spring 2024', value: '2' },
            ]}
          />
      </div>

      {/* Grades Table */}
      <div className="glass-panel p-6 shadow-sm mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Detailed Transcript</h2>
          {filteredGrades && filteredGrades.length > 0 ? (
            <Table
              className="bg-transparent mt-4"
              columns={gradeColumns}
              dataSource={filteredGrades}
              rowKey="student_grade_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                showTotal: (total) => `Total ${total} entries`,
                className: "mt-4"
              }}
              scroll={{ x: 900 }}
              rowClassName="hover:bg-primary/5 transition-colors"
            />
          ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-50/50 mt-4">
               <Empty
                   image={Empty.PRESENTED_IMAGE_SIMPLE}
                   description={<span className="text-gray-400 font-medium">No grades available for the selected period</span>}
               />
            </div>
          )}
      </div>
    </div>
  );
};

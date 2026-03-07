import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Spin,
  message,
  Empty,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  TrendingUpOutlined,
} from '@ant-design/icons';
import { studentService } from '../services/api';
import { Line as LineChartComponent } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

export const ProgressPage = () => {
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [gpaHistory, setGpaHistory] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const data = await studentService.getProgressTracking();
        setProgressData(data);

        // Mock GPA history data
        setGpaHistory([
          { semester: 'Fall 2021', gpa: 2.8 },
          { semester: 'Spring 2022', gpa: 2.9 },
          { semester: 'Fall 2022', gpa: 3.1 },
          { semester: 'Spring 2023', gpa: 3.15 },
          { semester: 'Fall 2023', gpa: 3.2 },
          { semester: 'Spring 2024', gpa: 3.25 },
        ]);
      } catch (error) {
        message.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const chartData = {
    labels: gpaHistory.map((h) => h.semester),
    datasets: [
      {
        label: 'GPA',
        data: gpaHistory.map((h) => h.gpa),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#1890ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const progressColumns = [
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (text) => (
        <Tag color="blue" className="text-base">
          {text.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Credits Earned',
      dataIndex: 'credits_earned',
      key: 'credits_earned',
    },
    {
      title: 'Status',
      dataIndex: 'semester_status',
      key: 'semester_status',
      render: (text) => (
        <Tag
          color={text === 'completed' ? 'green' : 'orange'}
          icon={
            text === 'completed' ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )
          }
        >
          {text}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Academic Progress</h1>
        <p className="text-gray-500 mt-2">
          Track your academic journey and performance trends
        </p>
      </div>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Semesters Completed"
              value={gpaHistory.length}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Current GPA"
              value={gpaHistory[gpaHistory.length - 1]?.gpa.toFixed(2) || 0}
              suffix={
                gpaHistory.length > 1 &&
                gpaHistory[gpaHistory.length - 1]?.gpa >
                  gpaHistory[gpaHistory.length - 2]?.gpa ? (
                  <ArrowUpOutlined className="text-green-500" />
                ) : (
                  <ArrowDownOutlined className="text-red-500" />
                )
              }
              valueStyle={{
                color:
                  gpaHistory.length > 1 &&
                  gpaHistory[gpaHistory.length - 1]?.gpa >
                    gpaHistory[gpaHistory.length - 2]?.gpa
                    ? '#52c41a'
                    : '#1890ff',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Best GPA"
              value={
                Math.max(...gpaHistory.map((h) => h.gpa)).toFixed(2) || 0
              }
              prefix={<TrendingUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Credits"
              value={progressData?.total_credits_earned || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* GPA Trend Chart */}
      {gpaHistory.length > 0 && (
        <Card title="GPA Trend Over Time" loading={loading}>
          <div style={{ height: 400 }}>
            <LineChartComponent
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    min: 0,
                    max: 4.0,
                    ticks: {
                      callback: function (value) {
                        return value.toFixed(1);
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      )}

      {/* Semester Details */}
      <Card title="Semester Performance" loading={loading}>
        {gpaHistory && gpaHistory.length > 0 ? (
          <Table
            columns={progressColumns}
            dataSource={gpaHistory
              .map((h, i) => ({
                ...h,
                semester_status: i < gpaHistory.length - 1 ? 'completed' : 'current',
                credits_earned: 12 + Math.floor(Math.random() * 6),
                key: i,
              }))}
            pagination={false}
            rowKey="key"
          />
        ) : (
          <Empty description="No progress data available" />
        )}
      </Card>

      {/* Academic Milestones */}
      <Card title="Academic Milestones">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Credits Completed</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {progressData?.total_credits_earned || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {progressData?.total_credits_earned || 0} / 120 toward graduation
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Courses Passed</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {progressData?.courses_passed || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Successful course completions
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {progressData?.total_credits_earned
                  ? Math.round((progressData.total_credits_earned / 120) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Progress toward degree
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* GPA Analysis */}
      <Card title="GPA Analysis">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <p className="text-gray-600 text-sm mb-2">Average GPA</p>
            <p className="text-3xl font-bold text-blue-600">
              {gpaHistory.length > 0
                ? (
                    gpaHistory.reduce((sum, h) => sum + h.gpa, 0) /
                    gpaHistory.length
                  ).toFixed(2)
                : 0}
            </p>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <p className="text-gray-600 text-sm mb-2">Highest GPA</p>
            <p className="text-3xl font-bold text-green-600">
              {gpaHistory.length > 0
                ? Math.max(...gpaHistory.map((h) => h.gpa)).toFixed(2)
                : 0}
            </p>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <p className="text-gray-600 text-sm mb-2">Overall Trend</p>
            <p className="text-3xl font-bold text-purple-600">
              {gpaHistory.length > 1
                ? gpaHistory[gpaHistory.length - 1]?.gpa >
                  gpaHistory[gpaHistory.length - 2]?.gpa
                  ? '📈 Improving'
                  : '📉 Declining'
                : '➡️ Stable'}
            </p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
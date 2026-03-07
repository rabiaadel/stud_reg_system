import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Spin,
  message,
  Alert,
  Timeline,
  Empty,
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { studentService } from '../services/api';

export const AcademicStandingPage = () => {
  const [loading, setLoading] = useState(false);
  const [standing, setStanding] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchAcademicStanding = async () => {
      setLoading(true);
      try {
        const [standingData, historyData] = await Promise.all([
          studentService.getAcademicStanding(),
          studentService.getStandingHistory(),
        ]);

        setStanding(standingData);
        setHistory(historyData || []);
      } catch (error) {
        message.error('Failed to load academic standing');
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicStanding();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const statusIcon =
    standing?.is_dismissed || false
      ? CloseCircleOutlined
      : standing?.warning_issued
      ? WarningOutlined
      : CheckCircleOutlined;

  const statusColor =
    standing?.is_dismissed || false
      ? 'red'
      : standing?.warning_issued
      ? 'orange'
      : 'green';

  const statusText =
    standing?.is_dismissed || false
      ? 'Dismissed'
      : standing?.warning_issued
      ? 'Warning'
      : 'Good Standing';

  const warningColumns = [
    {
      title: 'Type',
      dataIndex: 'warning_type',
      key: 'warning_type',
      render: (text) => (
        <Tag color={text === 'probation' ? 'orange' : 'red'}>{text}</Tag>
      ),
    },
    {
      title: 'Date Issued',
      dataIndex: 'issued_date',
      key: 'issued_date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'is_resolved',
      key: 'is_resolved',
      render: (text) => (
        <Tag color={text ? 'green' : 'red'}>
          {text ? 'Resolved' : 'Pending'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Academic Standing</h1>
        <p className="text-gray-500 mt-2">
          Track your academic performance and status
        </p>
      </div>

      {/* Status Alert */}
      {standing && (
        <Alert
          message={statusText}
          type={statusColor === 'red' ? 'error' : statusColor === 'orange' ? 'warning' : 'success'}
          showIcon
          description={
            standing.is_dismissed
              ? 'You have been dismissed from the university.'
              : standing.warning_issued
              ? 'You are on academic warning. Please improve your academic performance.'
              : 'You are in good academic standing.'
          }
        />
      )}

      {/* Main Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Current GPA"
              value={standing?.cgpa?.toFixed(2) || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Credits Earned"
              value={standing?.total_credits_earned || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Courses Passed"
              value={standing?.courses_passed || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Status"
              value={statusText}
              prefix={React.createElement(statusIcon)}
              valueStyle={{ color: statusColor }}
            />
          </Card>
        </Col>
      </Row>

      {/* Current Status Card */}
      {standing && (
        <Card title="Standing Information" loading={loading}>
          <Row gutter={[32, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <p className="text-gray-600 text-sm mb-1">Academic Level</p>
              <p className="text-lg font-semibold">
                {standing.academic_level || 'N/A'}
              </p>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <p className="text-gray-600 text-sm mb-1">Enrollment Status</p>
              <Tag color={standing.enrollment_status === 'active' ? 'green' : 'red'}>
                {standing.enrollment_status}
              </Tag>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <p className="text-gray-600 text-sm mb-1">Warning Issued</p>
              <Tag color={standing.warning_issued ? 'orange' : 'green'}>
                {standing.warning_issued ? 'Yes' : 'No'}
              </Tag>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <p className="text-gray-600 text-sm mb-1">Is Dismissed</p>
              <Tag color={standing.is_dismissed ? 'red' : 'green'}>
                {standing.is_dismissed ? 'Yes' : 'No'}
              </Tag>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <p className="text-gray-600 text-sm mb-1">Last Updated</p>
              <p className="text-lg font-semibold">
                {new Date(standing.last_updated).toLocaleDateString()}
              </p>
            </Col>
          </Row>
        </Card>
      )}

      {/* Warnings Table */}
      {history && history.length > 0 ? (
        <Card title="Academic Standing History" loading={loading}>
          <Timeline
            items={history.map((record, index) => ({
              color:
                record.warning_type === 'probation'
                  ? 'orange'
                  : record.warning_type === 'dismissal'
                  ? 'red'
                  : 'green',
              children: (
                <div>
                  <p className="font-semibold">
                    {record.warning_type?.toUpperCase()} -{' '}
                    {new Date(record.issued_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">{record.reason}</p>
                  <Tag
                    color={record.is_resolved ? 'green' : 'orange'}
                    className="mt-2"
                  >
                    {record.is_resolved ? 'Resolved' : 'Pending'}
                  </Tag>
                </div>
              ),
            }))}
          />
        </Card>
      ) : (
        <Card title="Academic Standing History" loading={loading}>
          <Empty description="No warning history" />
        </Card>
      )}

      {/* Academic Requirements */}
      <Card title="Academic Requirements">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm">Minimum GPA Required</p>
              <p className="text-2xl font-bold text-blue-600">2.0</p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm">Minimum Credits/Semester</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-gray-600 text-sm">Maximum Credits/Semester</p>
              <p className="text-2xl font-bold text-orange-600">18</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
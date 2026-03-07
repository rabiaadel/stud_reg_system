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
  Alert,
  Progress,
  List,
  Empty,
  Button,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { studentService } from '../services/api';

export const GraduationPage = () => {
  const [loading, setLoading] = useState(false);
  const [graduationInfo, setGraduationInfo] = useState(null);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    const fetchGraduationInfo = async () => {
      setLoading(true);
      try {
        const data = await studentService.getGraduationEligibility();
        setGraduationInfo(data);

        // Mock requirements data
        setRequirements([
          {
            id: 1,
            name: 'Core Courses',
            required: 30,
            completed: 28,
            status: 'almost-complete',
          },
          {
            id: 2,
            name: 'Elective Courses',
            required: 12,
            completed: 10,
            status: 'in-progress',
          },
          {
            id: 3,
            name: 'General Education',
            required: 18,
            completed: 18,
            status: 'complete',
          },
          {
            id: 4,
            name: 'Capstone Project',
            required: 1,
            completed: 0,
            status: 'pending',
          },
          {
            id: 5,
            name: 'Minimum GPA',
            required: 2.0,
            completed: 3.2,
            status: 'complete',
          },
        ]);
      } catch (error) {
        message.error('Failed to load graduation information');
      } finally {
        setLoading(false);
      }
    };

    fetchGraduationInfo();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'almost-complete':
        return <ClockCircleOutlined className="text-orange-500" />;
      case 'in-progress':
        return <ClockCircleOutlined className="text-blue-500" />;
      default:
        return <CloseCircleOutlined className="text-gray-400" />;
    }
  };

  const overallHours =
    requirements.reduce((sum, req) => sum + req.required, 0) || 0;
  const completedHours =
    requirements.reduce((sum, req) => sum + req.completed, 0) || 0;
  const progressPercentage = Math.round((completedHours / overallHours) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Graduation Eligibility</h1>
        <p className="text-gray-500 mt-2">
          Track your progress toward graduation
        </p>
      </div>

      {/* Eligibility Alert */}
      {graduationInfo && (
        <Alert
          message={
            graduationInfo.is_eligible
              ? 'You are eligible for graduation'
              : 'You are not yet eligible for graduation'
          }
          type={graduationInfo.is_eligible ? 'success' : 'warning'}
          showIcon
          description={
            graduationInfo.is_eligible
              ? 'You have met all graduation requirements.'
              : 'Please review the requirements below to complete your degree.'
          }
        />
      )}

      {/* Overall Progress */}
      {graduationInfo && (
        <Card title="Graduation Progress" loading={loading}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <div className="text-center">
                <div className="inline-flex flex-col items-center justify-center h-48 w-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full">
                  <p className="text-gray-600 text-sm">Overall Progress</p>
                  <p className="text-4xl font-bold text-blue-600 my-2">
                    {progressPercentage}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {completedHours} / {overallHours} hours
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Credits Earned"
                      value={graduationInfo.credits_earned || 0}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Credits Required"
                      value={graduationInfo.credits_required || 120}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Current GPA"
                      value={graduationInfo.current_gpa?.toFixed(2) || 0}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Min GPA Required"
                      value={2.0}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      )}

      {/* Requirements Progress */}
      <Card title="Graduation Requirements" loading={loading}>
        {requirements && requirements.length > 0 ? (
          <List
            dataSource={requirements}
            renderItem={(requirement) => (
              <List.Item
                key={requirement.id}
                className="border-b last:border-b-0"
              >
                <List.Item.Meta
                  avatar={getStatusIcon(requirement.status)}
                  title={requirement.name}
                  description={`${requirement.completed} / ${requirement.required} ${
                    typeof requirement.required === 'number' &&
                    requirement.required > 10
                      ? 'credits'
                      : 'completed'
                  }`}
                />
                <div className="w-32">
                  <Progress
                    percent={Math.min(
                      100,
                      Math.round(
                        (requirement.completed / requirement.required) * 100
                      )
                    )}
                    size="small"
                    strokeColor={
                      requirement.status === 'complete'
                        ? '#52c41a'
                        : requirement.status === 'almost-complete'
                        ? '#faad14'
                        : requirement.status === 'in-progress'
                        ? '#1890ff'
                        : '#d9d9d9'
                    }
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No requirements data" />
        )}
      </Card>

      {/* Missing Requirements */}
      {graduationInfo && !graduationInfo.is_eligible && (
        <Card title="Missing Requirements" type="inner">
          <Alert
            message="Complete the following to graduate:"
            type="warning"
            showIcon
            className="mb-4"
          />
          <List
            dataSource={
              graduationInfo.missing_requirements || [
                'Complete 10 more credit hours',
                'Submit capstone project',
              ]
            }
            renderItem={(item) => (
              <List.Item>
                <CloseCircleOutlined className="text-red-500 mr-2" />
                <span className="text-red-600">{item}</span>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Graduation Documents */}
      <Card title="Graduation Documents">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable className="text-center">
              <BookOutlined className="text-3xl text-blue-500 mb-2" />
              <p className="font-semibold mb-3">Graduation Application</p>
              <Button type="primary" disabled={!graduationInfo?.is_eligible}>
                Apply
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable className="text-center">
              <TrophyOutlined className="text-3xl text-green-500 mb-2" />
              <p className="font-semibold mb-3">Degree Audit</p>
              <Button>Download</Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable className="text-center">
              <CheckCircleOutlined className="text-3xl text-purple-500 mb-2" />
              <p className="font-semibold mb-3">Transcript</p>
              <Button>Request</Button>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Important Dates */}
      <Card title="Important Dates">
        <List
          dataSource={[
            { title: 'Graduation Application Deadline', date: 'April 15, 2024' },
            { title: 'Final Exam Date', date: 'May 20, 2024' },
            { title: 'Graduation Ceremony', date: 'June 10, 2024' },
            { title: 'Diploma Mailing', date: 'July 1, 2024' },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={
                  <span className="text-lg font-semibold text-blue-600">
                    {item.date}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
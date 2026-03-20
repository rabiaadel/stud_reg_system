/**
 * RegistrationPage Component
 * Full-featured course registration with bylaw enforcement
 * Features:
 * - Real-time eligibility checking
 * - Prerequisite validation
 * - Credit limit enforcement
 * - Academic standing display
 * - Graduation eligibility indicator
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Badge, Modal, Tabs, Table, Tag, Alert, Spin, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import FormalLayout from '../components/layout/FormalLayout';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const RegistrationPage = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const studentId = localStorage.getItem('studentId');
  const semesterId = localStorage.getItem('currentSemesterId');

  // Fetch registration eligibility
  const { data: eligibilityData } = useQuery({
    queryKey: ['registrationEligibility', studentId, semesterId],
    queryFn: async () => {
      const { data } = await apiClient.get('/registrations/check-eligibility', {
        params: { studentId, semesterId }
      });
      return data;
    },
    enabled: !!studentId && !!semesterId
  });

  // Fetch available courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['availableCourses', studentId, semesterId],
    queryFn: async () => {
      const { data } = await apiClient.get('/registrations/available-courses', {
        params: { studentId, semesterId }
      });
      return data;
    },
    enabled: !!studentId && !!semesterId && eligibilityData?.eligibility?.eligible
  });

  // Fetch current registrations
  const { data: currentRegistrationsData } = useQuery({
    queryKey: ['studentRegistrations', studentId, semesterId],
    queryFn: async () => {
      const { data } = await apiClient.get('/registrations/my-courses', {
        params: { studentId, semesterId }
      });
      return data;
    },
    enabled: !!studentId && !!semesterId
  });

  // Fetch graduation eligibility
  const { data: graduationData } = useQuery({
    queryKey: ['graduationEligibility', studentId],
    queryFn: async () => {
      const { data } = await apiClient.get('/registrations/graduation-eligibility', {
        params: { studentId }
      });
      return data;
    },
    enabled: !!studentId
  });

  // Update total credits when courses are selected
  useEffect(() => {
    const total = selectedCourses.reduce((sum, courseId) => {
      const course = coursesData?.courses?.find(c => c.id === courseId);
      return sum + (course?.credit_hours || 0);
    }, 0);
    setTotalCredits(total);
  }, [selectedCourses, coursesData]);

  // Handle course selection
  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Handle course registration
  const handleRegisterCourses = async () => {
    try {
      setRegistering(true);
      const { data } = await apiClient.post('/registrations/register', {
        studentId,
        courseIds: selectedCourses,
        semesterId
      });

      if (data.success) {
        Alert.success('Courses registered successfully!');
        setSelectedCourses([]);
        // Refetch registrations
      } else {
        Alert.error('Registration failed: ' + data.message);
      }
    } catch (error) {
      Alert.error('Error registering courses: ' + error.message);
    } finally {
      setRegistering(false);
    }
  };

  // Render eligibility status badge
  const renderEligibilityStatus = () => {
    if (!eligibilityData) return null;

    const { eligible, blockers, warnings } = eligibilityData.eligibility;

    return (
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Registration Eligibility</h3>
          {eligible ? (
            <Badge color="green" text="ELIGIBLE" />
          ) : (
            <Badge color="red" text="NOT ELIGIBLE" />
          )}
        </div>

        {blockers && blockers.length > 0 && (
          <Alert
            message="Registration Blockers"
            description={blockers.map((b, idx) => (
              <div key={idx} className="mb-2">
                <strong>{b.code}:</strong> {b.message}
              </div>
            ))}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {warnings && warnings.length > 0 && (
          <Alert
            message="Warnings"
            description={warnings.map((w, idx) => (
              <div key={idx} className="mb-2">
                <strong>{w.code}:</strong> {w.message}
              </div>
            ))}
            type="warning"
            showIcon
          />
        )}
      </Card>
    );
  };

  // Render course table
  const courseColumns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: code => <strong>{code}</strong>
    },
    {
      title: 'Course Name',
      dataIndex: 'name_en',
      key: 'name_en',
      ellipsis: true
    },
    {
      title: 'Credits',
      dataIndex: 'credit_hours',
      key: 'credit_hours',
      width: 80,
      align: 'center'
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center'
    },
    {
      title: 'Prerequisites Met',
      key: 'prerequisites_met',
      width: 120,
      render: (_, record) => (
        record.eligible ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
        )
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          size="small"
          type={selectedCourses.includes(record.id) ? 'primary' : 'default'}
          onClick={() => handleCourseToggle(record.id)}
          disabled={!record.eligible}
        >
          {selectedCourses.includes(record.id) ? 'Selected' : 'Select'}
        </Button>
      )
    }
  ];

  const registrationColumns = [
    {
      title: 'Course Code',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: 'Course Name',
      dataIndex: 'name_en',
      key: 'name_en'
    },
    {
      title: 'Credits',
      dataIndex: 'credit_hours',
      key: 'credit_hours',
      align: 'center'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        if (status === 'REGISTERED') color = 'green';
        if (status === 'WITHDRAWN') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: grade => grade || '-'
    }
  ];

  // Render graduation status
  const renderGraduationStatus = () => {
    if (!graduationData) return null;

    const { eligible_for_graduation, eligibility_details, graduation_estimate } = graduationData;

    return (
      <Card className="mb-4">
        <h3 className="text-lg font-bold mb-4">Graduation Status</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-gray-600">Credits Completed</p>
            <p className="text-2xl font-bold">{eligibility_details.creditsStatus.completed_credits}</p>
            <p className="text-sm text-gray-500">of {eligibility_details.creditsStatus.required_credits}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Current GPA</p>
            <p className="text-2xl font-bold">{eligibility_details.creditsStatus.gpa}</p>
            <p className="text-sm text-gray-500">Min: {eligibility_details.creditsStatus.min_gpa}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Estimated Graduation</p>
            <p className="text-2xl font-bold">{graduation_estimate.semesters_needed}</p>
            <p className="text-sm text-gray-500">{graduation_estimate.estimated_graduation}</p>
          </div>
        </div>

        {eligible_for_graduation ? (
          <Alert
            message="Eligible for Graduation"
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
          />
        ) : (
          <Alert
            message={`${eligibility_details.missing_requirements.length} Requirements Missing`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            description={
              <ul className="mt-2 list-disc list-inside">
                {eligibility_details.missing_requirements.slice(0, 5).map((req, idx) => (
                  <li key={idx}>{req.message}</li>
                ))}
              </ul>
            }
          />
        )}
      </Card>
    );
  };

  if (!eligibilityData) {
    return <Spin />;
  }

  const { eligible: studentEligible } = eligibilityData.eligibility;

  return (
    <FormalLayout title="Course Registration">
      <div className="space-y-6">
        {/* Eligibility Status */}
        {renderEligibilityStatus()}

        {/* Graduation Status */}
        {renderGraduationStatus()}

        {studentEligible && (
          <Tabs
            items={[
              {
                key: 'available',
                label: `Available Courses (${coursesData?.courses?.length || 0})`,
                children: (
                  <Card>
                    <div className="mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          <InfoCircleOutlined className="mr-2" />
                          <strong>Selected Credits: {totalCredits}</strong>
                          {totalCredits > 0 && (
                            <span className="ml-2 text-gray-600">
                              (Min: 12, Max: 20)
                              {totalCredits < 12 && ' - Below minimum'}
                              {totalCredits > 20 && ' - Exceeds maximum'}
                            </span>
                          )}
                        </p>
                      </div>

                      {coursesLoading ? (
                        <Spin />
                      ) : coursesData?.courses?.length > 0 ? (
                        <>
                          <Table
                            columns={courseColumns}
                            dataSource={coursesData.courses}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                          />

                          <Button
                            type="primary"
                            size="large"
                            onClick={handleRegisterCourses}
                            disabled={selectedCourses.length === 0 || totalCredits < 12 || totalCredits > 20}
                            loading={registering}
                            className="mt-4"
                          >
                            Register for {selectedCourses.length} Courses ({totalCredits} credits)
                          </Button>
                        </>
                      ) : (
                        <Empty description="No available courses matching your requirements" />
                      )}
                    </div>
                  </Card>
                )
              },
              {
                key: 'registered',
                label: `Registered Courses (${currentRegistrationsData?.courseCount || 0})`,
                children: (
                  <Card>
                    {currentRegistrationsData?.registrations?.length > 0 ? (
                      <Table
                        columns={registrationColumns}
                        dataSource={currentRegistrationsData.registrations}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                      />
                    ) : (
                      <Empty description="No registered courses" />
                    )}
                  </Card>
                )
              }
            ]}
          />
        )}

        {!studentEligible && (
          <Card>
            <Alert
              message="Registration Not Available"
              description="You do not meet the minimum requirements for course registration. Please contact your academic advisor."
              type="error"
              showIcon
            />
          </Card>
        )}
      </div>
    </FormalLayout>
  );
};

export default RegistrationPage;

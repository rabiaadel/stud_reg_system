import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Spin,
  message,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Empty,
  Drawer,
} from 'antd';
import {
  SearchOutlined,
  InfoCircleOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { courseService } from '../services/api';
import { useCourseStore } from '../store';

export const CoursesPage = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState(['Core', 'Elective', 'Required']);
  const { setCourses: storeCourses, setSelectedCourse: storeSetSelectedCourse } =
    useCourseStore();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourses();
        setCourses(data);
        storeCourses(data);
      } catch (error) {
        message.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [storeCourses]);

  const handleCourseDetail = async (courseId) => {
    try {
      const data = await courseService.getCourseDetails(courseId);
      setSelectedCourse(data);
      storeSetSelectedCourse(data);
      setDrawerVisible(true);
    } catch (error) {
      message.error('Failed to load course details');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = !categoryFilter || course.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const courseColumns = [
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
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (text) => (
        <Tag
          color={
            text === 'Core'
              ? 'red'
              : text === 'Required'
              ? 'orange'
              : 'green'
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
      width: '20%',
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => handleCourseDetail(record.course_id)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <p className="text-gray-500 mt-2">
          Browse available courses for this semester
        </p>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Search by code or name..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              placeholder="Filter by category"
              allowClear
              value={categoryFilter || undefined}
              onChange={setCategoryFilter}
              options={[
                { label: 'All Categories', value: '' },
                { label: 'Core', value: 'Core' },
                { label: 'Elective', value: 'Elective' },
                { label: 'Required', value: 'Required' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <p className="text-gray-600 text-sm">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          </Col>
        </Row>
      </Card>

      {/* Courses Table */}
      {filteredCourses && filteredCourses.length > 0 ? (
        <Card loading={loading}>
          <Table
            columns={courseColumns}
            dataSource={filteredCourses}
            rowKey="course_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showTotal: (total) => `Total ${total} courses`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      ) : (
        <Card loading={loading}>
          <Empty description="No courses found" />
        </Card>
      )}

      {/* Course Details Drawer */}
      <Drawer
        title="Course Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {selectedCourse ? (
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Course Code</p>
              <p className="text-lg font-semibold">
                {selectedCourse.course_code}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-1">Course Name</p>
              <p className="text-lg font-semibold">
                {selectedCourse.course_name}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-1">Description</p>
              <p className="text-base">
                {selectedCourse.description || 'No description available'}
              </p>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p className="text-gray-600 text-sm">Credits</p>
                <Tag color="blue" className="text-base">
                  {selectedCourse.credits}
                </Tag>
              </Col>
              <Col span={12}>
                <p className="text-gray-600 text-sm">Category</p>
                <Tag
                  color={
                    selectedCourse.category === 'Core'
                      ? 'red'
                      : selectedCourse.category === 'Required'
                      ? 'orange'
                      : 'green'
                  }
                >
                  {selectedCourse.category}
                </Tag>
              </Col>
            </Row>

            <div>
              <p className="text-gray-600 text-sm mb-1">Instructor</p>
              <p className="text-base">{selectedCourse.instructor}</p>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-1">Schedule</p>
              <p className="text-base">
                {selectedCourse.schedule || 'TBD'}
              </p>
            </div>

            {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
              <div>
                <p className="text-gray-600 text-sm mb-2">Prerequisites</p>
                <div className="space-y-2">
                  {selectedCourse.prerequisites.map((prereq) => (
                    <div
                      key={prereq.prerequisite_id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <CheckOutlined className="text-green-500" />
                      <span className="text-sm font-medium">
                        {prereq.prerequisite_code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="primary" className="w-full" size="large">
              Register for This Course
            </Button>
          </div>
        ) : (
          <Spin />
        )}
      </Drawer>
    </div>
  );
};
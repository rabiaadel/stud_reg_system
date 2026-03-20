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
  FilterOutlined,
  BookOutlined,
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
      render: (text) => <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">{text}</span>,
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      key: 'course_name',
      width: '30%',
      render: (text) => <span className="font-medium text-gray-700">{text}</span>,
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      width: '10%',
      render: (text) => <Tag color="blue" className="rounded-full px-3 font-bold">{text}</Tag>,
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
          className="rounded-full px-3 font-semibold uppercase tracking-wider text-xs"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: 'instructor',
      key: 'instructor',
      width: '20%',
      render: (text) => <span className="text-gray-600">{text || 'TBD'}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          className="rounded-lg hover:bg-primary/10 border-primary/50 font-medium"
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
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
             Course Catalog
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Explore and discover the comprehensive list of available courses for the current academic session.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-6 shadow-sm">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <div className="font-medium text-gray-600 mb-2 flex items-center gap-2">
               <SearchOutlined /> Search
            </div>
            <Input
              size="large"
              placeholder="Search by code or course name..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="rounded-xl border-gray-200 hover:border-primary focus:border-primary shadow-sm"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div className="font-medium text-gray-600 mb-2 flex items-center gap-2">
               <FilterOutlined /> Filter Category
            </div>
            <Select
              size="large"
              className="w-full"
              placeholder="Filter by specific category"
              allowClear
              value={categoryFilter || undefined}
              onChange={setCategoryFilter}
              options={[
                { label: 'All Categories', value: '' },
                { label: 'Core', value: 'Core' },
                { label: 'Elective', value: 'Elective' },
                { label: 'Required', value: 'Required' },
              ]}
              popupClassName="rounded-xl"
            />
          </Col>
          <Col xs={24} sm={24} lg={8} className="flex lg:justify-end items-end h-full mt-4 lg:mt-0">
            <div className="bg-primary/5 border border-primary/20 text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2">
               <BookOutlined />
               <span>Showing <strong className="text-primary-dark">{filteredCourses.length}</strong> of {courses.length} courses</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Courses Table */}
      <div className="glass-panel p-6 shadow-sm">
         <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Available Offerings</h2>
          {filteredCourses && filteredCourses.length > 0 ? (
              <Table
                className="bg-transparent"
                columns={courseColumns}
                dataSource={filteredCourses}
                rowKey="course_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (total) => `Total ${total} courses`,
                  className: "mt-4"
                }}
                scroll={{ x: 800 }}
                loading={{
                    spinning: loading,
                    indicator: <Spin size="large" className="text-primary" />
                }}
                rowClassName="hover:bg-primary/5 transition-colors"
              />
          ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-50/50">
               {loading ? <Spin size="large" /> : (
                 <Empty
                     image={Empty.PRESENTED_IMAGE_SIMPLE}
                     description={<span className="text-gray-400 font-medium">No courses found matching your criteria</span>}
                 />
               )}
            </div>
          )}
      </div>

      {/* Course Details Drawer */}
      <Drawer
        title={<span className="font-display font-bold text-xl text-gray-800">Course Information</span>}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={450}
        closeIcon={<span className="text-gray-400 hover:text-gray-700 transition-colors">✕</span>}
        className="glass-drawer overflow-hidden"
        headerStyle={{ borderBottom: '1px solid #f0f0f0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}
        bodyStyle={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.8) 100%)' }}
      >
        {selectedCourse ? (
          <div className="space-y-6">
            <div className="bg-white/60 p-5 rounded-2xl border border-white/50 shadow-sm backdrop-blur-md">
                 <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-1 rounded inline-block">
                        Course Code
                     </p>
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {selectedCourse.course_name}
                 </h2>
                 <p className="text-lg font-semibold text-gray-500 font-mono">
                    {selectedCourse.course_code}
                 </p>
            </div>

            <div className="bg-white/60 p-5 rounded-2xl border border-white/50 shadow-sm backdrop-blur-md">
              <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedCourse.description || 'No detailed description available for this course. Please contact the department for more information.'}
              </p>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="bg-white/60 p-4 rounded-xl border border-white/50 shadow-sm backdrop-blur-md h-full">
                    <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Credits</p>
                    <Tag color="blue" className="text-lg py-1 px-3 rounded-lg font-bold">
                        {selectedCourse.credits} Cr
                    </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-white/60 p-4 rounded-xl border border-white/50 shadow-sm backdrop-blur-md h-full">
                    <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Category</p>
                    <Tag
                        color={
                            selectedCourse.category === 'Core'
                            ? 'red'
                            : selectedCourse.category === 'Required'
                            ? 'orange'
                            : 'green'
                        }
                        className="py-1 px-3 rounded-lg font-bold"
                    >
                        {selectedCourse.category}
                    </Tag>
                </div>
              </Col>
            </Row>

            <div className="bg-white/60 p-5 rounded-2xl border border-white/50 shadow-sm backdrop-blur-md">
                 <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Doctor</p>
                     <p className="text-base font-semibold text-gray-800">{selectedCourse.instructor || 'TBD'}</p>
                 </div>
                 <div>
                     <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Schedule</p>
                     <p className="text-base text-gray-700 bg-gray-100/50 p-2 rounded">
                        {selectedCourse.schedule || 'Schedule pending assignment'}
                     </p>
                 </div>
            </div>

            {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
              <div className="bg-white/60 p-5 rounded-2xl border border-orange-200 shadow-sm backdrop-blur-md">
                <p className="text-xs font-bold text-orange-600 tracking-wider uppercase mb-3 flex items-center gap-2">
                   <InfoCircleOutlined /> Prerequisites
                </p>
                <div className="space-y-2">
                  {selectedCourse.prerequisites.map((prereq) => (
                    <div
                      key={prereq.prerequisite_id}
                      className="flex items-center gap-3 p-2 bg-orange-50/50 rounded-lg border border-orange-100"
                    >
                      <CheckOutlined className="text-orange-500 bg-orange-100 p-1 rounded-full text-xs" />
                      <span className="text-sm font-semibold text-gray-800">
                        {prereq.prerequisite_code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
                <Button type="primary" size="large" className="w-full bg-gradient-to-r from-primary to-primary-light border-0 shadow-neon-primary h-12 text-lg font-semibold rounded-xl" href={`/registration`}>
                Register for Course
                </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
             <Spin size="large" className="text-primary" />
          </div>
        )}
      </Drawer>
    </div>
  );
};

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
  HistoryOutlined,
  SafetyCertificateOutlined,
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

  if (loading && !standing) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" className="text-primary" />
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
      ? 'text-red-600'
      : standing?.warning_issued
      ? 'text-orange-500'
      : 'text-green-500';

  const statusBg =
    standing?.is_dismissed || false
      ? 'bg-red-50 border-red-200'
      : standing?.warning_issued
      ? 'bg-orange-50 border-orange-200'
      : 'bg-green-50 border-green-200';

  const statusText =
    standing?.is_dismissed || false
      ? 'Dismissed'
      : standing?.warning_issued
      ? 'Warning'
      : 'Good Standing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
             Academic Standing
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Track your official university academic status, history and milestones.</p>
      </div>

      {/* Status Alert */}
      {standing && (
        <div className={`p-5 rounded-2xl border ${statusBg} flex items-start gap-4 mb-6 shadow-sm`}>
            {React.createElement(statusIcon, { className: `text-3xl ${statusColor} mt-0.5`})}
            <div>
               <h3 className={`font-bold text-xl ${statusColor}`}>
                   Official Status: {statusText}
               </h3>
               <p className="mt-1 text-gray-700 font-medium text-base">
                {standing.is_dismissed
                  ? 'You have been academically dismissed from the university.'
                  : standing.warning_issued
                  ? 'You are currently on academic warning. Please consult with your advisor immediately to improve your academic performance.'
                  : 'You are in good academic standing. Keep up the great work!'}
               </p>
            </div>
        </div>
      )}

      {/* Main Statistics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative shadow-sm h-full overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <TrophyOutlined className="text-4xl text-primary mb-3" />
             <div className="text-3xl font-bold text-gray-800">{standing?.cgpa?.toFixed(2) || '0.00'}</div>
             <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">Current GPA</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative shadow-sm h-full overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <SafetyCertificateOutlined className="text-4xl text-green-500 mb-3" />
             <div className="text-3xl font-bold text-gray-800">{standing?.total_credits_earned || 0}</div>
             <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">Credits Earned</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col items-center justify-center relative shadow-sm h-full overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <CheckCircleOutlined className="text-4xl text-yellow-500 mb-3" />
             <div className="text-3xl font-bold text-gray-800">{standing?.courses_passed || 0}</div>
             <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">Courses Passed</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className={`glass-card p-6 flex flex-col items-center justify-center relative shadow-sm h-full overflow-hidden group ${standing?.warning_issued ? 'bg-orange-50/50' : standing?.is_dismissed ? 'bg-red-50/50' : 'bg-green-50/50'}`}>
             <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500 ${standing?.warning_issued ? 'bg-orange-500/10' : standing?.is_dismissed ? 'bg-red-500/10' : 'bg-green-500/10'}`}></div>
             {React.createElement(statusIcon, { className: `text-4xl mb-3 ${statusColor}` })}
             <div className={`text-2xl font-bold text-center leading-tight ${statusColor}`}>{statusText}</div>
             <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Current Status</div>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
              {/* Current Status Card */}
              {standing && (
                <div className="glass-panel p-6 shadow-sm h-full">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <UserOutlined className="text-primary" /> Enrollment Details
                  </h2>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
                         <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Academic Level</p>
                         <p className="text-xl font-bold text-gray-800">
                            {standing.academic_level || 'Undergraduate'}
                         </p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
                         <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Enrollment Status</p>
                         <Tag color={standing.enrollment_status === 'active' ? 'success' : 'error'} className="px-3 py-1 text-sm rounded-lg font-bold uppercase tracking-wider">
                            {standing.enrollment_status || 'Active'}
                         </Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
                         <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Academic Warning</p>
                         <Tag color={standing.warning_issued ? 'warning' : 'success'} className="px-3 py-1 text-sm rounded-lg font-bold uppercase">
                            {standing.warning_issued ? 'Active Warning' : 'Clear'}
                         </Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
                         <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Last Updated</p>
                         <p className="text-lg font-bold text-primary font-mono">
                            {standing.last_updated ? new Date(standing.last_updated).toLocaleDateString() : new Date().toLocaleDateString()}
                         </p>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
          </Col>
          <Col xs={24} lg={8}>
              {/* Academic Requirements */}
              <div className="glass-panel p-6 shadow-sm h-full bg-gradient-to-br from-white to-gray-50">
                <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Term Requirements</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(11,60,93,0.1)] border border-primary/20 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                       <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Minimum GPA Required</p>
                       <p className="text-3xl font-black text-primary">2.0</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(20,184,166,0.1)] border border-emerald-100 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                       <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Min Credits/Semester</p>
                       <p className="text-3xl font-black text-emerald-600">12</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(245,158,11,0.1)] border border-amber-100 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                       <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Max Credits/Semester</p>
                       <p className="text-3xl font-black text-amber-500">18</p>
                    </div>
                </div>
              </div>
          </Col>
      </Row>

      {/* Warnings Table */}
      <div className="glass-panel p-6 shadow-sm mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
              <HistoryOutlined className="text-primary" /> Standing History & Actions
          </h2>
          {history && history.length > 0 ? (
            <div className="pl-4 pt-4">
              <Timeline
                className="custom-timeline"
                items={history.map((record, index) => ({
                  color:
                    record.warning_type === 'probation'
                      ? 'orange'
                      : record.warning_type === 'dismissal'
                      ? 'red'
                      : 'green',
                  children: (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm ml-2 relative top-[-10px] mb-4">
                      <p className="font-bold text-gray-800 text-base mb-1">
                        {record.warning_type?.toUpperCase()} -{' '}
                        <span className="text-gray-500 font-medium">
                            {new Date(record.issued_date).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="text-gray-600 mb-3">{record.reason}</p>
                      <div className="flex gap-2">
                          <Tag
                            color={record.is_resolved ? 'success' : 'warning'}
                            className="px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-xs"
                          >
                            {record.is_resolved ? 'Resolved' : 'Action Required'}
                          </Tag>
                          <Tag className="px-3 py-1 rounded-lg font-medium text-xs bg-white border-gray-200">
                             Term: {record.semester_id || 'N/A'}
                          </Tag>
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-50/50">
               <Empty
                   image={Empty.PRESENTED_IMAGE_SIMPLE}
                   description={<span className="text-gray-400 font-medium">No negative academic standing history on record.</span>}
               />
            </div>
          )}
      </div>
    </div>
  );
};

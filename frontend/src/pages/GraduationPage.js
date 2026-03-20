import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Statistic,
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
  AuditOutlined,
  CalendarOutlined,
  CheckCircleFilled,
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
            color: '#3b82f6',
          },
          {
            id: 2,
            name: 'Elective Courses',
            required: 12,
            completed: 10,
            status: 'in-progress',
            color: '#8b5cf6',
          },
          {
            id: 3,
            name: 'General Education',
            required: 18,
            completed: 18,
            status: 'complete',
            color: '#10b981',
          },
          {
            id: 4,
            name: 'Capstone Project',
            required: 1,
            completed: 0,
            status: 'pending',
            color: '#f59e0b',
          },
          {
            id: 5,
            name: 'Minimum GPA',
            required: 2.0,
            completed: 3.2,
            status: 'complete',
            color: '#0ea5e9',
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
        return <CheckCircleFilled className="text-emerald-500 text-xl" />;
      case 'almost-complete':
        return <ClockCircleOutlined className="text-amber-500 text-xl" />;
      case 'in-progress':
        return <ClockCircleOutlined className="text-primary text-xl" />;
      default:
        return <CloseCircleOutlined className="text-gray-300 text-xl" />;
    }
  };

  const overallHours =
    requirements.reduce((sum, req) => sum + req.required, 0) || 0;
  const completedHours =
    requirements.reduce((sum, req) => sum + req.completed, 0) || 0;
  const progressPercentage = Math.round((completedHours / overallHours) * 100) || 0;

  if (loading && !graduationInfo) {
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
            Graduation Eligibility
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Track your ultimate progress toward achieving your degree requirements.
        </p>
      </div>

      {/* Eligibility Alert */}
      {graduationInfo && (
        <div className={`p-5 rounded-2xl border flex items-start gap-4 mb-6 shadow-sm ${graduationInfo.is_eligible ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            {graduationInfo.is_eligible ? (
               <CheckCircleOutlined className="text-3xl text-emerald-500 mt-0.5" />
            ) : (
               <ClockCircleOutlined className="text-3xl text-amber-500 mt-0.5" />
            )}
            <div className="flex-1">
               <h3 className={`font-bold text-xl ${graduationInfo.is_eligible ? 'text-emerald-600' : 'text-amber-600'}`}>
                   {graduationInfo.is_eligible ? 'You are eligible for graduation 🎉' : 'You are not yet eligible for graduation'}
               </h3>
               <p className="mt-1 text-gray-700 font-medium text-base">
                {graduationInfo.is_eligible
                  ? 'Congratulations! You have successfully met all requirements to graduate. Please see the documents section below to officially apply.'
                  : 'Keep going! Review the requirements below to see what you need to complete in order to finish your degree.'}
               </p>
            </div>
            {!graduationInfo.is_eligible && (
                <Tag color="warning" className="px-3 py-1 font-bold text-sm rounded-lg">Action Needed</Tag>
            )}
        </div>
      )}

      {/* Graduation Progress Section */}
      {graduationInfo && (
          <div className="glass-panel overflow-hidden relative">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
              <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                     <TrophyOutlined className="text-primary" /> Graduation Progress Snapshot
                  </h2>
                  <Row gutter={[32, 32]} align="middle">
                     <Col xs={24} lg={8} className="flex justify-center border-r-0 lg:border-r border-gray-100">
                         <div className="relative inline-flex items-center justify-center p-6 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(11,60,93,0.2)] border-4 border-primary/10 w-48 h-48 group">
                             <div className="absolute inset-0 border-4 border-primary rounded-full" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${Math.floor(100 - progressPercentage)}%, 0 ${Math.floor(100 - progressPercentage)}%)`, borderTopColor: 'transparent', borderLeftColor: 'transparent' }}></div>
                             <Progress
                                type="circle"
                                percent={progressPercentage}
                                size={160}
                                strokeColor={{ '0%': '#0b3c5d', '100%': '#b5894d' }}
                                trailColor="transparent"
                                format={() => (
                                    <div className="flex flex-col items-center">
                                       <span className="text-4xl font-black text-gray-800">{progressPercentage}%</span>
                                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Complete</span>
                                    </div>
                                )}
                             />
                         </div>
                     </Col>
                     <Col xs={24} lg={16}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                               <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 h-full">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                      <BookOutlined className="text-xl text-green-600" />
                                  </div>
                                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Earned Credits</p>
                                  <div className="text-3xl font-black text-gray-800">{graduationInfo.credits_earned || 0}</div>
                               </div>
                            </Col>
                            <Col xs={24} sm={12}>
                               <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 h-full">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                      <TrophyOutlined className="text-xl text-primary" />
                                  </div>
                                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Required Credits</p>
                                  <div className="text-3xl font-black text-gray-800">{graduationInfo.credits_required || 120}</div>
                               </div>
                            </Col>
                            <Col xs={24} sm={12}>
                               <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 h-full">
                                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                      <AuditOutlined className="text-xl text-amber-600" />
                                  </div>
                                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Current GPA</p>
                                  <div className="text-3xl font-black text-gray-800">{graduationInfo.current_gpa?.toFixed(2) || '0.00'}</div>
                               </div>
                            </Col>
                            <Col xs={24} sm={12}>
                               <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 h-full">
                                   <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                                      <CheckCircleOutlined className="text-xl text-secondary" />
                                  </div>
                                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Min GPA Required</p>
                                  <div className="text-3xl font-black text-gray-800">2.00</div>
                               </div>
                            </Col>
                        </Row>
                     </Col>
                  </Row>
              </div>
          </div>
      )}

      {/* Split Details Section */}
      <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
              {/* Requirements List */}
              <div className="glass-panel p-6 shadow-sm h-full flex flex-col">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Graduation Requirements</h2>
                  {requirements && requirements.length > 0 ? (
                      <div className="flex-1 space-y-4">
                         {requirements.map(req => {
                            const percent = Math.min(100, Math.round((req.completed / req.required) * 100));
                            return (
                                <div key={req.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform">
                                        {getStatusIcon(req.status)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-gray-800">{req.name}</h4>
                                            <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                                                {req.completed} / {req.required} {typeof req.required === 'number' && req.required > 10 ? 'cr' : 'done'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex-1">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${percent}%`, backgroundColor: req.color }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 w-8">{percent}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                         })}
                      </div>
                  ) : (
                      <div className="py-12 flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-50/50">
                          <Empty description={<span className="text-gray-400 font-medium">No requirements data available</span>} />
                      </div>
                  )}
              </div>
          </Col>
          <Col xs={24} lg={8}>
              <div className="flex flex-col gap-6 h-full">
                  {/* Missing Requirements Alert */}
                  {graduationInfo && !graduationInfo.is_eligible && (
                      <div className="glass-panel p-6 shadow-sm bg-gradient-to-br from-white to-red-50/30">
                          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 text-red-600">Action Required to Graduate</h2>
                          <div className="space-y-3">
                             {(graduationInfo.missing_requirements || [
                                'Complete 10 more credit hours',
                                'Submit capstone project',
                              ]).map((item, i) => (
                                 <div key={i} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                     <CloseCircleOutlined className="text-red-500 mt-1" />
                                     <span className="text-gray-700 font-medium text-sm leading-tight">{item}</span>
                                 </div>
                             ))}
                          </div>
                      </div>
                  )}

                  {/* Important Dates */}
                  <div className="glass-panel p-6 shadow-sm flex-1">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Important Dates</h2>
                      <div className="space-y-4">
                         {[
                            { title: 'Graduation Application Deadline', date: 'April 15, 2024', isActive: true },
                            { title: 'Final Exam Date', date: 'May 20, 2024' },
                            { title: 'Graduation Ceremony', date: 'June 10, 2024' },
                            { title: 'Diploma Mailing', date: 'July 1, 2024' },
                          ].map((item, i) => (
                              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${item.isActive ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-gray-50'}`}>
                                  <div className={`mt-1 bg-white p-1.5 rounded-lg shadow-sm border ${item.isActive ? 'border-primary/20 text-primary' : 'border-gray-100 text-gray-400'}`}>
                                      <CalendarOutlined />
                                  </div>
                                  <div>
                                      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${item.isActive ? 'text-primary' : 'text-gray-500'}`}>{item.title}</p>
                                      <p className="font-bold text-gray-800 text-base">{item.date}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </Col>
      </Row>

      {/* Graduation Documents */}
      <h2 className="text-xl font-display font-bold text-gray-800 mt-8 mb-4">Graduation Documents & Actions</h2>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
            <div className={`glass-card p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group ${graduationInfo?.is_eligible ? 'hover:border-primary cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}>
               {graduationInfo?.is_eligible && <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary text-2xl group-hover:scale-110 transition-transform shadow-sm">
                   <BookOutlined />
               </div>
               <h3 className="font-bold text-gray-800 text-lg mb-2">Graduation Application</h3>
               <p className="text-gray-500 text-sm mb-6 flex-1">Officially submit your intent to graduate once you become eligible.</p>
               <Button type="primary" size="large" className="w-full font-bold shadow-md hover:shadow-lg transition-all" shape="round" disabled={!graduationInfo?.is_eligible}>
                 Apply to Graduate
               </Button>
            </div>
        </Col>
        <Col xs={24} sm={8}>
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group hover:border-emerald-400 cursor-pointer">
               <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-500 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                   <AuditOutlined />
               </div>
               <h3 className="font-bold text-gray-800 text-lg mb-2">Detailed Degree Audit</h3>
               <p className="text-gray-500 text-sm mb-6 flex-1">Download a PDF breakdown of your courses, credits, and remaining requirements.</p>
               <Button className="w-full font-bold text-emerald-600 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50" size="large" shape="round">
                 Download Audit PDF
               </Button>
            </div>
        </Col>
        <Col xs={24} sm={8}>
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group hover:border-secondary/40 cursor-pointer">
               <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary text-2xl group-hover:scale-110 transition-transform shadow-sm">
                   <CheckCircleOutlined />
               </div>
               <h3 className="font-bold text-gray-800 text-lg mb-2">Official Transcript</h3>
               <p className="text-gray-500 text-sm mb-6 flex-1">Request an official university transcript for employment or graduate school.</p>
               <Button className="w-full font-bold text-secondary border-secondary/40 hover:border-secondary hover:bg-secondary/10" size="large" shape="round">
                 Request Transcript
               </Button>
            </div>
        </Col>
      </Row>
    </div>
  );
};

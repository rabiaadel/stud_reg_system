import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Spin,
  message,
  Empty,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  RiseOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { studentService } from '../services/api';
import { Line as LineChartComponent, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

export const ProgressPage = () => {
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [gpaHistory, setGpaHistory] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const [progress, standing] = await Promise.all([
          studentService.getProgressTracking(),
          studentService.getStandingHistory(),
        ]);
        setProgressData(progress);

        const history = Array.isArray(standing)
          ? standing
          : (standing?.standing_history || []);
        setGpaHistory(
          history.map((entry) => ({
            semester: entry.semester,
            gpa: Number(entry.gpa || 0),
            total_credits: entry.total_credits || 0,
          }))
        );
      } catch (error) {
        message.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const chartHistory = [...gpaHistory].reverse();
  const chartData = {
    labels: chartHistory.map((h) => h.semester),
    datasets: [
      {
        label: 'Cumulative GPA',
        data: chartHistory.map((h) => h.gpa),
        borderColor: '#0b3c5d',
        backgroundColor: 'rgba(11, 60, 93, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0b3c5d',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
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
           titleFont: { family: "'Source Sans 3', sans-serif", size: 14, weight: 'bold' },
           bodyFont: { family: "'Source Sans 3', sans-serif", size: 13 },
           padding: 12,
           cornerRadius: 8,
           displayColors: false,
       }
     },
     scales: {
       y: {
         min: 0,
         max: 4.0,
         grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false, borderDash: [5, 5] },
         ticks: { font: { family: "'Source Sans 3', sans-serif" }, color: '#64748b', stepSize: 1, callback: (v) => v.toFixed(1) }
       },
       x: {
         grid: { display: false, drawBorder: false },
         ticks: { font: { family: "'Source Sans 3', sans-serif" }, color: '#64748b' }
       }
     },
  };

  const radarData = {
      labels: ['Core', 'Elective', 'Lab', 'Seminar', 'Project', 'Research'],
      datasets: [
        {
          label: 'Performance Profile',
          data: [3.4, 3.8, 2.9, 3.5, 4.0, 3.2],
          backgroundColor: 'rgba(181, 137, 77, 0.2)',
          borderColor: '#b5894d',
          pointBackgroundColor: '#b5894d',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#b5894d'
        }
      ]
  };

  const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: false }
      },
      scales: {
          r: {
              angleLines: { color: 'rgba(0,0,0,0.05)' },
              grid: { color: 'rgba(0,0,0,0.05)' },
              pointLabels: { font: { family: "'Source Sans 3', sans-serif", size: 12, weight: '500' }, color: '#475569' },
              ticks: { display: false, min: 0, max: 4, stepSize: 1 }
          }
      }
  };

  const highestGpa = gpaHistory.length
    ? Math.max(...gpaHistory.map((h) => h.gpa || 0))
    : 0;

  const progressColumns = [
    {
      title: 'Term',
      dataIndex: 'semester',
      key: 'semester',
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>
    },
    {
      title: 'Credits',
      dataIndex: 'credits_earned',
      key: 'credits_earned',
      render: (text) => <span className="font-mono text-gray-600 font-medium">{text} cr</span>
    },
    {
      title: 'Term GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (text) => (
        <span className="font-bold text-gray-800">
          {Number(text || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'semester_status',
      key: 'semester_status',
      render: (text) => (
        <Tag
          color={text === 'completed' ? 'success' : 'processing'}
          className="px-3 py-1 rounded-lg uppercase tracking-wider text-xs font-bold"
        >
          {text}
        </Tag>
      ),
    },
  ];

  if (loading && gpaHistory.length === 0) {
      return (
          <div className="flex justify-center items-center h-96">
             <Spin size="large" className="text-primary" />
          </div>
      );
  }

  const creditsRequired = progressData?.total_credits_required || 132;
  const totalCreditsEarned = progressData?.total_credits_earned || 0;
  const completionPercent = progressData?.progress_percentage !== undefined
    ? progressData.progress_percentage
    : (creditsRequired ? Math.round((totalCreditsEarned / creditsRequired) * 100) : 0);
  const safeCompletionPercent = Math.min(100, Math.max(0, completionPercent));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 mb-6">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Degree Progress
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Visualize your academic journey, major requirements, and overall performance metrics.
        </p>
      </div>

      {/* Progress Bars Highlight */}
      <div className="glass-panel p-6 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
             <ExperimentOutlined className="text-primary" /> Overall Degree Completion
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
             <div className="w-full md:w-2/3">
                <div className="flex justify-between items-end mb-2">
                   <div>
                       <span className="text-2xl font-bold text-gray-900">{safeCompletionPercent}%</span>
                       <span className="text-gray-500 font-medium ml-2">Completed</span>
                   </div>
                   <div className="text-sm font-semibold text-gray-600">
                      {totalCreditsEarned} / {creditsRequired} Credits
                   </div>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                   <div
                       className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                       style={{ width: `${safeCompletionPercent}%` }}
                   ></div>
                </div>
                <div className="mt-4 flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div> Core Req: 80%</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div> Major Req: 40%</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-300"></div> Electives: 10%</div>
                </div>
             </div>
             <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm relative">
                  <div className="absolute -left-2 -top-2 w-12 h-12 bg-green-500/10 rounded-full"></div>
                  <CheckCircleOutlined className="text-4xl text-green-500 mb-2" />
                  <p className="text-gray-500 font-medium uppercase tracking-wider text-xs">Projected Graduation</p>
                  <p className="text-xl font-bold text-gray-800">
                    {progressData?.estimated_graduation_date
                      ? new Date(progressData.estimated_graduation_date).toLocaleDateString()
                      : 'Not available'}
                  </p>
             </div>
          </div>
      </div>

      {/* Overview Statistics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col justify-center h-full group relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 text-gray-100 opacity-50 group-hover:scale-110 transition-transform duration-500">
                <LineChartOutlined style={{ fontSize: '100px' }} />
             </div>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Terms Completed</p>
             <div className="text-4xl font-black text-gray-800">{gpaHistory.length}</div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card p-6 flex flex-col justify-center h-full group relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 text-primary/10 opacity-50 group-hover:scale-110 transition-transform duration-500">
                <RiseOutlined style={{ fontSize: '100px' }} />
             </div>
             <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Current GPA</p>
             <div className="flex items-end gap-3">
             <div className="text-4xl font-black text-primary-dark">{Number(gpaHistory[gpaHistory.length - 1]?.gpa || 0).toFixed(2)}</div>
                 {gpaHistory.length > 1 && gpaHistory[gpaHistory.length - 1]?.gpa > gpaHistory[gpaHistory.length - 2]?.gpa ? (
                    <Tag color="success" className="mb-2 rounded flex items-center gap-1 border-0 bg-green-100/50"><ArrowUpOutlined /> +{(gpaHistory[gpaHistory.length - 1]?.gpa - gpaHistory[gpaHistory.length - 2]?.gpa).toFixed(2)}</Tag>
                 ) : (
                    <Tag color="warning" className="mb-2 rounded-full border-0">-</Tag>
                 )}
             </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
           <div className="glass-card p-6 flex flex-col justify-center h-full group relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 text-green-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
                <CheckCircleOutlined style={{ fontSize: '100px' }} />
             </div>
             <p className="text-green-500 text-xs font-bold uppercase tracking-wider mb-2">Highest Term GPA</p>
             <div className="text-4xl font-black text-green-600">
                {highestGpa.toFixed(2)}
             </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
           <div className="glass-card p-6 flex flex-col justify-center h-full group relative overflow-hidden border-primary/20 bg-gradient-to-br from-white to-primary/5">
             <div className="absolute right-2 top-4 w-16 h-16 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Earned Credits</p>
             <div className="flex items-baseline gap-1">
                 <div className="text-4xl font-black text-primary-dark">{totalCreditsEarned}</div>
                 <div className="text-lg font-bold text-primary-light">Cr</div>
             </div>
          </div>
        </Col>
      </Row>

      {/* Analysis Charts */}
      <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
              <div className="glass-panel p-6 shadow-sm h-full flex flex-col">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Academic Trajectory</h2>
                  <div className="flex-1 w-full min-h-[300px]">
                     {gpaHistory.length > 0 ? (
                        <LineChartComponent data={chartData} options={chartOptions} />
                     ) : (
                         <Empty description="Not enough data to graph trajectory" className="mt-12" />
                     )}
                  </div>
              </div>
          </Col>
          <Col xs={24} lg={8}>
              <div className="glass-panel p-6 shadow-sm h-full flex flex-col">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Skills Profile</h2>
                  <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
                      <div className="w-full max-w-[280px] h-[280px]">
                          <Radar data={radarData} options={radarOptions} />
                      </div>
                  </div>
              </div>
          </Col>
      </Row>

      {/* Semester Details */}
      <div className="glass-panel p-6 shadow-sm">
         <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Term by Term Performance</h2>
        {gpaHistory && gpaHistory.length > 0 ? (
          <Table
            className="bg-transparent mt-4"
            columns={progressColumns}
            dataSource={gpaHistory.map((h, i) => ({
                ...h,
                semester_status: i === 0 ? 'current' : 'completed',
                credits_earned: h.total_credits || 0,
                key: i,
            }))}
            pagination={false}
            rowKey="key"
            rowClassName="hover:bg-primary/5 transition-colors"
          />
        ) : (
          <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center bg-gray-50/50 mt-4">
             <Empty
                 image={Empty.PRESENTED_IMAGE_SIMPLE}
                 description={<span className="text-gray-400 font-medium">No historical term data available.</span>}
             />
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Drawer,
  message,
} from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { APP_NAME_AR, APP_BRAND } from '../config/appMeta';

const { Header, Sider, Content, Footer } = Layout;

export const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Profile</Link>,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined className="text-red-500" />,
        label: <span className="text-red-500 font-medium">Logout</span>,
        onClick: handleLogout,
      },
    ],
  };

  const studentMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: <Link to="/courses">Courses</Link>,
    },
    {
      key: '/registration',
      icon: <FileTextOutlined />,
      label: <Link to="/registration">Registration</Link>,
    },
    {
      key: '/grades',
      icon: <BarChartOutlined />,
      label: <Link to="/grades">Grades</Link>,
    },
    {
      key: '/academic-standing',
      icon: <SettingOutlined />,
      label: <Link to="/academic-standing">Academic Standing</Link>,
    },
    {
      key: '/graduation',
      icon: <BookOutlined />,
      label: <Link to="/graduation">Graduation</Link>,
    },
    {
      key: '/progress',
      icon: <BarChartOutlined />,
      label: <Link to="/progress">Progress</Link>,
    },
  ];

  const adminMenuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/rules',
      icon: <SettingOutlined />,
      label: <Link to="/admin/rules">Academic Rules</Link>,
    },
    {
      key: '/admin/students',
      icon: <UserOutlined />,
      label: <Link to="/admin/students">Students</Link>,
    },
    {
      key: '/admin/audit-logs',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/audit-logs">Audit Logs</Link>,
    },
  ];

  const doctorMenuItems = [
    {
      key: '/doctor',
      icon: <DashboardOutlined />,
      label: <Link to="/doctor">Dashboard</Link>,
    },
  ];

  let menuItems = studentMenuItems;
  if (user?.role === 'admin') {
    menuItems = adminMenuItems;
  } else if (user?.role === 'doctor') {
    menuItems = doctorMenuItems;
  }

  const selectedKey = menuItems.find((item) =>
    location.pathname.includes(item.key)
  )?.key || menuItems[0].key;

  return (
    <Layout className="min-h-screen bg-transparent">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="hidden md:block app-sider"
        theme="light"
        width={250}
      >
        <div className="app-sider-header">
          <div className="brand-mark">حاسب</div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-title">{APP_NAME_AR}</span>
              <span className="brand-subtitle">Faculty of Computers & Informatics</span>
            </div>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="app-menu"
        />
      </Sider>

      <Drawer
        title={
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-primary">{APP_NAME_AR}</span>
            <span className="text-xs text-gray-500 leading-tight">{APP_BRAND}</span>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
        className="app-drawer"
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
          className="app-menu-mobile"
        />
      </Drawer>

      <Layout className="bg-transparent">
        <Header className="app-header">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={drawerVisible ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setDrawerVisible(!drawerVisible)}
              className="md:hidden app-icon-button"
            />
            <div className="hidden md:flex flex-col">
              <span className="text-sm text-gray-500">Welcome back</span>
              <span className="text-xl font-display font-semibold text-gray-900">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-800">{user?.name || 'Authorized User'}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role || 'Guest'}</span>
            </div>
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <Avatar
                size={44}
                icon={<UserOutlined />}
                className="app-avatar"
              />
            </Dropdown>
          </div>
        </Header>

        <Content className="p-4 md:p-8 app-content">
          {children}
        </Content>

        <Footer className="app-footer">
          <p>
            © {new Date().getFullYear()} {APP_NAME_AR}
          </p>
        </Footer>
      </Layout>
    </Layout>
  );
};

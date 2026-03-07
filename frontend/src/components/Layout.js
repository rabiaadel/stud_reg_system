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

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Student Menu Items
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

  // Admin Menu Items
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

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  const selectedKey = menuItems.find((item) =>
    location.pathname.includes(item.key)
  )?.key || menuItems[0].key;

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="hidden md:block"
      >
        <div className="flex items-center justify-center h-16 bg-primary text-white font-bold text-lg">
          {!collapsed && 'SRS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        children={
          <Menu
            mode="vertical"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={() => setDrawerVisible(false)}
          />
        }
      />

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header className="bg-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={drawerVisible ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setDrawerVisible(!drawerVisible)}
              className="md:hidden"
            />
            <h1 className="text-lg font-semibold hidden md:block">
              Student Registration System
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
              <Avatar
                size={40}
                icon={<UserOutlined />}
                className="bg-blue-500 cursor-pointer"
              />
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="p-6 bg-gray-50 min-h-screen">
          {children}
        </Content>

        {/* Footer */}
        <Footer className="text-center bg-white border-t">
          <p className="text-gray-600">
            © 2024 University Student Registration System. All rights reserved.
          </p>
        </Footer>
      </Layout>
    </Layout>
  );
};
import React, { useState } from 'react';
import { Layout, Dropdown, Button, Space, Drawer, Menu, Badge, Avatar } from 'antd';
import { LogoutOutlined, BellOutlined, UserOutlined, MenuOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { APP_CONFIG } from '../config/appConfig';
import './FormalLayout.css';

const { Header, Sider, Content, Footer } = Layout;

export const FormalLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notificationCount] = useState(3);
  
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const handleUserMenuClick = (e) => {
    if (e.key === 'logout') {
      handleLogout();
    }
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [];

    if (user?.role === 'admin') {
      baseItems.push(
        {
          key: '/admin',
          icon: '📊',
          label: <Link to="/admin">Dashboard</Link>,
        },
        {
          key: '/admin/account-requests',
          icon: '✅',
          label: <Link to="/admin/account-requests">Account Requests</Link>,
        },
        {
          key: '/admin/users',
          icon: '👥',
          label: <Link to="/admin/users">Manage Users</Link>,
        },
        {
          key: '/admin/audit-logs',
          icon: '📋',
          label: <Link to="/admin/audit-logs">Audit Logs</Link>,
        }
      );
    } else if (user?.role === 'doctor') {
      baseItems.push(
        {
          key: '/doctor',
          icon: '👨‍🏫',
          label: <Link to="/doctor">Dashboard</Link>,
        },
        {
          key: '/doctor/courses',
          icon: '📚',
          label: <Link to="/doctor/courses">My Courses</Link>,
        },
        {
          key: '/doctor/students',
          icon: '👨‍🎓',
          label: <Link to="/doctor/students">Students</Link>,
        }
      );
    } else if (user?.role === 'student') {
      baseItems.push(
        {
          key: '/dashboard',
          icon: '🏠',
          label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
          key: '/registration',
          icon: '📝',
          label: <Link to="/registration">Course Registration</Link>,
        },
        {
          key: '/courses',
          icon: '📚',
          label: <Link to="/courses">My Courses</Link>,
        },
        {
          key: '/grades',
          icon: '📈',
          label: <Link to="/grades">Grades</Link>,
        },
        {
          key: '/academic-standing',
          icon: '⚖️',
          label: <Link to="/academic-standing">Academic Standing</Link>,
        },
        {
          key: '/graduation',
          icon: '🎓',
          label: <Link to="/graduation">Graduation</Link>,
        },
        {
          key: '/boards',
          icon: '💬',
          label: <Link to="/boards">Discussion Boards</Link>,
        }
      );
    }

    return baseItems;
  };

  const selectedKey = getMenuItems().find(item =>
    location.pathname.startsWith(item.key)
  )?.key || '';

  return (
    <Layout className="formal-layout" dir="ltr">
      {/* FORMAL HEADER */}
      <Header className="formal-header">
        <div className="header-container">
          {/* Logo and Branding Section */}
          <div className="logo-section">
            <div className="logo-text">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%231890ff' d='M20 80c-5.5-12-8-24-8-40C12 25 25 12 40 12c15 0 28 13 28 28 0 16-2.5 28-8 40M40 35c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z'/%3E%3C/svg%3E"
                alt="Faculty Logo"
                className="logo-image"
              />
              <div className="logo-text-content">
                <div className="logo-main-en">{APP_CONFIG.APP_NAME_EN}</div>
                <div className="logo-main-ar">{APP_CONFIG.APP_NAME_AR}</div>
                <div className="logo-sub">{APP_CONFIG.UNIVERSITY_EN}</div>
              </div>
            </div>
          </div>

          {/* Right Section: Search, Notifications, User */}
          <div className="header-right">
            <Space size="large">
              {/* Notifications */}
              <Badge count={notificationCount}>
                <Button 
                  type="text" 
                  icon={<BellOutlined style={{ fontSize: '18px' }} />}
                  className="header-icon-btn"
                />
              </Badge>

              {/* User Dropdown */}
              <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
                <Button 
                  type="text"
                  className="user-dropdown-btn"
                  icon={<Avatar style={{ backgroundColor: APP_CONFIG.COLORS.primary }}>
                    {user?.first_name?.[0]}
                  </Avatar>}
                />
              </Dropdown>

              {/* Mobile Menu Button */}
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="mobile-menu-btn"
              />
            </Space>
          </div>
        </div>
      </Header>

      <Layout className="layout-wrapper">
        {/* SIDEBAR - Desktop */}
        {user && (
          <Sider
            collapsed={collapsed}
            onCollapse={setCollapsed}
            className="formal-sider"
            breakpoint="lg"
          >
            <Menu
              items={getMenuItems()}
              selectedKeys={[selectedKey]}
              mode="inline"
              className="formal-menu"
            />
          </Sider>
        )}

        {/* MOBILE DRAWER */}
        <Drawer
          title="Navigation"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            items={getMenuItems()}
            selectedKeys={[selectedKey]}
            mode="inline"
            onClick={() => setDrawerVisible(false)}
          />
        </Drawer>

        {/* MAIN CONTENT */}
        <Layout className="content-layout">
          <Content className="formal-content">
            {children}
          </Content>

          {/* FOOTER */}
          <Footer className="formal-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>{APP_CONFIG.APP_NAME_EN}</h4>
                <p>{APP_CONFIG.APP_NAME_AR}</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="#about">About</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#support">Support</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Contact Info</h4>
                <p>Email: info@cis.tanta.edu.eg</p>
                <p>Phone: +2-040-3347920</p>
              </div>
              <div className="footer-section" dir="rtl">
                <h4>{APP_CONFIG.APP_NAME_AR}</h4>
                <p>جامعة طنطا - كلية الحاسبات والمعلومات</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 Faculty of Computers and Informatics - Tanta University. All rights reserved.</p>
              <p>جميع الحقوق محفوظة © 2024 كلية الحاسبات والمعلومات - جامعة طنطا</p>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default FormalLayout;

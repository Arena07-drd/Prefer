import React, { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Badge, Avatar, Button, Space, message, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { notificationsApi, authApi } from '../api/services.js';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsApi.getUnreadCount();
        if (response.data?.success) {
          setUnreadCount(response.data.data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      }
    };
    
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout(useAuthStore.getState().refreshToken);
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'change-password',
      icon: <SettingOutlined />,
      label: 'Change Password',
      onClick: () => navigate('/change-password')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
    { key: '/products', icon: <AppstoreOutlined />, label: 'Products' },
    { key: '/categories', icon: <TagsOutlined />, label: 'Categories' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Customers' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ key: '/staff', icon: <UserSwitchOutlined />, label: 'Staff' });
  }
  
  if (user?.role === 'admin' || user?.role === 'staff') {
    menuItems.push({ key: '/reports', icon: <BarChartOutlined />, label: 'Reports' });
  }

  if (user?.role === 'admin') {
    menuItems.push({ key: '/audit-logs', icon: <FileSearchOutlined />, label: 'Audit Logs' });
  }

  menuItems.push({ key: '/notifications', icon: <BellOutlined />, label: 'Notifications' });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="light">
        <div style={{ height: 32, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title level={4} style={{ margin: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {collapsed ? 'BA' : 'Billing Admin'}
          </Title>
        </div>
        <Menu
          theme="light"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div />
          <Space size="large">
            <Badge count={unreadCount} overflowCount={99}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} onClick={() => navigate('/notifications')} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span style={{ fontWeight: 500 }}>{user?.name || 'User'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

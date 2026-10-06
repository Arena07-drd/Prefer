import React, { useEffect, useState } from 'react';
import { List, Card, Button, Typography, Space, message, Tag } from 'antd';
import { CheckOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/services.js';
import dayjs from 'dayjs';

const { Text } = Typography;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  const fetchNotifications = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await notificationsApi.getAll({ page, limit });
      if (response.data?.success) {
        setNotifications(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      message.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      message.success('All notifications marked as read');
      fetchNotifications(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      notificationsApi.markAsRead(item._id).catch(() => {});
    }
    
    if (item.entityType === 'order' && item.entityId) {
      navigate(`/orders/${item.entityId}`);
    }
  };

  return (
    <Card 
      bordered={false} 
      title="Notifications" 
      extra={<Button icon={<CheckOutlined />} onClick={handleMarkAllAsRead}>Mark All as Read</Button>}
    >
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={notifications}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchNotifications(page, pageSize)
        }}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleNotificationClick(item)}
            style={{ 
              cursor: 'pointer', 
              background: item.isRead ? 'transparent' : '#f0f5ff',
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              borderRadius: item.isRead ? 0 : 8,
              marginBottom: 8
            }}
            actions={[
              !item.isRead && (
                <Button 
                  type="text" 
                  icon={<CheckOutlined />} 
                  onClick={(e) => handleMarkAsRead(item._id, e)}
                  title="Mark as read"
                />
              )
            ]}
          >
            <List.Item.Meta
              avatar={<BellOutlined style={{ fontSize: 24, color: item.isRead ? '#bfbfbf' : '#1890ff' }} />}
              title={
                <Space>
                  <Text strong={!item.isRead}>{item.title}</Text>
                  {item.entityType === 'order' && <Tag color="blue">Order</Tag>}
                </Space>
              }
              description={
                <div>
                  <div>{item.message}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.createdAt).format('DD MMM YYYY, HH:mm')}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default NotificationsPage;

import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Space, Card, Button, Modal, Form, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, StopOutlined, KeyOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/services.js';
import dayjs from 'dayjs';

const CustomersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

  const navigate = useNavigate();

  const fetchCustomers = async (page = 1, limit = 10, searchQ = search) => {
    setLoading(true);
    try {
      const response = await usersApi.getAll({ page, limit, search: searchQ, role: 'customer' });
      if (response.data?.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchCustomers(newPagination.current, newPagination.pageSize, search);
  };

  const handleSearch = () => {
    fetchCustomers(1, pagination.pageSize, search);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      await usersApi.create({ ...values, role: 'customer' });
      message.success('Customer created successfully');
      setIsModalVisible(false);
      fetchCustomers(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Failed to create customer');
      }
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await usersApi.deactivate(id);
      message.success('Customer deactivated');
      fetchCustomers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to deactivate customer');
    }
  };

  const showResetModal = (id) => {
    setSelectedUserId(id);
    resetForm.resetFields();
    setIsResetModalVisible(true);
  };

  const handleResetOk = async () => {
    try {
      const values = await resetForm.validateFields();
      await usersApi.resetPassword(selectedUserId, values.newPassword);
      message.success('Password reset successfully');
      setIsResetModalVisible(false);
    } catch (error) {
      message.error('Failed to reset password');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Business Name', dataIndex: 'businessName', key: 'businessName' },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/orders?customer=${record._id}`)} title="View Orders" />
          <Button type="text" icon={<KeyOutlined />} onClick={() => showResetModal(record._id)} title="Reset Password" />
          {record.isActive && (
            <Popconfirm title="Deactivate customer?" onConfirm={() => handleDeactivate(record._id)}>
              <Button type="text" danger icon={<StopOutlined />} title="Deactivate" />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card bordered={false} title="Customers" extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>Add Customer</Button>}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search Customers"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
        />
        <Button onClick={handleSearch} type="primary">Search</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title="Add Customer"
        open={isModalVisible}
        onOk={handleAddOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="businessName" label="Business Name">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reset Password"
        open={isResetModalVisible}
        onOk={handleResetOk}
        onCancel={() => setIsResetModalVisible(false)}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical">
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CustomersPage;

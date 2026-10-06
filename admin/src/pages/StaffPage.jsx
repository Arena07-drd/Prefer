import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Space, Card, Button, Modal, Form, Popconfirm, Select, message } from 'antd';
import { SearchOutlined, PlusOutlined, StopOutlined, KeyOutlined } from '@ant-design/icons';
import { usersApi } from '../api/services.js';
import dayjs from 'dayjs';

const { Option } = Select;

const StaffPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

  const fetchStaff = async (page = 1, limit = 10, searchQ = search) => {
    setLoading(true);
    try {
      const response = await usersApi.getAll({ page, limit, search: searchQ, role: 'staff,admin' });
      if (response.data?.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      message.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchStaff(newPagination.current, newPagination.pageSize, search);
  };

  const handleSearch = () => {
    fetchStaff(1, pagination.pageSize, search);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      await usersApi.create(values);
      message.success('Staff created successfully');
      setIsModalVisible(false);
      fetchStaff(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Failed to create staff');
      }
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await usersApi.deactivate(id);
      message.success('Staff deactivated');
      fetchStaff(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to deactivate staff');
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
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag color={role === 'admin' ? 'purple' : 'blue'}>{(role || '').toUpperCase()}</Tag> },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<KeyOutlined />} onClick={() => showResetModal(record._id)} title="Reset Password" />
          {record.isActive && (
            <Popconfirm title="Deactivate staff?" onConfirm={() => handleDeactivate(record._id)}>
              <Button type="text" danger icon={<StopOutlined />} title="Deactivate" />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card bordered={false} title="Staff Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>Add Staff</Button>}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search Staff"
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
        title="Add Staff"
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
          <Form.Item name="role" label="Role" initialValue="staff" rules={[{ required: true }]}>
            <Select>
              <Option value="staff">Staff</Option>
              <Option value="admin">Admin</Option>
            </Select>
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

export default StaffPage;

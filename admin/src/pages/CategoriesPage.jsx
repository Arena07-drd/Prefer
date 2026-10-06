import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Card, Button, Modal, Form, Input, InputNumber, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoriesApi } from '../api/services.js';

const { TextArea } = Input;

const CategoriesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAll({ page, limit });
      if (response.data?.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchCategories(newPagination.current, newPagination.pageSize);
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await categoriesApi.update(editingId, values);
        message.success('Category updated successfully');
      } else {
        await categoriesApi.create(values);
        message.success('Category created successfully');
      }
      setIsModalVisible(false);
      fetchCategories(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Failed to save category');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoriesApi.delete(id);
      message.success('Category deleted successfully');
      fetchCategories(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Sort Order', dataIndex: 'sortOrder', key: 'sortOrder' },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card bordered={false} title="Categories" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Add Category</Button>}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title={editingId ? 'Edit Category' : 'Add Category'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort Order" initialValue={0}>
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoriesPage;

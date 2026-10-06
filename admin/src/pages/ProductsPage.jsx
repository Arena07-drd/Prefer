import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Select, Space, Card, Button, Modal, Form, InputNumber, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productsApi, categoriesApi } from '../api/services.js';

const { Option } = Select;
const { TextArea } = Input;

const ProductsPage = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(undefined);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchProducts = async (page = 1, limit = 10, searchQ = search, cat = categoryFilter) => {
    setLoading(true);
    try {
      const response = await productsApi.getAll({ page, limit, search: searchQ, category: cat });
      if (response.data?.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll({ limit: 100 });
      if (response.data?.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchProducts(newPagination.current, newPagination.pageSize, search, categoryFilter);
  };

  const handleSearch = () => {
    fetchProducts(1, pagination.pageSize, search, categoryFilter);
  };

  const handleReset = () => {
    setSearch('');
    setCategoryFilter(undefined);
    fetchProducts(1, pagination.pageSize, '', undefined);
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue({
        ...record,
        category: record.category?._id || record.category,
        minOrderQuantity: record.minOrderQuantity || 1,
        maxOrderQuantity: record.maxOrderQuantity,
        status: record.status || 'active'
      });
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
        await productsApi.update(editingId, values);
        message.success('Product updated successfully');
      } else {
        await productsApi.create(values);
        message.success('Product created successfully');
      }
      setIsModalVisible(false);
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || 'Failed to save product');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsApi.delete(id);
      message.success('Product deleted successfully');
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (val) => formatCurrency(val) },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Status', key: 'status', render: (_, record) => {
      const isActive = record.status ? record.status === 'active' : (record.isActive !== false);
      return <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag>;
    }},
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card bordered={false} title="Products" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Add Product</Button>}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search Products"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
        />
        <Select
          placeholder="Filter Category"
          style={{ width: 200 }}
          allowClear
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
        >
          {categories.map(cat => (
            <Option key={cat._id} value={cat._id}>{cat.name}</Option>
          ))}
        </Select>
        <Button onClick={handleSearch} type="primary">Search</Button>
        <Button onClick={handleReset}>Reset</Button>
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
        title={editingId ? 'Edit Product' : 'Add Product'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              {categories.map(cat => <Option key={cat._id} value={cat._id}>{cat.name}</Option>)}
            </Select>
          </Form.Item>
          <Space>
            <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Option value="kg">kg</Option>
                <Option value="g">g</Option>
                <Option value="ltr">ltr</Option>
                <Option value="ml">ml</Option>
                <Option value="piece">piece</Option>
                <Option value="box">box</Option>
                <Option value="packet">packet</Option>
              </Select>
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="minOrderQuantity" label="Min Order Quantity" initialValue={1} rules={[{ required: true, min: 1, type: 'number' }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="maxOrderQuantity" label="Max Order Quantity">
              <InputNumber min={1} />
            </Form.Item>
          </Space>
          <Form.Item name="status" label="Status" initialValue="active">
             <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
             </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductsPage;

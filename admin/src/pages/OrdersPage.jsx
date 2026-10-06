import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Select, DatePicker, Space, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { ordersApi } from '../api/services.js';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusColors = {
  placed: 'blue',
  accepted: 'cyan',
  modified: 'orange',
  preparing: 'purple',
  ready: 'green',
  delivered: 'geekblue',
  completed: 'green',
  cancelled: 'red'
};

const OrdersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  const [filters, setFilters] = useState({
    search: '',
    status: undefined,
    paymentStatus: undefined,
    startDate: null,
    endDate: null
  });

  const navigate = useNavigate();

  const fetchOrders = async (page = 1, limit = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: currentFilters.search || undefined,
        status: currentFilters.status || undefined,
        isPaid: currentFilters.paymentStatus !== undefined ? currentFilters.paymentStatus : undefined,
        startDate: currentFilters.startDate ? currentFilters.startDate.toISOString() : undefined,
        endDate: currentFilters.endDate ? currentFilters.endDate.toISOString() : undefined
      };
      const response = await ordersApi.getAll(params);
      if (response.data?.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, pagination.pageSize, filters);
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchOrders(newPagination.current, newPagination.pageSize, filters);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <b>{text}</b>
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => record.customerName || record.customer?.name || 'N/A'
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => record.items?.length || 0
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text) => formatCurrency(text)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>{(status || '').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (paymentStatus, record) => {
        const isPaid = paymentStatus === 'paid' || record.isPaid;
        return (
          <Tag color={isPaid ? 'green' : 'orange'}>{isPaid ? 'PAID' : 'PENDING'}</Tag>
        );
      }
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm')
    }
  ];

  return (
    <Card bordered={false} title="Orders">
      <Space style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
        <Input
          placeholder="Search Order #"
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="Filter Status"
          style={{ width: 150 }}
          allowClear
          value={filters.status}
          onChange={(val) => setFilters({ ...filters, status: val })}
        >
          {Object.keys(statusColors).map((key) => (
            <Option key={key} value={key}>{key.toUpperCase()}</Option>
          ))}
        </Select>
        <Select
          placeholder="Payment Status"
          style={{ width: 150 }}
          allowClear
          value={filters.paymentStatus}
          onChange={(val) => setFilters({ ...filters, paymentStatus: val })}
        >
          <Option value={true}>Paid</Option>
          <Option value={false}>Pending</Option>
        </Select>
        <RangePicker
          value={[filters.startDate ? dayjs(filters.startDate) : null, filters.endDate ? dayjs(filters.endDate) : null]}
          onChange={(dates) => {
            if (dates) {
              setFilters({ ...filters, startDate: dates[0], endDate: dates[1] });
            } else {
              setFilters({ ...filters, startDate: null, endDate: null });
            }
          }}
        />
        <Button onClick={() => setFilters({ search: '', status: undefined, paymentStatus: undefined, startDate: null, endDate: null })}>
          Reset
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => navigate(`/orders/${record._id}`),
          style: { cursor: 'pointer' }
        })}
      />
    </Card>
  );
};

export default OrdersPage;

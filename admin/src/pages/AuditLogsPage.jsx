import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, DatePicker, Select, Space, Button } from 'antd';
import { auditLogsApi } from '../api/services.js';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [filters, setFilters] = useState({
    entityType: undefined,
    action: undefined,
    startDate: null,
    endDate: null
  });

  const fetchLogs = async (page = 1, limit = 15, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        entityType: currentFilters.entityType || undefined,
        action: currentFilters.action || undefined,
        startDate: currentFilters.startDate ? currentFilters.startDate.toISOString() : undefined,
        endDate: currentFilters.endDate ? currentFilters.endDate.toISOString() : undefined
      };
      const response = await auditLogsApi.getAll(params);
      if (response.data?.success) {
        setData(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total
        });
      }
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, pagination.pageSize, filters);
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchLogs(newPagination.current, newPagination.pageSize, filters);
  };

  const actionColors = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    login: 'purple',
    status_change: 'orange'
  };

  const columns = [
    { title: 'Timestamp', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm:ss'), width: 200 },
    { title: 'User', key: 'user', render: (_, record) => record.user?.name || 'System' },
    { title: 'Action', dataIndex: 'action', key: 'action', render: (action) => <Tag color={actionColors[action] || 'default'}>{(action || '').toUpperCase()}</Tag> },
    { title: 'Entity Type', dataIndex: 'entityType', key: 'entityType', render: (type) => type ? type.toUpperCase() : '-' },
    { title: 'Entity ID', dataIndex: 'entityId', key: 'entityId', render: (id) => id || '-' }
  ];

  return (
    <Card bordered={false} title="Audit Logs">
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Entity Type"
          style={{ width: 150 }}
          allowClear
          value={filters.entityType}
          onChange={(val) => setFilters({ ...filters, entityType: val })}
        >
          <Option value="user">User</Option>
          <Option value="order">Order</Option>
          <Option value="product">Product</Option>
          <Option value="category">Category</Option>
        </Select>
        <Select
          placeholder="Action"
          style={{ width: 150 }}
          allowClear
          value={filters.action}
          onChange={(val) => setFilters({ ...filters, action: val })}
        >
          <Option value="create">Create</Option>
          <Option value="update">Update</Option>
          <Option value="delete">Delete</Option>
          <Option value="login">Login</Option>
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
        <Button onClick={() => setFilters({ entityType: undefined, action: undefined, startDate: null, endDate: null })}>
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
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: 16, background: '#fafafa' }}>
              {record.changes ? (
                <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(record.changes, null, 2)}</pre>
              ) : (
                <p>No details available</p>
              )}
            </div>
          )
        }}
        size="small"
      />
    </Card>
  );
};

export default AuditLogsPage;

import React, { useEffect, useState } from 'react';
import { Card, Tabs, Row, Col, Statistic, Table, Select, Spin, message } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { reportsApi } from '../api/services.js';

const { Option } = Select;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState([]);
  const [payments, setPayments] = useState({ paid: 0, pending: 0, total: 0 });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes, customersRes, ordersRes, paymentsRes] = await Promise.all([
        reportsApi.getSales({ period }),
        reportsApi.getTopProducts(),
        reportsApi.getTopCustomers(),
        reportsApi.getOrdersSummary(),
        reportsApi.getPayments()
      ]);

      if (salesRes.data?.success) setSalesData(salesRes.data.data);
      if (productsRes.data?.success) setTopProducts(productsRes.data.data);
      if (customersRes.data?.success) setTopCustomers(customersRes.data.data);
      if (ordersRes.data?.success) setOrdersSummary(ordersRes.data.data);
      if (paymentsRes.data?.success) setPayments(paymentsRes.data.data);
    } catch (error) {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const customerColumns = [
    { title: 'Rank', dataIndex: 'rank', key: 'rank', render: (_, __, i) => i + 1 },
    { title: 'Customer', dataIndex: 'name', key: 'name', render: (text, record) => <b>{record.customer?.name || 'N/A'}</b> },
    { title: 'Total Orders', dataIndex: 'totalOrders', key: 'totalOrders' },
    { title: 'Total Spent', dataIndex: 'totalSpent', key: 'totalSpent', render: (val) => formatCurrency(val) }
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Sales & Revenue',
      children: (
        <Card bordered={false} title="Sales Trend" extra={
          <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
        }>
          {loading ? <Spin /> : (
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1890ff" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )
    },
    {
      key: '2',
      label: 'Top Products',
      children: (
        <Card bordered={false} title="Top 10 Products by Revenue">
          {loading ? <Spin /> : (
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product.name" />
                  <YAxis tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )
    },
    {
      key: '3',
      label: 'Top Customers',
      children: (
        <Card bordered={false} title="Most Active Customers">
          <Table 
            columns={customerColumns} 
            dataSource={topCustomers} 
            rowKey={(record) => record.customer?._id || Math.random()} 
            pagination={false} 
            loading={loading}
          />
        </Card>
      )
    },
    {
      key: '4',
      label: 'Orders Summary',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card bordered={false} title="Orders by Status">
              {loading ? <Spin /> : (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersSummary}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {ordersSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card bordered={false} title="Payments Status">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="Total Paid" value={payments.paid} formatter={formatCurrency} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Total Pending" value={payments.pending} formatter={formatCurrency} valueStyle={{ color: '#cf1322' }} />
                </Col>
                <Col span={24}>
                  <Statistic title="Total Processed" value={payments.total} formatter={formatCurrency} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Reports</h2>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  );
};

export default ReportsPage;

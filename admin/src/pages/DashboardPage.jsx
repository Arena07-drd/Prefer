import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Typography } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, ClockCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../api/services.js';
import dayjs from 'dayjs';

const { Title } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    pendingPayments: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesData: [],
    recentOrders: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, salesRes] = await Promise.all([
          reportsApi.getDashboard(),
          reportsApi.getSales({ period: 'daily' }).catch(() => ({ data: { data: [] } }))
        ]);

        const dashData = dashRes.data?.data || {};
        const sales = (salesRes.data?.data || []).map(s => ({
          date: s.date,
          amount: s.totalSales || 0
        }));

        setData({
          ...dashData,
          salesData: sales.length > 0 ? sales : [{ date: dayjs().format('YYYY-MM-DD'), amount: 0 }]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', render: (val, r) => val || r.customer?.name || 'N/A' },
    { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (val, r) => formatCurrency(val ?? r.total) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (val) => (val || '').toUpperCase() },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  }

  const todayOrders = data.todayOrders ?? data.stats?.todaysOrders ?? 0;
  const todayRevenue = data.todayRevenue ?? data.stats?.todaysRevenue ?? 0;
  const pendingOrders = data.pendingOrders ?? data.stats?.pendingOrders ?? 0;
  const pendingPayments = data.pendingPayments ?? data.stats?.pendingPayments ?? 0;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard Overview</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Today's Orders"
              value={todayOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Today's Revenue"
              value={todayRevenue}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              formatter={(val) => formatCurrency(val)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Orders"
              value={pendingOrders}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Payments"
              value={pendingPayments}
              prefix={<WalletOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Sales (Last 7 Days)" bordered={false} style={{ height: '100%' }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="amount" stroke="#1890ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Recent Orders" bordered={false} style={{ height: '100%' }} styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data.recentOrders || []}
              columns={columns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Tag, Typography, Button, Space, Divider, Select, Checkbox, Spin, Modal, message, Timeline, InputNumber } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi, productsApi } from '../api/services.js';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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

const nextValidStatuses = {
  placed: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  modified: ['accepted', 'cancelled'],
  preparing: ['ready'],
  ready: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: []
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getById(id);
      if (response.data?.success) {
        setOrder(response.data.data?.order || response.data.data);
      } else {
        message.error('Failed to load order');
      }
    } catch (error) {
      message.error('Error fetching order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      const res = await ordersApi.updateStatus(id, newStatus, 'Status updated by admin');
      if (res.data?.success) {
        message.success(`Status updated to ${newStatus}`);
        fetchOrder();
      }
    } catch (error) {
      message.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePaymentToggle = async (e) => {
    const isPaid = e.target.checked;
    try {
      setPaymentLoading(true);
      const res = await ordersApi.updatePayment(id, isPaid);
      if (res.data?.success) {
        message.success(`Payment marked as ${isPaid ? 'PAID' : 'PENDING'}`);
        fetchOrder();
      }
    } catch (error) {
      message.error('Failed to update payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const openEditModal = async () => {
    setEditItems((order.items || []).map(item => ({
      productId: item.productId?._id || item.productId,
      productName: item.productName || item.product?.name || 'Unknown',
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder ?? item.unitPrice ?? 0
    })));
    try {
      const res = await productsApi.getAll({ limit: 100 });
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      message.error('Failed to load products');
    }
    setIsEditModalVisible(true);
  };

  const handleUpdateOrder = async () => {
    try {
      const payload = {
        items: editItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      const res = await ordersApi.update(id, payload);
      if (res.data?.success) {
        message.success('Order updated successfully');
        setIsEditModalVisible(false);
        fetchOrder();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const prod = products.find(p => p._id === selectedProduct);
    if (!prod) return;
    
    const existingIndex = editItems.findIndex(i => i.productId === prod._id);
    if (existingIndex > -1) {
      const newItems = [...editItems];
      newItems[existingIndex].quantity += 1;
      setEditItems(newItems);
    } else {
      setEditItems([...editItems, { productId: prod._id, productName: prod.name, quantity: 1, priceAtOrder: prod.price }]);
    }
    setSelectedProduct(null);
  };

  const handleItemQuantityChange = (index, qty) => {
    const newItems = [...editItems];
    newItems[index].quantity = qty;
    setEditItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...editItems];
    newItems.splice(index, 1);
    setEditItems(newItems);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!order) return <div>Order not found</div>;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr;
    const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const columns = [
    { title: 'Product', key: 'product', render: (_, record) => record.productName || record.product?.name || 'Unknown' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Unit', key: 'unit', render: (_, record) => record.unit || record.product?.unit || 'piece' },
    { title: 'Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (val, record) => formatCurrency(record.priceAtOrder ?? val) },
    { title: 'Subtotal', key: 'subtotal', render: (_, record) => formatCurrency(record.subtotal ?? (record.quantity * (record.priceAtOrder ?? record.unitPrice ?? 0))) }
  ];

  const allowedNextStatuses = nextValidStatuses[order.status] || [];
  const canEdit = ['placed', 'accepted', 'modified'].includes(order.status);
  const isPaid = order.paymentStatus === 'paid' || order.isPaid;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space size="large">
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
          <Title level={3} style={{ margin: 0 }}>Order #{order.orderNumber}</Title>
          <Tag color={statusColors[order.status] || 'default'} style={{ fontSize: 14, padding: '4px 8px' }}>
            {(order.status || '').toUpperCase()}
          </Tag>
          <Tag color={isPaid ? 'green' : 'orange'} style={{ fontSize: 14, padding: '4px 8px' }}>
            {isPaid ? 'PAID' : 'PENDING'}
          </Tag>
        </Space>
        <Space>
          <Select 
            value={order.status} 
            onChange={handleStatusChange} 
            loading={statusLoading}
            style={{ width: 150 }}
            disabled={allowedNextStatuses.length === 0}
          >
            <Option value={order.status} disabled>{(order.status || '').toUpperCase()}</Option>
            {allowedNextStatuses.map(status => (
              <Option key={status} value={status}>{(status || '').toUpperCase()}</Option>
            ))}
          </Select>
          <Checkbox 
            checked={isPaid} 
            onChange={handlePaymentToggle} 
            disabled={paymentLoading}
          >
            Mark as Paid
          </Checkbox>
          {canEdit && (
            <Button type="primary" onClick={openEditModal}>
              Edit Order
            </Button>
          )}
        </Space>
      </div>

      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Descriptions title="Customer Information" bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Name">{order.customerName || order.customer?.name || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{order.customerPhone || order.customer?.phone || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Business">{order.customerBusinessName || order.customer?.businessName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Email">{order.customer?.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{formatAddress(order.customer?.address)}</Descriptions.Item>
          <Descriptions.Item label="Order Date">{dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Order Items" bordered={false} style={{ marginBottom: 24 }}>
        <Table
          dataSource={order.items}
          columns={columns}
          rowKey={(record, idx) => record._id || record.productId || `item_${idx}`}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">Subtotal: {formatCurrency(order.totalAmount)}</Text>
            <br />
            <Text type="secondary">Tax/Fees: {formatCurrency(0)}</Text>
            <Divider style={{ margin: '12px 0' }} />
            <Title level={3} style={{ margin: 0 }}>Total: {formatCurrency(order.totalAmount)}</Title>
          </div>
        </div>
      </Card>

      <Card title="Status History" bordered={false}>
        <Timeline
          items={(order.statusHistory || []).map(hist => ({
            color: statusColors[hist.status] || 'blue',
            children: (
              <>
                <Text strong>{(hist.status || '').toUpperCase()}</Text>
                <br />
                <Text type="secondary">{dayjs(hist.timestamp).format('DD MMM YYYY, HH:mm')} - {hist.note || 'Status updated'}</Text>
              </>
            )
          }))}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Order Items"
        open={isEditModalVisible}
        onOk={handleUpdateOrder}
        onCancel={() => setIsEditModalVisible(false)}
        width={800}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Search and select product"
            optionFilterProp="children"
            value={selectedProduct}
            onChange={setSelectedProduct}
          >
            {products.map(p => (
              <Option key={p._id} value={p._id}>{p.name} - {formatCurrency(p.price)}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleAddProduct}>Add Item</Button>
        </div>
        
        <Table
          dataSource={editItems}
          pagination={false}
          rowKey={(record, idx) => `edit_${idx}`}
          columns={[
            { title: 'Product', render: (_, record) => record.productName || record.product?.name || 'Unknown' },
            { title: 'Price', render: (_, record) => formatCurrency(record.priceAtOrder || record.product?.price || record.unitPrice) },
            { 
              title: 'Quantity', 
              render: (_, record, index) => (
                <InputNumber 
                  min={1} 
                  value={record.quantity} 
                  onChange={(val) => handleItemQuantityChange(index, val)} 
                />
              ) 
            },
            { 
              title: 'Action', 
              render: (_, __, index) => (
                <Button danger type="text" onClick={() => handleRemoveItem(index)}>Remove</Button>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default OrderDetailPage;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { Card, Chip, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { ordersApi } from '../../api/services.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const OrderDetailScreen = () => {
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersApi.getById(orderId);
        const orderDetails = data.data?.order || data.data;
        setOrder(orderDetails);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load order details'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status) => colors.statusColors[status] || colors.primary;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.orderTitle}>Order #{order.orderNumber}</Text>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
          </View>
          
          <View style={styles.badgeRow}>
            <Chip 
              style={[styles.badge, { backgroundColor: getStatusColor(order.status) }]}
              textStyle={styles.badgeText}
            >
              {(order.status || '').toUpperCase()}
            </Chip>
            <Chip 
              style={[styles.badge, { backgroundColor: colors.paymentColors[order.paymentStatus] || colors.border }]}
              textStyle={styles.badgeText}
            >
              {(order.paymentStatus || 'pending').toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Items" />
        <Card.Content>
          {(order.items || []).map((item, index) => {
            const name = item.productName || item.product?.name || 'Product';
            const price = item.priceAtOrder ?? item.price ?? 0;
            const subtotal = item.subtotal ?? (item.quantity * price);

            return (
              <View key={index}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{name}</Text>
                    <Text style={styles.itemQty}>{item.quantity} × ₹{price}</Text>
                  </View>
                  <Text style={styles.itemSubtotal}>₹{subtotal}</Text>
                </View>
                {index < (order.items || []).length - 1 && <Divider style={styles.divider} />}
              </View>
            );
          })}
          
          <Divider style={styles.thickDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount || 0}</Text>
          </View>
        </Card.Content>
      </Card>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card style={styles.section}>
          <Card.Title title="Timeline" />
          <Card.Content>
            {order.statusHistory.map((hist, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(hist.status) }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{(hist.status || '').toUpperCase()}</Text>
                  <Text style={styles.timelineDate}>{new Date(hist.timestamp || hist.date || order.createdAt).toLocaleString()}</Text>
                  {hist.note && <Text style={styles.timelineNote}>{hist.note}</Text>}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  orderTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    height: 28,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemSubtotal: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  thickDivider: {
    marginVertical: spacing.md,
    height: 2,
    backgroundColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  timelineDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  timelineNote: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.error,
  }
});

export default OrderDetailScreen;

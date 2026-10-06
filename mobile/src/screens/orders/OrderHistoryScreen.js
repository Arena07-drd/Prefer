import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ordersApi } from '../../api/services.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOrders = async (pageNum = 1, isRefresh = false) => {
    try {
      const { data } = await ordersApi.getAll({ page: pageNum, limit: 10 });
      const newOrders = data.data || [];
      
      if (isRefresh) {
        setOrders(newOrders);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }
      
      setHasMore(data.pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch orders'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders(1, true);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchOrders(page + 1);
    }
  };

  const getStatusColor = (status) => {
    return colors.statusColors[status] || colors.primary;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.itemCount}>{item.items?.length || 0} items</Text>
            <Text style={styles.total}>₹{item.totalAmount}</Text>
          </View>

          <View style={styles.badgeRow}>
            <Chip 
              style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.badgeText}
            >
              {(item.status || '').toUpperCase()}
            </Chip>
            <Chip 
              style={[styles.badge, { backgroundColor: colors.paymentColors[item.paymentStatus] || colors.border }]}
              textStyle={styles.badgeText}
            >
              {(item.paymentStatus || 'pending').toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemCount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  total: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    height: 24,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
    marginVertical: 0,
  },
  footerLoader: {
    marginVertical: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  }
});

export default OrderHistoryScreen;

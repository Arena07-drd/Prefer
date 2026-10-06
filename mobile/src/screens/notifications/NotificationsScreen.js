import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { notificationsApi } from '../../api/services.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    try {
      const { data } = await notificationsApi.getAll({ page: pageNum, limit: 20 });
      const newNotifs = data.data || [];
      if (isRefresh) {
        setNotifications(newNotifs);
      } else {
        setNotifications(prev => [...prev, ...newNotifs]);
      }
      setHasMore(data.pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch notifications' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(1, true);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1, true);
  }, []);

  const loadMore = () => {
    if (hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      Toast.show({ type: 'success', text1: 'Marked all as read' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to mark all as read' });
    }
  };

  const handlePress = async (item) => {
    if (!item.read) {
      try {
        await notificationsApi.markAsRead(item._id);
        setNotifications(notifications.map(n => n._id === item._id ? { ...n, read: true } : n));
      } catch (error) {
        // ignore silently
      }
    }
    if (item.data?.orderId) {
      navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId: item.data.orderId } });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]} 
      onPress={() => handlePress(item)}
    >
      <View style={styles.iconContainer}>
        <Icon name="bell" size={24} color={!item.read ? colors.primary : colors.textSecondary} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
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
      <Appbar.Header style={{ backgroundColor: colors.surface }}>
        <Appbar.Content title="Notifications" />
        <Appbar.Action icon="check-all" onPress={handleMarkAllRead} />
      </Appbar.Header>
      
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-off-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
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
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadItem: {
    backgroundColor: '#e6f4ff', // Light primary tint
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  unreadText: {
    color: colors.primary,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  }
});

export default NotificationsScreen;

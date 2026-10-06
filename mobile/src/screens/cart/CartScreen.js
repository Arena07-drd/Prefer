import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import { Button, IconButton, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore.js';
import { ordersApi } from '../../api/services.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const navigation = useNavigation();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const total = getTotal();

  const handlePlaceOrder = () => {
    if (items.length === 0) return;

    Alert.alert(
      "Confirm Order",
      `Are you sure you want to place this order? Total: ₹${total}`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Place Order", 
          onPress: submitOrder
        }
      ]
    );
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        notes: ""
      };
      const { data } = await ordersApi.create(orderData);
      clearCart();
      const placedOrder = data.data?.order || data.data;
      navigation.navigate('OrderSuccess', { 
        orderId: placedOrder._id, 
        orderNumber: placedOrder.orderNumber, 
        total: placedOrder.totalAmount 
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error.response?.data?.message || 'Failed to place order'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.itemPrice}>₹{item.price} / {item.unit}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.qtyContainer}>
          <IconButton 
            icon="minus" 
            size={20} 
            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
          />
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <IconButton 
            icon="plus" 
            size={20} 
            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
          />
        </View>
        <Text style={styles.itemSubtotal}>₹{item.price * item.quantity}</Text>
      </View>
      <IconButton 
        icon="delete" 
        iconColor={colors.error}
        size={24}
        onPress={() => removeItem(item.productId)}
        style={styles.removeButton}
      />
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconButton icon="cart-outline" size={80} iconColor={colors.border} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Home')}
          style={styles.browseButton}
        >
          Browse Products
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.productId}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
        <Button 
          mode="contained" 
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading || items.length === 0}
          style={styles.placeOrderButton}
          contentStyle={styles.placeOrderButtonContent}
        >
          Place Order
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 2,
    paddingRight: spacing.sm,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemActions: {
    flex: 1.5,
    alignItems: 'center',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  removeButton: {
    margin: 0,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  placeOrderButton: {
    borderRadius: 8,
  },
  placeOrderButtonContent: {
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  browseButton: {
    marginTop: spacing.md,
  }
});

export default CartScreen;

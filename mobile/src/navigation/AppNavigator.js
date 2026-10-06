import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from '../screens/home/HomeScreen.js';
import ProductDetailScreen from '../screens/home/ProductDetailScreen.js';
import CartScreen from '../screens/cart/CartScreen.js';
import OrderSuccessScreen from '../screens/cart/OrderSuccessScreen.js';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen.js';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen.js';
import NotificationsScreen from '../screens/notifications/NotificationsScreen.js';
import ProfileScreen from '../screens/profile/ProfileScreen.js';

import { useCartStore } from '../store/cartStore.js';
import { colors } from '../constants/theme.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Products' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'Shopping Cart' }} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="cart" color={color} size={size} />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="receipt" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          tabBarIcon: ({ color, size }) => <Icon name="bell" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          tabBarIcon: ({ color, size }) => <Icon name="account" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;

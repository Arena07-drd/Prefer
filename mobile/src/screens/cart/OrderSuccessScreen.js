import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, fontSize } from '../../constants/theme.js';

const OrderSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, orderNumber, total } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="check-circle" size={100} color={colors.success} style={styles.icon} />
        
        <Text style={styles.title}>Order Placed Successfully!</Text>
        
        <View style={styles.detailsBox}>
          <Text style={styles.label}>Order Number</Text>
          <Text style={styles.value}>{orderNumber}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Total Amount</Text>
          <Text style={styles.amount}>₹{total}</Text>
        </View>

        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('OrderDetail', { orderId })}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          View Order
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Continue Shopping
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  amount: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  }
});

export default OrderSuccessScreen;

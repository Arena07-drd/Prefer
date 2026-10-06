import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, ActivityIndicator } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { productsApi } from '../../api/services.js';
import { useCartStore } from '../../store/cartStore.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const ProductDetailScreen = () => {
  const route = useRoute();
  const { productId } = route.params;
  
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartItem = items.find(i => i.productId === productId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productsApi.getById(productId);
        setProduct(data.data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load product details',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      Toast.show({
        type: 'success',
        text1: 'Added to cart'
      });
    }
  };

  const handleIncrement = () => {
    if (product) {
      updateQuantity(productId, qtyInCart + 1);
    }
  };

  const handleDecrement = () => {
    if (qtyInCart > 1) {
      updateQuantity(productId, qtyInCart - 1);
    } else {
      removeItem(productId);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: (product.images && product.images[0]) || product.imageUrl || 'https://via.placeholder.com/400' }} 
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
        </View>
        <Text style={styles.unit}>Unit: {product.unit}</Text>
        {product.category && (
          <Text style={styles.category}>Category: {product.category.name}</Text>
        )}
        
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {product.description || 'No description available for this product.'}
        </Text>

        <View style={styles.actionContainer}>
          {qtyInCart > 0 ? (
            <View style={styles.qtyContainer}>
              <IconButton 
                icon="minus" 
                mode="contained-tonal"
                onPress={handleDecrement}
                size={24}
              />
              <Text style={styles.qtyText}>{qtyInCart}</Text>
              <IconButton 
                icon="plus" 
                mode="contained-tonal"
                onPress={handleIncrement}
                size={24}
              />
            </View>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleAddToCart}
              style={styles.addButton}
              contentStyle={styles.addButtonContent}
            >
              Add to Cart
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.md,
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  unit: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  actionContainer: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  qtyText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginHorizontal: spacing.xl,
  },
  addButton: {
    borderRadius: 8,
  },
  addButtonContent: {
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.error,
  }
});

export default ProductDetailScreen;

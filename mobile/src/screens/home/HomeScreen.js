import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { productsApi, categoriesApi } from '../../api/services.js';
import { useCartStore } from '../../store/cartStore.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const HomeScreen = () => {
  const navigation = useNavigation();
  const addToCart = useCartStore(state => state.addItem);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesApi.getAll(),
        productsApi.getAll({ category: selectedCategory || undefined, search: searchQuery || undefined })
      ]);
      setCategories([{ _id: null, name: 'All' }, ...(catRes.data.data || [])]);
      setProducts(prodRes.data.data || []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching data',
        text2: error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [selectedCategory, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [selectedCategory, searchQuery]);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Toast.show({
      type: 'success',
      text1: 'Added to cart',
      text2: `${product.name} added to your cart`,
      visibilityTime: 2000
    });
  };

  const renderProduct = ({ item }) => (
    <Card style={styles.productCard} onPress={() => handleProductPress(item)}>
      <Card.Cover 
        source={{ uri: (item.images && item.images[0]) || item.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.productImage}
      />
      <Card.Content style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <Text style={styles.productUnit}>per {item.unit}</Text>
      </Card.Content>
      <Card.Actions style={styles.productActions}>
        <Button 
          mode="contained" 
          onPress={() => handleAddToCart(item)}
          style={styles.addButton}
          labelStyle={{ fontSize: 12 }}
        >
          Add
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item._id && styles.categoryChipSelected
      ]}
      onPress={() => setSelectedCategory(item._id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item._id && styles.categoryTextSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
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
    padding: spacing.xl,
  },
  searchBar: {
    margin: spacing.md,
    backgroundColor: colors.surface,
  },
  categoriesContainer: {
    height: 50,
    marginBottom: spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: colors.surface,
  },
  productsList: {
    padding: spacing.sm,
  },
  productCard: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: colors.surface,
  },
  productImage: {
    height: 120,
  },
  productContent: {
    padding: spacing.sm,
  },
  productName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  productUnit: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  productActions: {
    paddingTop: 0,
    justifyContent: 'flex-end',
  },
  addButton: {
    width: '100%',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  }
});

export default HomeScreen;

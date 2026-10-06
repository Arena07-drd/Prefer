import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, qty) => {
    const items = get().items;
    const existing = items.find(i => i.productId === product._id);
    const minQty = product.minOrderQuantity || 1;
    const addQty = qty || minQty;

    if (existing) {
      set({
        items: items.map(i =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + (qty || 1) }
            : i
        )
      });
    } else {
      set({
        items: [...items, {
          productId: product._id,
          productName: product.name,
          price: product.price,
          unit: product.unit,
          quantity: addQty,
          minQuantity: minQty,
          maxQuantity: product.maxOrderQuantity || null
        }]
      });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map(i => {
        if (i.productId === productId) {
          const min = i.minQuantity || 1;
          // If decreasing below min, remove it
          if (quantity < min) {
            return null;
          }
          return { ...i, quantity };
        }
        return i;
      }).filter(Boolean)
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getItemCount: () => get().items.length
}));

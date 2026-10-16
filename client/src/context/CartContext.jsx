import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, demoLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem('ath_token');
    if (!token && !user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      // If no active session, auto-authenticate as demo farmer so farmer order buttons always work flawlessly
      let token = localStorage.getItem('ath_token');
      if (!token || !user) {
        const demoRes = await demoLogin('farmer');
        if (demoRes) {
          // Token is now set in localStorage
        }
      }

      const res = await api.addToCart({ product_id: productId, quantity });
      if (res.success) {
        await fetchCart();
        setIsOpen(true);
      }
      return res;
    } catch (e) {
      console.error('addToCart error:', e);
      throw e;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await api.updateCartItem(cartItemId, quantity);
      if (res.success) {
        await fetchCart();
      }
      return res;
    } catch (e) {
      throw e;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await api.removeCartItem(cartItemId);
      if (res.success) {
        await fetchCart();
      }
      return res;
    } catch (e) {
      throw e;
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setItems([]);
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      loading,
      isOpen,
      setIsOpen,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

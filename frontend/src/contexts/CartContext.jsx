import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get('/cart');
      if (res.data.success && res.data.data.items) {
        const count = res.data.data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, message: 'Debes iniciar sesión para agregar al carrito' };
    }
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      if (res.data.success) {
        await fetchCartCount();
        return { success: true, message: 'Producto agregado al carrito' };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Error al agregar al carrito' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data.success) {
        await fetchCartCount();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Error al eliminar del carrito' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCartCount();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Error al actualizar cantidad' };
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

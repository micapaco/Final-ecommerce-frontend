import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Cargar carrito desde localStorage al iniciar
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Escuchar cambios en localStorage (para sincronizar cuando se cierra sesión)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart || savedCart === '[]') {
        setCart([]);
      }
    };

    // Escuchar el evento storage (cuando otra pestaña cambia localStorage)
    window.addEventListener('storage', handleStorageChange);

    // También verificar periódicamente (para la misma pestaña)
    const checkInterval = setInterval(() => {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart && cart.length > 0) {
        setCart([]);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [cart.length]);

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id_key === product.id_key);

      if (existingItem) {
        // Si el producto ya está en el carrito, aumentar cantidad (hasta el límite de stock)
        return prevCart.map((item) =>
          item.id_key === product.id_key
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      } else {
        // Agregar nuevo producto al carrito con cantidad 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id_key !== productId));
  };

  // Actualizar cantidad del producto
  const updateQuantity = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id_key === productId
          ? { ...item, quantity: Math.max(1, Math.min(newQuantity, item.stock)) }
          : item
      )
    );
  };

  // Vaciar todo el carrito
  const clearCart = () => {
    setCart([]);
  };

  // Calcular subtotal (suma de todos los productos)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calcular envío (gratis si subtotal >= 119999, sino 5000)
  const shipping = subtotal >= 119999 ? 0 : (cart.length > 0 ? 5000 : 0);

  // Calcular total (subtotal + envío)
  const total = subtotal + shipping;

  // Calcular cantidad total de items
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

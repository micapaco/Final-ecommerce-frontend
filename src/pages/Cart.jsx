import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Sparkles, Ticket, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, subtotal, shipping, total, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  // Umbral para envío gratis
  const FREE_SHIPPING_THRESHOLD = 119999;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-pink-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">¡Descubrí nuestros productos y comenzá a agregar!</p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Mi carrito</h1>
            <span className="bg-pink-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
          <button
            onClick={clearCart}
            className="text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos - Columna izquierda */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id_key}
                className="bg-white rounded-xl shadow-sm p-6 flex gap-6"
              >
                {/* Imagen */}
                <div className="w-24 h-24 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-pink-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.id_key}`}
                    className="font-semibold text-gray-800 hover:text-pink-600 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id_key, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id_key, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id_key)}
                    className="mt-3 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Precio */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-gray-800">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">
                      ${item.price.toLocaleString('es-AR')} c/u
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Resumen - Columna derecha */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen de mi compra</h2>

              {/* Input cupón */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ingresá tu cupón acá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                </div>
                <button className="px-4 py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600 transition-colors">
                  Agregar
                </button>
              </div>

              {/* Totales */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800 font-medium">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-800'}>
                    {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-AR')}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-xl text-gray-800">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Mensaje envío gratis */}
              {shipping === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-6">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">¡Tenés envío gratis!</span>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 rounded-lg mb-6">
                  <p className="text-sm text-orange-800">
                    Sumá <span className="font-bold">${amountForFreeShipping.toLocaleString('es-AR')}</span> para envío gratis
                  </p>
                </div>
              )}

              {/* Botones */}
              <Link
                to="/checkout"
                className="block w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-center rounded-xl hover:shadow-lg transition-all mb-3"
              >
                Finalizar compra
              </Link>

              <Link
                to="/productos"
                className="block w-full py-3 border-2 border-pink-500 text-pink-600 font-semibold text-center rounded-xl hover:bg-pink-50 transition-all"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>

        {/* Link volver */}
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 mt-8 text-gray-600 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>
      </div>
    </div>
  );
};

export default Cart;

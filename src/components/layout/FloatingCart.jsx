import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FloatingCart = ({ isOpen, onClose }) => {
    const { cart, subtotal, shipping, total, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();

    // Umbral para envío gratis (en pesos)
    const FREE_SHIPPING_THRESHOLD = 119999;
    const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <>
            {/* Fondo oscuro */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Carrito flotante */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-800">Mi Carrito</h2>
                        {itemCount > 0 && (
                            <span className="bg-pink-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {cart.length === 0 ? (
                    /* Estado: Carrito vacío */
                    <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] p-8">
                        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-12 h-12 text-pink-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
                        <p className="text-gray-500 text-center mb-6">
                            ¡Descubrí nuestros productos y comenzá a agregar!
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            Seguir comprando
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(100%-80px)]">
                        {/* Barra de progreso envío gratis */}
                        <div className="p-4 bg-green-50 border-b">
                            {amountForFreeShipping > 0 ? (
                                <>
                                    <p className="text-sm text-green-800 mb-2">
                                        Sumá <span className="font-bold">${amountForFreeShipping.toLocaleString('es-AR')}</span> para envío gratis
                                    </p>
                                    <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    ¡Tenés envío gratis!
                                </p>
                            )}
                        </div>

                        {/* Lista de productos */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id_key}
                                    className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                                >
                                    {/* Imagen del producto */}
                                    <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <ShoppingBag className="w-8 h-8 text-pink-300" />
                                        )}
                                    </div>

                                    {/* Información del producto */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                                            {item.name}
                                        </h4>

                                        {/* Controles de cantidad */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id_key, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                <Minus className="w-3 h-3 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id_key, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                <Plus className="w-3 h-3 text-gray-600" />
                                            </button>

                                            <button
                                                onClick={() => removeFromCart(item.id_key)}
                                                className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Precio del producto */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-gray-800">
                                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                                        </p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-gray-500">
                                                ${item.price.toLocaleString('es-AR')} c/u
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer con totales */}
                        <div className="border-t p-4 bg-white">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-800">${subtotal.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Envío</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-800'}>
                                        {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-AR')}`}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="font-bold text-gray-800">Total</span>
                                    <span className="font-bold text-xl text-pink-600">
                                        ${total.toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <Link
                                to="/checkout"
                                onClick={onClose}
                                className="block w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-center rounded-xl hover:shadow-lg transition-all mb-3"
                            >
                                Finalizar Compra
                            </Link>

                            <button
                                onClick={() => {
                                    clearCart();
                                }}
                                className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingCart;

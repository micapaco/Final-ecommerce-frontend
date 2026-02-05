import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Home } from 'lucide-react';

const CheckoutSuccess = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                    {/* Icono de éxito animado */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                        <CheckCircle className="w-14 h-14 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-3">
                        ¡Pedido realizado con éxito!
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.
                    </p>

                    {/* Número de pedido */}
                    {orderId && (
                        <div className="bg-pink-50 rounded-xl p-4 mb-8 inline-block">
                            <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
                            <p className="text-2xl font-bold text-pink-600">#{orderId}</p>
                        </div>
                    )}

                    {/* Próximos pasos */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-pink-500" />
                            Próximos pasos
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                <span>Recibirás un email de confirmación con los detalles de tu pedido.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                <span>Prepararemos tu pedido con mucho cuidado.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                <span>Te notificaremos cuando esté listo para retiro o en camino.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/perfil"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            Ver mis pedidos
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-pink-500 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Volver al inicio
                        </Link>
                    </div>

                    {/* Seguir comprando */}
                    <div className="mt-8 pt-6 border-t">
                        <Link
                            to="/productos"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Seguir comprando</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;

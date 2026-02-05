import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Home } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener datos del pedido desde el state
  const orderData = location.state;
  
  if (!orderData) {
    // Si no hay datos, redirigir al inicio
    navigate('/');
    return null;
  }
  
  const { orderNumber, customerName, total, deliveryMethod, paymentMethod } = orderData;
  
  const deliveryMethodText = {
    'pickup': 'Retiro en tienda',
    'delivery': 'Envío a domicilio'
  };
  
  const paymentMethodText = {
    'cash': 'Efectivo',
    'card': 'Tarjeta de Crédito/Débito',
    'transfer': 'Transferencia Bancaria'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-xl text-gray-600">
              Gracias por tu compra, {customerName}
            </p>
          </div>
          
          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Número de Pedido
              </h2>
              <p className="text-3xl font-bold text-pink-600">
                {orderNumber}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Guarda este número para hacer seguimiento de tu pedido
              </p>
            </div>
            
            {/* Detalles del Pedido */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Total del Pedido</h3>
                  <p className="text-2xl font-bold text-pink-600">
                    ${total.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Método de Envío</h3>
                  <p className="text-gray-600">{deliveryMethodText[deliveryMethod]}</p>
                  {deliveryMethod === 'pickup' && (
                    <p className="text-sm text-gray-500 mt-1">
                      📍 Dirección: Av. Corrientes 1234, CABA
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Método de Pago</h3>
                  <p className="text-gray-600">{paymentMethodText[paymentMethod]}</p>
                  {paymentMethod === 'transfer' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Te enviaremos los datos bancarios por email
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Boxes */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Confirmación por Email
              </h3>
              <p className="text-sm text-blue-800">
                Te hemos enviado un email con los detalles de tu pedido y el número de seguimiento
              </p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Tiempo de Entrega
              </h3>
              <p className="text-sm text-green-800">
                {deliveryMethod === 'pickup' 
                  ? 'Tu pedido estará listo para retiro en 24-48 horas'
                  : 'Recibirás tu pedido en 3-5 días hábiles'
                }
              </p>
            </div>
          </div>
          
          {/* Próximos Pasos */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ¿Qué sigue ahora?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-pink-600">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Preparamos tu pedido</p>
                  <p className="text-sm text-gray-600">Nuestro equipo comenzará a preparar tus productos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-pink-600">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Te notificamos por email</p>
                  <p className="text-sm text-gray-600">Recibirás actualizaciones sobre el estado de tu pedido</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-pink-600">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {deliveryMethod === 'pickup' ? 'Retiras tu pedido' : 'Recibe tu pedido'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {deliveryMethod === 'pickup' 
                      ? 'Te avisaremos cuando esté listo para retirar'
                      : 'Nuestro servicio de envío lo llevará a tu domicilio'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Volver al Inicio
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white text-pink-600 border-2 border-pink-300 px-8 py-4 rounded-xl font-bold hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Comprobante
            </button>
          </div>
          
          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">¿Necesitas ayuda?</p>
            <a href="/contacto" className="text-pink-600 font-semibold hover:text-pink-700">
              Contáctanos
            </a>
            {' · '}
            <a href="#" className="text-pink-600 font-semibold hover:text-pink-700">
              Preguntas Frecuentes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

import React from 'react';
import { Link } from 'react-router-dom';
import { IoSparkles } from 'react-icons/io5';
import { FiInstagram, FiFacebook, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer
      id="nosotros"
      className="text-white mt-20"
      style={{ backgroundColor: '#5C2E3E' }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Sección de Marca */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <IoSparkles
                className="text-3xl"
                style={{
                  color: '#C0C0C0',
                  filter: 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.8)) brightness(1.3)',
                }}
              />
              <span
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #B8B8B8 0%, #FFFFFF 50%, #B8B8B8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 6px rgba(192, 192, 192, 0.4))',
                }}
              >
                The Essentials
              </span>
            </Link>
            <p className="text-pink-100 text-sm">
              Tu destino para el cuidado de la piel premium. Productos esenciales para una piel radiante.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-pink-100">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className="hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Atención al Cliente */}
          <div>
            <h3 className="font-bold text-lg mb-4">Atención al Cliente</h3>
            <ul className="space-y-2 text-pink-100">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/envios" className="hover:text-white transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link to="/devoluciones" className="hover:text-white transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="font-bold text-lg mb-4">Síguenos</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiTwitter className="w-6 h-6" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-pink-100">
              <FiMail className="w-5 h-5" />
              <a
                href="mailto:info@theessentials.com"
                className="text-sm hover:text-white transition-colors"
              >
                info@theessentials.com
              </a>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="border-t border-pink-300/20 mt-8 pt-8 text-center text-pink-100 text-sm">
          <p>&copy; 2026 The Essentials. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

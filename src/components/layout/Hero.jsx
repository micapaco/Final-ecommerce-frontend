import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[70vh] overflow-hidden flex items-center justify-center">
      {/* Imagen de fondo - Cobertura completa */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero-skincare.png)',
        }}
      ></div>

      {/* Contenido - Centrado */}
      <div className="relative z-10 text-center px-4 py-16">
        {/* Título Principal */}
        <h1
          className={`text-4xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          Descubre tu
        </h1>
        <h2
          className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
            Rutina Perfecta
          </span>
        </h2>

        {/* Subtítulo */}
        <p
          className={`text-base md:text-lg text-gray-700 mb-8 max-w-xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          Productos esenciales de <span className="font-semibold text-pink-600">alta calidad</span> para el cuidado de tu piel.
          <br />
          Encuentra lo que tu piel realmente necesita.
        </p>

        {/* Estadísticas */}
        <div
          className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-pink-600">100+</div>
            <div className="text-gray-600 text-xs">Productos</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-pink-600">100%</div>
            <div className="text-gray-600 text-xs">Originales</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-pink-600">24h</div>
            <div className="text-gray-600 text-xs">Envío Express</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

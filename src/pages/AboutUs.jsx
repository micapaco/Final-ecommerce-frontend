import React from 'react';

const AboutUs = () => {
    return (
        <div className="bg-gradient-to-b from-pink-50 to-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-r from-pink-100 via-white to-pink-100">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
                        Sobre <span className="text-pink-500 font-medium">Nosotros</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Tu destino de confianza para el cuidado de tu piel
                    </p>
                </div>
            </section>

            {/* Nuestra Historia */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-light text-gray-800 mb-4">
                                Nuestra Historia
                            </h2>
                            <div className="w-24 h-1 bg-pink-400 mx-auto rounded-full"></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                            <p className="text-gray-600 leading-relaxed text-lg mb-6">
                                Nacimos con la pasión de llevar los mejores productos de skincare a tu puerta.
                                Creemos que el cuidado de la piel no debería ser complicado ni inaccesible.
                            </p>
                            <p className="text-gray-600 leading-relaxed text-lg mb-6">
                                Nuestro equipo selecciona cuidadosamente cada producto, trabajando directamente
                                con las marcas más reconocidas del mundo para garantizar autenticidad y calidad.
                            </p>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Desde nuestra fundación, hemos ayudado a miles de personas a encontrar
                                la rutina perfecta para su tipo de piel.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nuestros Valores */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light text-gray-800 mb-4">
                            Nuestros Valores
                        </h2>
                        <div className="w-24 h-1 bg-pink-400 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-pink-50 to-white border border-pink-100">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Autenticidad</h3>
                            <p className="text-gray-600">
                                100% productos originales directamente de las marcas oficiales.
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-pink-50 to-white border border-pink-100">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Pasión</h3>
                            <p className="text-gray-600">
                                Amamos lo que hacemos y queremos compartirlo contigo.
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-pink-50 to-white border border-pink-100">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Rapidez</h3>
                            <p className="text-gray-600">
                                Envíos rápidos y seguros para que empieces tu rutina cuanto antes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Por qué elegirnos */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light text-gray-800 mb-4">
                            ¿Por qué elegirnos?
                        </h2>
                        <div className="w-24 h-1 bg-pink-400 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">Asesoramiento personalizado</h4>
                                <p className="text-gray-600 text-sm">Te ayudamos a encontrar lo mejor para tu piel.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">Las mejores marcas</h4>
                                <p className="text-gray-600 text-sm">CeraVe, La Roche-Posay, The Ordinary y más.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">Envío a todo el país</h4>
                                <p className="text-gray-600 text-sm">Llegamos a donde estés con envío seguro.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                4
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">Compra segura</h4>
                                <p className="text-gray-600 text-sm">Pagos protegidos y garantía en todos los productos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 bg-gradient-to-r from-pink-500 to-pink-400">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-light text-white mb-4">
                        ¿Lista para empezar tu rutina?
                    </h2>
                    <p className="text-pink-100 mb-8 max-w-xl mx-auto">
                        Descubre nuestra selección de productos y encuentra lo perfecto para ti.
                    </p>
                    <a
                        href="/productos"
                        className="inline-block px-8 py-3 bg-white text-pink-500 font-medium rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Ver productos
                    </a>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;

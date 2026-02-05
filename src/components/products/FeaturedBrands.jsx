import React from 'react';
import { Link } from 'react-router-dom';

// Marcas destacadas - puedes agregar más o conectar a una API
const brands = [
    { id: 1, name: 'CeraVe', style: 'font-bold' },
    { id: 2, name: "La Roche-Posay", style: 'italic' },
    { id: 3, name: 'The Ordinary', style: 'font-light tracking-widest uppercase text-sm' },
    { id: 4, name: 'Neutrogena', style: 'font-bold' },
    { id: 5, name: 'Bioderma', style: 'font-medium' },
    { id: 6, name: 'Vichy', style: 'font-bold tracking-wide' },
    { id: 7, name: 'ISDIN', style: 'font-black tracking-widest' },
    { id: 8, name: 'Eucerin', style: 'font-semibold' },
    { id: 9, name: 'Avène', style: 'italic font-medium' },
    { id: 10, name: 'SKIN1004', style: 'font-light tracking-widest' },
    { id: 11, name: 'mixsoon', style: 'font-medium lowercase' },
    { id: 12, name: 'Beauty of Joseon', style: 'font-light italic' },
];

const FeaturedBrands = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-10">
                    <h2 className="text-2xl font-medium text-gray-800">
                        Marcas destacadas
                    </h2>
                </div>

                {/* Grid de marcas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {brands.map((brand) => (
                        <div
                            key={brand.id}
                            className="border border-gray-200 rounded-lg py-6 px-4 flex items-center justify-center bg-white"
                        >
                            <span className={`text-gray-700 ${brand.style}`}>
                                {brand.name}
                            </span>
                        </div>
                    ))}
                </div>


            </div>
        </section>
    );
};

export default FeaturedBrands;

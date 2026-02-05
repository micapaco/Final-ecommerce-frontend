import { Truck, CreditCard, Gift, Shield } from 'lucide-react';

const PromoBar = () => {
    const promos = [
        { icon: CreditCard, text: '6 cuotas sin interés' },
        { icon: Truck, text: 'Envío gratis +$119.999' },
        { icon: Gift, text: 'Beneficios exclusivos' },
        { icon: Shield, text: '100% originales' },
    ];

    // Duplicar para loop infinito
    const duplicatedPromos = [...promos, ...promos, ...promos];

    return (
        <div className="bg-neutral-900 text-white py-2.5 overflow-hidden relative">
            {/* Bordes con desvanecimiento */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-neutral-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-neutral-900 to-transparent z-10" />

            <div className="animate-marquee flex whitespace-nowrap">
                {duplicatedPromos.map((promo, index) => {
                    const Icon = promo.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 mx-10"
                        >
                            <Icon className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-xs tracking-wide">{promo.text}</span>
                            <span className="mx-6 text-neutral-600">•</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PromoBar;

'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper/types';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/effect-fade';

// Simular datos
const dishes = [
    {
        id: 1,
        name: 'Bombones Bianchi Caramelo',
        description: 'Exquisitos bombones de chocolate rellenos con suave caramelo. El equilibrio perfecto entre lo dulce y lo cremoso para consentirte.',
        price: '5.50',
        image: '/Images/bianchi caramelo chocolate.jpg',
    },
    {
        id: 2,
        name: 'Galletas Bilo',
        description: 'Crujientes galletas tipo wafer rellenas de crema de chocolate. Ideales para la merienda o acompañar con un café con leche calientico.',
        price: '3.00',
        image: '/Images/Bilo.png',
    },
    {
        id: 3,
        name: 'Chocolates Savoy',
        description: 'El sabor de Venezuela en una barra. Chocolate de leche con el aroma y la calidad única que solo Savoy puede ofrecer.',
        price: '2.50',
        image: '/Images/chocolate savey.png',
    },
    {
        id: 4,
        name: 'Doritos Mega Queso',
        description: 'Tortillas de maíz increíblemente crujientes con un sabor intenso a queso. El snack infaltable para cualquier reunión o tarde de películas.',
        price: '4.00',
        image: '/Images/doritos.jpg',
    },
];

export default function DigitalMenu() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
    const cursorTimerRef = useRef<NodeJS.Timeout | null>(null);
    const menuDivRef = useRef<HTMLDivElement>(null);

    // Ocultar el mouse
    const handleMouseMove = () => {
        if (menuDivRef.current) {
            menuDivRef.current.style.cursor = 'auto';
            if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
            cursorTimerRef.current = setTimeout(() => {
                if (menuDivRef.current) {
                    menuDivRef.current.style.cursor = 'none';
                }
            }, 2000);
        }
    };

    // Ir a la página especificada
    const goToSlide = (index: number) => {
        if (swiperInstance) {
            swiperInstance.slideToLoop(index);
        }
    };

    useEffect(() => {
        const currentMenuDiv = menuDivRef.current;

        if (currentMenuDiv) {
            currentMenuDiv.style.cursor = 'none';
        }

        return () => {
            if (currentMenuDiv) {
                currentMenuDiv.style.cursor = 'auto';
            }
            if (cursorTimerRef.current) {
                clearTimeout(cursorTimerRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={menuDivRef}
            className="digital-menu fixed top-0 left-0 w-screen h-screen overflow-hidden bg-primary p-[4vh] flex flex-col gap-[2vh]"
            onMouseMove={handleMouseMove}
        >

            <header className="w-full flex justify-between items-center px-10 py-6 bg-white rounded-2xl shadow-xl border-b-4 border-cuaternary">
                <div className="flex items-center gap-6">

                    {/* Logo Contenedor */}
                    <div className="relative w-16 h-16">
                        <Image
                            src="/Logo/Chuchu_logo.png"
                            alt="Chuchu Snack Bar Logo"
                            fill
                            sizes="64px"
                            className="object-contain"
                            priority
                        />
                    </div>

                    <div>
                        <h2 className="text-primary font-black text-4xl tracking-tighter uppercase leading-none mb-1">
                            Chuchu <span className="text-secondary">Snack Bar</span>
                        </h2>
                        <p className="text-foreground/40 text-sm font-bold tracking-[0.3em] uppercase">Premium Selection</p>
                    </div>
                </div>

                <div className="bg-quinary px-6 py-3 rounded-xl shadow-lg">
                    <span className="text-white font-black text-xl flex items-center gap-3">
                        <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        OFERTAS DEL DÍA
                    </span>
                </div>
            </header>

            {/* --- Swiper Contenedor --- */}
            <div className="flex-1 min-h-0 w-full relative">
                <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    loop={true}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    speed={1000}
                    allowTouchMove={false}
                    onSwiper={(swiper) => setSwiperInstance(swiper)}
                    onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                    className="w-full h-full rounded-3xl"
                >
                    {dishes.map((dish) => (
                        <SwiperSlide key={dish.id} className="w-full h-full">
                            <div className="flex flex-row w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-white">

                                {/* Izquierda Imagen */}
                                <div className="flex-[0_0_50%] h-full relative">
                                    <Image
                                        src={dish.image}
                                        alt={dish.name}
                                        fill
                                        sizes='50vw'
                                        className="object-cover animate-kenburns"
                                        priority
                                    />
                                </div>

                                {/* Derecha Informacion */}
                                <div className="flex-[0_0_50%] h-full bg-secondary flex items-center p-[5vw] relative">
                                    <div className="relative z-10 w-full">
                                        <h1 className="titulo-combo text-[8vh] leading-[1.1] mb-[3vh]">
                                            {dish.name}
                                        </h1>
                                        <p className="text-white text-[3vh] leading-[1.4] mb-[4vh] font-medium opacity-90">
                                            {dish.description}
                                        </p>
                                        <div className="flex items-start gap-2">
                                            <span className="text-[4vh] font-black text-cuaternary mt-2">$</span>
                                            <span className="precio-tv text-[15vh] leading-[0.8]">
                                                {dish.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* --- Indicador de salto de página --- */}
            <div className="flex justify-center gap-3 py-2">
                {dishes.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-500 rounded-full ${currentIndex === index
                            ? 'w-12 h-3 bg-cuaternary shadow-md'
                            : 'w-3 h-3 bg-white/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
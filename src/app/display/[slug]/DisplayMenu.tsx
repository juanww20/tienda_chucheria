'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper/types'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import 'swiper/css'
import 'swiper/css/effect-fade'

gsap.registerPlugin(useGSAP)

export interface Slide {
  id: string
  name: string
  description: string
  price: number
  original: number
  items: { name: string; emoji: string; image: string | null }[]
}

interface Props {
  companyName: string
  companyLogo: string | null
  slides: Slide[]
}

export default function DisplayMenu({ companyName, companyLogo, slides }: Props) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const root = useRef<HTMLDivElement>(null)

  // Hide cursor + poll DB for changes pushed from the admin panel
  useEffect(() => {
    const el = root.current
    if (el) el.style.cursor = 'none'
    const id = setInterval(() => router.refresh(), 20000)
    return () => clearInterval(id)
  }, [router])

  useGSAP(
    () => {
      gsap.fromTo(
        '.swiper-slide-active .gsap-in',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      )
      gsap.fromTo(
        '.swiper-slide-active .gsap-price',
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)', delay: 0.2 }
      )
    },
    { scope: root, dependencies: [index] }
  )

  const Header = (
    <header className="flex w-full items-center justify-between rounded-2xl border-b-4 border-cuaternary bg-white px-10 py-6 shadow-xl">
      <div className="flex items-center gap-5">
        <div className="relative h-16 w-16">
          <Image src="/Logo/Chuchu_logo.png" alt="Chuchu" fill sizes="64px" className="object-contain" priority />
        </div>
        <span className="text-4xl font-thin text-gray-200">|</span>
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
          {companyLogo ? (
            <Image src={companyLogo} alt={companyName} fill sizes="64px" className="object-cover" priority />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl">🏪</span>
          )}
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-primary">
            {companyName}
          </h2>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-foreground/40">
            by Chuchu · Premium Selection
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-quinary px-6 py-3 shadow-lg">
        <span className="flex items-center gap-3 text-xl font-black text-white">
          <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
          OFERTAS DEL DÍA
        </span>
      </div>
    </header>
  )

  if (slides.length === 0) {
    return (
      <div
        ref={root}
        className="fixed inset-0 flex h-screen w-screen flex-col gap-[2vh] overflow-hidden bg-primary p-[4vh]"
      >
        {Header}
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-secondary text-center">
          <p className="animate-chuchu text-[12vh]">🍬</p>
          <p className="titulo-combo text-[6vh]">¡Pronto nuevas ofertas!</p>
          <p className="mt-4 text-[2.5vh] text-white/80">{companyName} está preparando sus combos.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={root}
      className="fixed inset-0 flex h-screen w-screen flex-col gap-[2vh] overflow-hidden bg-primary p-[4vh]"
    >
      {Header}

      <div className="relative min-h-0 w-full flex-1">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          loop={slides.length > 1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          speed={1000}
          allowTouchMove={false}
          onSwiper={setSwiper}
          onSlideChange={(s) => setIndex(s.realIndex)}
          className="h-full w-full rounded-3xl"
        >
          {slides.map((slide) => {
            const hero = slide.items.find((i) => i.image)?.image ?? null
            const discount =
              slide.original > slide.price
                ? Math.round((1 - slide.price / slide.original) * 100)
                : 0
            return (
              <SwiperSlide key={slide.id} className="h-full w-full">
                <div className="flex h-full w-full flex-row overflow-hidden rounded-3xl bg-white shadow-2xl">
                  {/* Left: hero */}
                  <div className="relative flex flex-[0_0_50%] items-center justify-center overflow-hidden bg-gradient-to-br from-[#8e44ad] to-[#d81b60]">
                    {hero ? (
                      <Image src={hero} alt={slide.name} fill sizes="50vw" className="animate-kenburns object-cover" priority />
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-[3vh] p-[4vh]">
                        {slide.items.map((it, i) => (
                          <span key={i} className="gsap-in text-[16vh] drop-shadow-2xl">
                            {it.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="absolute right-[3vh] top-[3vh] rotate-6 rounded-2xl bg-cuaternary px-[3vh] py-[1.5vh] text-[4vh] font-black text-primary shadow-xl">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* Right: info */}
                  <div className="relative flex flex-[0_0_50%] items-center bg-secondary p-[5vw]">
                    <div className="relative z-10 w-full">
                      <h1 className="titulo-combo gsap-in mb-[3vh] text-[7vh] leading-[1.1]">
                        {slide.name}
                      </h1>
                      {slide.description && (
                        <p className="gsap-in mb-[3vh] text-[2.6vh] font-medium leading-[1.4] text-white opacity-90">
                          {slide.description}
                        </p>
                      )}
                      <div className="gsap-in mb-[4vh] flex flex-wrap gap-[1.5vh]">
                        {slide.items.map((it, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-white/20 px-[2vh] py-[1vh] text-[2.2vh] font-semibold text-white"
                          >
                            {it.emoji} {it.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-end gap-3">
                        {slide.original > slide.price && (
                          <span className="mb-[2vh] text-[4vh] font-bold text-white/50 line-through">
                            ${slide.original.toFixed(2)}
                          </span>
                        )}
                        <span className="gsap-price flex items-start gap-2">
                          <span className="mt-[2vh] text-[4vh] font-black text-cuaternary">$</span>
                          <span className="precio-tv text-[15vh] leading-[0.8]">
                            {slide.price.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>

      {/* Pagination dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-3 py-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Ir a oferta ${i + 1}`}
              onClick={() => swiper?.slideToLoop(i)}
              className={`rounded-full transition-all duration-500 ${
                index === i ? 'h-3 w-12 bg-cuaternary shadow-md' : 'h-3 w-3 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

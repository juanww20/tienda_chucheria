'use client'

import { motion } from 'framer-motion'

const Reportes = () => {
  const ventasHoy = 1240.50
  const ventasSemana = 8750.30
  const combosVendidos = 23
  const efectoChuchu = 342.80 // Ventas generadas por combos

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 Reportes</h1>
        <p className="text-gray-500 mb-6">Análisis de rendimiento y efecto Chuchu</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">💰 Ventas Hoy</p>
            <p className="text-3xl font-bold text-[#fff176]" style={{ color: '#fff176' }}>${ventasHoy}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">📈 Ventas Semana</p>
            <p className="text-3xl font-bold text-gray-800">${ventasSemana}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">🍱 Combos Vendidos</p>
            <p className="text-3xl font-bold text-gray-800">{combosVendidos}</p>
          </div>
          <div className="bg-gradient-to-r from-[#f06292] to-[#8e44ad] rounded-xl p-6 shadow-lg">
            <p className="text-white/80 text-sm">✨ Efecto Chuchu</p>
            <p className="text-3xl font-bold text-[#fff176]">+${efectoChuchu}</p>
            <p className="text-white/60 text-xs mt-1">Ventas generadas por combos</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Impacto de Combos en TV</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ventas regulares</span>
                <span>$897.70</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#f06292]">✨ Ventas por Combos (Efecto Chuchu)</span>
                <span className="text-[#f06292] font-bold">+$342.80</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#f06292] h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#fff176]/20 rounded-lg">
            <p className="text-sm text-gray-700">
              🎯 <strong>Conclusión:</strong> Los combos en TV generaron un <strong className="text-[#f06292]">+27.6%</strong> de ingresos adicionales esta semana.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Reportes
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ComboCreator from './ComboCreator'

const VentasCombos = () => {
  const [showComboCreator, setShowComboCreator] = useState(false)
  const [ventasHoy, setVentasHoy] = useState(1240.5)
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Zapatillas Runner', precio: 89.99, stock: 12, imagen: '👟' },
    { id: 2, nombre: 'Audio Pro X', precio: 49.99, stock: 8, imagen: '🎧' },
    { id: 3, nombre: 'Smartwatch S3', precio: 129.99, stock: 5, imagen: '⌚' },
    { id: 4, nombre: 'Cargador Rápido', precio: 19.99, stock: 15, imagen: '🔌' },
  ])

  const [combos, setCombos] = useState([
    {
      id: 1,
      nombre: 'Pack Audio Total',
      productos: ['Audio Pro X', 'Cargador Rápido'],
      precioOferta: 59.99,
      precioOriginal: 69.98,
      enTV: true
    },
    {
      id: 2,
      nombre: 'Smart Bundle',
      productos: ['Smartwatch S3', 'Zapatillas Runner'],
      precioOferta: 199.99,
      precioOriginal: 219.98,
      enTV: true
    }
  ])

  const handleVentaRapida = (producto) => {
    setVentasHoy(prev => prev + producto.precio)
    setProductos(prev => prev.map(p =>
      p.id === producto.id ? { ...p, stock: p.stock - 1 } : p
    ))
  }

  const toggleEnviarTV = (comboId) => {
    setCombos(prev => prev.map(combo =>
      combo.id === comboId ? { ...combo, enTV: !combo.enTV } : combo
    ))
  }

  const crearCombo = (nuevoCombo) => {
    setCombos(prev => [...prev, { ...nuevoCombo, id: Date.now(), enTV: false }])
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header with Ventas de Hoy */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#8e44ad] to-[#f06292] rounded-2xl p-6 mb-8 shadow-lg"
        >
          <p className="text-white/80 text-sm font-medium">💰 Ventas de Hoy</p>
          <p className="text-5xl font-black" style={{ color: '#fff176' }}>
            ${ventasHoy.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-white/60 text-xs mt-2">Actualizado en tiempo real</p>
        </motion.div>

        {/* Sección 1: Productos Individuales (Quick Sell) */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#f06292] rounded-full"></span>
            Venta Rápida
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.map((producto, idx) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#2d2d2d] rounded-xl p-4 border border-gray-700 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-4xl">{producto.imagen}</span>
                    <h3 className="text-white font-semibold mt-2">{producto.nombre}</h3>
                    <p className="text-gray-400 text-sm">Stock: {producto.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#4dd0e1]">${producto.precio}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleVentaRapida(producto)}
                  className="mt-4 w-full bg-[#f06292] hover:bg-[#d81b60] text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span> Vender
                </button>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            ⚡ Estos productos NO se muestran en la TV
          </p>
        </div>

        {/* Sección 2: Gestión de Combos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#fff176] rounded-full"></span>
              Combos Activos
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComboCreator(true)}
              className="bg-gradient-to-r from-[#fff176] to-[#ffd966] text-gray-800 font-bold px-5 py-2 rounded-xl shadow-md flex items-center gap-2"
            >
              ✨ Crear Nuevo Combo Manual
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {combos.map((combo, idx) => (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{combo.nombre}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {combo.productos.map((prod, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#4dd0e1]">${combo.precioOferta}</p>
                    <p className="text-xs text-gray-400 line-through">${combo.precioOriginal}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">📺 Enviar a TV</span>
                    <button
                      onClick={() => toggleEnviarTV(combo.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${combo.enTV ? 'bg-[#4dd0e1]' : 'bg-gray-300'}`}
                    >
                      <motion.div
                        animate={{ x: combo.enTV ? 24 : 2 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                  {combo.enTV && (
                    <span className="text-xs bg-[#fff176] text-gray-800 px-2 py-1 rounded-full font-medium">
                      🔴 EN TV
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {combos.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No hay combos activos</p>
              <button
                onClick={() => setShowComboCreator(true)}
                className="mt-3 text-[#f06292] font-medium"
              >
                Crear el primer combo ✨
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Creator */}
      <AnimatePresence>
        {showComboCreator && (
          <ComboCreator
            onClose={() => setShowComboCreator(false)}
            onCreate={crearCombo}
            productos={productos}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default VentasCombos
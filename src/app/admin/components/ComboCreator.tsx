'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const ComboCreator = ({ onClose, onCreate, productos }) => {
  const [nombre, setNombre] = useState('')
  const [productosSeleccionados, setProductosSeleccionados] = useState([])
  const [precioOferta, setPrecioOferta] = useState('')

  const productosDisponibles = productos.filter(p => !productosSeleccionados.includes(p.nombre))

  const agregarProducto = (productoNombre) => {
    setProductosSeleccionados([...productosSeleccionados, productoNombre])
  }

  const quitarProducto = (productoNombre) => {
    setProductosSeleccionados(productosSeleccionados.filter(p => p !== productoNombre))
  }

  const precioOriginal = productosSeleccionados.reduce((total, nombreProd) => {
    const prod = productos.find(p => p.nombre === nombreProd)
    return total + (prod?.precio || 0)
  }, 0)

  const handleSubmit = () => {
    if (!nombre || productosSeleccionados.length < 2 || !precioOferta) {
      alert('Completa todos los campos (mínimo 2 productos)')
      return
    }
    onCreate({
      nombre,
      productos: productosSeleccionados,
      precioOferta: parseFloat(precioOferta),
      precioOriginal: precioOriginal
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">✨ Nuevo Combo</h2>
          <p className="text-sm text-gray-500">Crea un combo para mostrar en la TV</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Combo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pack Super Oferta"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f06292] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Productos (mínimo 2)</label>
            <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
              {productosSeleccionados.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">Selecciona productos para el combo</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {productosSeleccionados.map(prod => (
                    <span
                      key={prod}
                      onClick={() => quitarProducto(prod)}
                      className="bg-[#f06292] text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-[#d81b60] transition-colors"
                    >
                      {prod} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>
            {productosDisponibles.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Agregar producto:</p>
                <div className="flex flex-wrap gap-2">
                  {productosDisponibles.map(prod => (
                    <button
                      key={prod.nombre}
                      onClick={() => agregarProducto(prod.nombre)}
                      className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    >
                      + {prod.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio Oferta ($)</label>
            <input
              type="number"
              value={precioOferta}
              onChange={(e) => setPrecioOferta(e.target.value)}
              placeholder="Precio promocional"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f06292]"
            />
            {precioOriginal > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Precio original: ${precioOriginal.toFixed(2)} | Ahorro: ${(precioOriginal - precioOferta).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-[#fff176] to-[#ffd966] text-gray-800 font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Crear Combo
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ComboCreator
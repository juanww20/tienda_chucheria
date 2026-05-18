'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const Inventario = () => {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Zapatillas Runner', precio: 89.99, stock: 12, categoria: 'Líder', rotacion: 'alta' },
    { id: 2, nombre: 'Audio Pro X', precio: 49.99, stock: 8, categoria: 'Líder', rotacion: 'alta' },
    { id: 3, nombre: 'Smartwatch S3', precio: 129.99, stock: 5, categoria: 'Baja Rotación', rotacion: 'baja' },
    { id: 4, nombre: 'Cargador Rápido', precio: 19.99, stock: 15, categoria: 'Líder', rotacion: 'alta' },
    { id: 5, nombre: 'Funda Premium', precio: 14.99, stock: 3, categoria: 'Baja Rotación', rotacion: 'baja' },
  ])

  const cambiarEtiqueta = (id, nuevaCategoria) => {
    setProductos(prev => prev.map(p =>
      p.id === id ? { ...p, categoria: nuevaCategoria, rotacion: nuevaCategoria === 'Baja Rotación' ? 'baja' : 'alta' } : p
    ))
  }

  const actualizarStock = (id, nuevoStock) => {
    setProductos(prev => prev.map(p =>
      p.id === id ? { ...p, stock: Math.max(0, nuevoStock) } : p
    ))
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📦 Inventario</h1>
        <p className="text-gray-500 mb-6">Gestiona stock y etiquetas de productos</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Producto</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Precio</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Stock</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Etiqueta</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, idx) => (
                  <motion.tr
                    key={producto.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-800">{producto.nombre}</td>
                    <td className="p-4 text-[#4dd0e1] font-bold">${producto.precio}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={producto.stock}
                        onChange={(e) => actualizarStock(producto.id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center"
                      />
                    </td>
                    <td className="p-4">
                      <select
                        value={producto.categoria}
                        onChange={(e) => cambiarEtiqueta(producto.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          producto.categoria === 'Líder' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        <option value="Líder">🚀 Líder de Ventas</option>
                        <option value="Baja Rotación">⚠️ Baja Rotación</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {producto.rotacion === 'baja' && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          Recomendar en combo
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-[#fff176]/20 to-[#f06292]/20 rounded-xl">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip Chuchu:</strong> Los productos con etiqueta "Baja Rotación" se recomiendan para combos con líderes de ventas.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Inventario
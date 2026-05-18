'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const Ajustes = () => {
  const [tienda, setTienda] = useState({
    nombre: 'Mi Tienda Chuchu',
    direccion: 'Av. Principal 123',
    telefono: '+54 11 1234-5678',
    email: 'contacto@mitienda.com'
  })

  const [notificaciones, setNotificaciones] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Configuración guardada ✅')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">⚙️ Ajustes</h1>
        <p className="text-gray-500 mb-6">Configuración de tu tienda y preferencias</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">🏪 Datos de la Tienda</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la tienda</label>
                <input
                  type="text"
                  value={tienda.nombre}
                  onChange={(e) => setTienda({ ...tienda, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f06292]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={tienda.direccion}
                  onChange={(e) => setTienda({ ...tienda, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={tienda.telefono}
                    onChange={(e) => setTienda({ ...tienda, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={tienda.email}
                    onChange={(e) => setTienda({ ...tienda, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">🔔 Preferencias</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Notificaciones de ventas</p>
                <p className="text-sm text-gray-500">Recibir alertas cuando se vende un combo</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificaciones(!notificaciones)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notificaciones ? 'bg-[#4dd0e1]' : 'bg-gray-300'}`}
              >
                <motion.div
                  animate={{ x: notificaciones ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">📺 Configuración de TV</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">URL para mostrar en pantalla:</p>
              <code className="block bg-gray-100 p-3 rounded-lg text-sm break-all">
                http://localhost:3000/display
              </code>
              <p className="text-xs text-gray-400 mt-2">
                💡 Abre esta URL en cualquier navegador conectado a tu TV vía HDMI o Chromecast
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8e44ad] to-[#f06292] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Guardar Cambios
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default Ajustes
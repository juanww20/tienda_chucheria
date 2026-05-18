'use client'

import { motion } from 'framer-motion'

const BottomNav = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'inventario', label: 'Inventario', icon: '📦' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
    { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
  ]

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 md:hidden"
    >
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center gap-1 py-2 px-4 relative"
          >
            <span className={`text-2xl transition-all ${activeTab === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-xs font-medium ${activeTab === item.id ? 'text-[#f06292]' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <motion.div
                layoutId="bottomIndicator"
                className="absolute -top-1 w-8 h-1 bg-[#f06292] rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default BottomNav
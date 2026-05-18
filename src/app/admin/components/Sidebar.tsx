'use client'

import { motion } from 'framer-motion'

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'ventas', label: 'Ventas & Combos', icon: '💰' },
        { id: 'inventario', label: 'Inventario', icon: '📦' },
        { id: 'reportes', label: 'Reportes', icon: '📊' },
        { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
    ]

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-200 z-50"
        >
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold">
                    <span className="text-[#f06292]">Chuchu</span>
                    <span className="text-[#8e44ad]">Panel</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">Gestión inteligente</p>
            </div>

            <nav className="p-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all
              ${activeTab === item.id
                                ? 'bg-[#f06292] text-white shadow-lg shadow-[#f06292]/30'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
            `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="activeIndicator"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                            />
                        )}
                    </button>
                ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
                <div className="bg-gradient-to-r from-[#8e44ad]/10 to-[#f06292]/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Versión 1.0.0</p>
                    <p className="text-xs font-medium text-[#8e44ad] mt-1">✨ Chuchu Smart Menu</p>
                </div>
            </div>
        </motion.aside>
    )
}

export default Sidebar
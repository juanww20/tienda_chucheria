'use client'

import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import VentasCombos from './components/VentasCombos'
import Inventario from './components/Inventario'
import Reportes from './components/Reportes'
import Ajustes from './components/Ajustes'

export default function Home() {
    const [activeTab, setActiveTab] = useState('ventas')
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const renderContent = () => {
        switch (activeTab) {
            case 'ventas':
                return <VentasCombos />
            case 'inventario':
                return <Inventario />
            case 'reportes':
                return <Reportes />
            case 'ajustes':
                return <Ajustes />
            default:
                return <VentasCombos />
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {/* Main Content */}
            <div className={!isMobile ? 'ml-[280px]' : ''}>
                <div className="p-4 md:p-6 pb-24 md:pb-6">
                    {renderContent()}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
        </div>
    )
}
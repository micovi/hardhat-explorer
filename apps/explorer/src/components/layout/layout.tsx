import type { ReactNode } from 'react'
import Navbar from './navbar'
import Footer from './footer'
import NetworkStatus from './network-status'
import { CloudCTA } from '@/components/common/cloud-cta'
import { featureFlags } from '@/config/features.config'

interface LayoutProps {
  children: ReactNode
  fullscreen?: boolean
}

export default function Layout({ children, fullscreen = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Cloud Banner - Only show if enabled */}
      {featureFlags.cloudCTA.enabled && featureFlags.cloudCTA.showBanner && (
        <CloudCTA variant="banner" />
      )}
      <NetworkStatus />
      <Navbar />
      <main className={fullscreen ? "flex-1" : "flex-1 container mx-auto px-4 py-6 max-w-7xl"}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
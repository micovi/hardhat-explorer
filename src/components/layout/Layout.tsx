import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import NetworkStatus from './NetworkStatus'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NetworkStatus />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}
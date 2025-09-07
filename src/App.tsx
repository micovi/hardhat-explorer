import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

// Layout
import Layout from '@/components/layout/layout'
import FloatingConverter from '@/components/tools/floating-converter'

// Pages
import HomePage from '@/pages/home-page'
import BlockListPage from '@/pages/block-list-page'
import BlockDetailsPage from '@/pages/block-details-page'
import TransactionListPage from '@/pages/transaction-list-page'
import TransactionDetailsPage from '@/pages/transaction-details-page'
import AddressPage from '@/pages/address-page'
import VerifyContractPage from '@/pages/verify-contract-page'
import TokensPage from '@/pages/tokens-page'
import NetworkPage from '@/pages/network-page'
import NotFoundPage from '@/pages/not-found-page'
import TestTransactionPage from '@/pages/test-transaction-page'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchInterval: 10000,
      retry: 3,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Fullscreen route with layout but no container */}
          <Route path="/404" element={
            <Layout fullscreen>
              <NotFoundPage />
            </Layout>
          } />
          
          {/* Routes with normal layout */}
          <Route path="/" element={
            <Layout>
              <HomePage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/blocks" element={
            <Layout>
              <BlockListPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/block/:blockNumber" element={
            <Layout>
              <BlockDetailsPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/txs" element={
            <Layout>
              <TransactionListPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/tx/:hash" element={
            <Layout>
              <TransactionDetailsPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/address/:address" element={
            <Layout>
              <AddressPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/verify-contract/:address" element={
            <Layout>
              <VerifyContractPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/tokens" element={
            <Layout>
              <TokensPage />
              <FloatingConverter />
            </Layout>
          } />
          <Route path="/network" element={
            <Layout>
              <NetworkPage />
              <FloatingConverter />
            </Layout>
          } />
          
          {/* Catch all - redirect to 404 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
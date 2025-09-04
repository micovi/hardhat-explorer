import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

// Layout
import Layout from '@/components/layout/Layout'
import FloatingConverter from '@/components/tools/FloatingConverter'

// Pages (to be implemented)
import HomePage from '@/pages/HomePage'
import BlockListPage from '@/pages/BlockListPage'
import BlockDetailsPage from '@/pages/BlockDetailsPage'
import TransactionListPage from '@/pages/TransactionListPage'
import TransactionDetailsPage from '@/pages/TransactionDetailsPage'
import AddressPage from '@/pages/AddressPage'
import VerifyContractPage from '@/pages/VerifyContractPage'
import TokensPage from '@/pages/TokensPage'
import NFTsPage from '@/pages/NFTsPage'
import NetworkPage from '@/pages/NetworkPage'
import NotFoundPage from '@/pages/NotFoundPage'
import TestTransactionPage from '@/pages/TestTransactionPage'

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
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blocks" element={<BlockListPage />} />
            <Route path="/block/:blockNumber" element={<BlockDetailsPage />} />
            <Route path="/txs" element={<TransactionListPage />} />
            <Route path="/tx/:hash" element={<TransactionDetailsPage />} />
            <Route path="/address/:address" element={<AddressPage />} />
            <Route path="/verify-contract/:address" element={<VerifyContractPage />} />
            <Route path="/tokens" element={<TokensPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <FloatingConverter />
        </Layout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
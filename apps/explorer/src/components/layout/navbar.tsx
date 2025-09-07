import { Link, useNavigate } from 'react-router-dom'
import { Search, Blocks, FileText, Coins, Home, Hash, User, Loader2, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'

type SearchType = 'address' | 'transaction' | 'block' | 'unknown'

interface SearchSuggestion {
  type: SearchType
  label: string
  value: string
  icon: React.ReactNode
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('unknown')
  const [isFocused, setIsFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Detect search type as user types
  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchType('unknown')
      return
    }

    if (query.startsWith('0x')) {
      if (query.length === 66) {
        setSearchType('transaction')
      } else if (query.length === 42) {
        setSearchType('address')
      } else {
        setSearchType('unknown')
      }
    } else if (/^\d+$/.test(query)) {
      setSearchType('block')
    } else {
      setSearchType('unknown')
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Add keyboard shortcut (Cmd/Ctrl + K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = searchRef.current?.querySelector('input')
        input?.focus()
      }
      
      // ESC to clear/close search
      if (e.key === 'Escape' && isFocused) {
        setIsFocused(false)
        if (searchQuery) {
          clearSearch()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, searchQuery])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery.trim() || searchType === 'unknown') return

    setIsSearching(true)
    const query = searchQuery.trim()
    
    // Navigate based on search type
    try {
      if (searchType === 'transaction') {
        navigate(`/tx/${query}`)
      } else if (searchType === 'address') {
        navigate(`/address/${query}`)
      } else if (searchType === 'block') {
        navigate(`/block/${query}`)
      }
      
      setSearchQuery('')
      setIsFocused(false)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchType('unknown')
  }

  const getSearchIcon = () => {
    switch (searchType) {
      case 'address':
        return <User className="h-4 w-4" />
      case 'transaction':
        return <Hash className="h-4 w-4" />
      case 'block':
        return <Blocks className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getPlaceholderText = () => {
    if (searchQuery) {
      switch (searchType) {
        case 'address':
          return 'Valid address detected...'
        case 'transaction':
          return 'Valid transaction hash detected...'
        case 'block':
          return 'Block number detected...'
        default:
          return 'Search...'
      }
    }
    return 'Search...'
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Blocks className="h-6 w-6" />
            <span className="font-bold text-lg">evmscan.org</span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className={navigationMenuTriggerStyle()}>
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/blocks" className={navigationMenuTriggerStyle()}>
                    <Blocks className="h-4 w-4 mr-2" />
                    Blocks
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/txs" className={navigationMenuTriggerStyle()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Transactions
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/tokens" className={navigationMenuTriggerStyle()}>
                    <Coins className="h-4 w-4 mr-2" />
                    Tokens
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/network" className={navigationMenuTriggerStyle()}>
                    <Blocks className="h-4 w-4 mr-2" />
                    Network
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Enhanced Search Bar */}
          <div ref={searchRef} className="relative ml-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  searchType !== 'unknown' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    getSearchIcon()
                  )}
                </div>
                <Input
                  type="text"
                  placeholder={getPlaceholderText()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  className={`pl-10 ${!isFocused && !searchQuery ? 'pr-36' : 'pr-20'} w-[400px] transition-all ${
                    isFocused ? 'ring-2 ring-blue-500' : ''
                  } ${
                    searchType !== 'unknown' ? 'border-blue-300' : ''
                  }`}
                />
                {!isFocused && !searchQuery && (
                  <div className="absolute right-20 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center gap-1 pointer-events-none">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded">K</kbd>
                  </div>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={searchType === 'unknown' || !searchQuery.trim()}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-3"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Search Helper Dropdown */}
            {isFocused && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                {searchType === 'unknown' ? (
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-gray-500">Enter a valid:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>Address: 0x... (42 characters)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Hash className="h-3 w-3" />
                        <span>Transaction: 0x... (66 characters)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Blocks className="h-3 w-3" />
                        <span>Block: Number (e.g., 12345)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getSearchIcon()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {searchType === 'address' && `${searchQuery.slice(0, 10)}...${searchQuery.slice(-8)}`}
                            {searchType === 'transaction' && `${searchQuery.slice(0, 10)}...${searchQuery.slice(-8)}`}
                            {searchType === 'block' && `Block #${searchQuery}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {searchType === 'address' && 'Go to address page'}
                            {searchType === 'transaction' && 'View transaction details'}
                            {searchType === 'block' && 'View block information'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {searchType}
                        </Badge>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">↵</kbd>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
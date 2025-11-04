// Mock data service for static hosting
export const mockData = {
  user: {
    id: '1',
    name: 'Demo User',
    email: 'demo@pocketoption.com',
    balance: 0,
    location: 'New York, USA',
    joinDate: '2024-01-01',
    avatar: '/api/placeholder/40/40'
  },
  
  stats: {
    totalTrades: 156,
    winRate: 68.5,
    totalProfit: 2450.75,
    totalDeposits: 5000,
    totalWithdrawals: 1200,
    activePositions: 3
  },
  
  trades: [
    {
      id: '1',
      asset: 'EUR/USD',
      type: 'CALL',
      amount: 100,
      profit: 85,
      timestamp: '2024-01-15T10:30:00Z',
      status: 'won'
    },
    {
      id: '2',
      asset: 'BTC/USD',
      type: 'PUT',
      amount: 200,
      profit: -200,
      timestamp: '2024-01-15T09:15:00Z',
      status: 'lost'
    },
    {
      id: '3',
      asset: 'GBP/USD',
      type: 'CALL',
      amount: 150,
      profit: 127.5,
      timestamp: '2024-01-14T16:45:00Z',
      status: 'won'
    }
  ],
  
  deposits: [
    {
      id: '1',
      amount: 1000,
      method: 'Credit Card',
      status: 'completed',
      timestamp: '2024-01-10T14:20:00Z'
    },
    {
      id: '2',
      amount: 2000,
      method: 'Bank Transfer',
      status: 'completed',
      timestamp: '2024-01-05T11:30:00Z'
    }
  ],
  
  withdrawals: [
    {
      id: '1',
      amount: 500,
      method: 'Bank Transfer',
      status: 'completed',
      timestamp: '2024-01-12T09:15:00Z'
    },
    {
      id: '2',
      amount: 300,
      method: 'Credit Card',
      status: 'pending',
      timestamp: '2024-01-14T16:30:00Z'
    }
  ],
  
  users: [
    {
      id: '1',
      name: 'Demo User 1',
      email: 'demo1@example.com',
      balance: 0,
      status: 'active'
    },
    {
      id: '2',
      name: 'Demo User 2',
      email: 'demo2@example.com',
      balance: 0,
      status: 'active'
    }
  ]
}

// LocalStorage user management
const USERS_KEY = 'pocketoption_users'
const CURRENT_USER_KEY = 'pocketoption_current_user'

interface StoredUser {
  id: string
  name: string
  email: string
  password: string
  balance: number
  createdAt: string
}

const getUsersFromStorage = (): StoredUser[] => {
  if (typeof window === 'undefined') {
    console.log('🚫 getUsersFromStorage: Server-side, returning empty array')
    return []
  }
  const users = localStorage.getItem(USERS_KEY)
  const parsedUsers = users ? JSON.parse(users) : []
  console.log('📖 getUsersFromStorage:', parsedUsers.length, 'users retrieved')
  return parsedUsers
}

const saveUsersToStorage = (users: StoredUser[]) => {
  if (typeof window === 'undefined') {
    console.log('🚫 saveUsersToStorage: Server-side, cannot save')
    return
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  console.log('💾 saveUsersToStorage:', users.length, 'users saved')
}

const getCurrentUserFromStorage = (): StoredUser | null => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

const saveCurrentUserToStorage = (user: StoredUser | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

// Mock API functions
export const mockApi = {
  // Auth functions
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
    
    console.log('🔐 Mock API Login attempt:', { email, password: '***' })
    console.log('🌍 Environment:', typeof window !== 'undefined' ? 'Browser' : 'Server')
    
    // Check demo account first
    if (email === 'demo@pocketoption.com' && password === 'demo123') {
      console.log('✅ Demo account login detected')
      const demoUser = { 
        ...mockData.user, 
        email: 'demo@pocketoption.com',
        password: 'demo123',
        createdAt: new Date().toISOString()
      }
      saveCurrentUserToStorage(demoUser as StoredUser)
      console.log('✅ Demo user saved to storage')
      return { success: true, user: demoUser }
    }
    
    // Check registered users
    const users = getUsersFromStorage()
    console.log('📦 Retrieved users from storage:', users.length, 'users found')
    console.log('👥 Stored users:', users.map(u => ({ email: u.email, id: u.id })))
    
    const user = users.find(u => u.email === email && u.password === password)
    console.log('🔍 User lookup result:', user ? 'Found' : 'Not found')
    
    if (user) {
      console.log('✅ User authenticated successfully:', { email: user.email, id: user.id })
      saveCurrentUserToStorage(user)
      return { 
        success: true, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          balance: user.balance,
          avatar: mockData.user.avatar,
          joinDate: user.createdAt,
          verified: true,
          location: mockData.user.location,
          phone: ''
        }
      }
    }
    
    console.log('❌ Login failed - Invalid credentials')
    // Return error response instead of throwing
    return { success: false, message: 'Invalid credentials' }
  },
  
  register: async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('📝 Mock API Register attempt:', { name, email, password: '***' })
    console.log('🌍 Environment:', typeof window !== 'undefined' ? 'Browser' : 'Server')
    
    // Check if user already exists
    const users = getUsersFromStorage()
    console.log('📦 Retrieved users from storage for registration:', users.length, 'users found')
    console.log('👥 Existing users:', users.map(u => ({ email: u.email, id: u.id })))
    
    const existingUser = users.find(u => u.email === email)
    
    if (existingUser) {
      console.log('❌ Registration failed - User already exists')
      return { success: false, message: 'User already exists with this email' }
    }
    
    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      balance: 0, // Starting balance
      createdAt: new Date().toISOString()
    }
    
    console.log('👤 Creating new user:', { id: newUser.id, name, email })
    
    // Save to localStorage
    users.push(newUser)
    saveUsersToStorage(users)
    saveCurrentUserToStorage(newUser)
    
    console.log('✅ User registered and saved to storage')
    console.log('📦 Total users after registration:', users.length)
    
    return { 
      success: true, 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        balance: newUser.balance,
        avatar: mockData.user.avatar,
        joinDate: newUser.createdAt,
        verified: true,
        location: mockData.user.location,
        phone: ''
      }
    }
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    saveCurrentUserToStorage(null)
    return { success: true }
  },
  
  // User functions
  getUserStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockData.stats
  },
  
  getUserBalance: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { balance: mockData.user.balance }
  },
  
  // Transaction functions
  getTrades: async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockData.trades
  },
  
  getDeposits: async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockData.deposits
  },
  
  getWithdrawals: async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockData.withdrawals
  },
  
  // Admin functions
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockData.users
  },
  
  updateUserBalance: async (userId: string, balance: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true, balance }
  },
  
  // Deposit/Withdrawal functions
  createDeposit: async (amount: number, method: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const newDeposit = {
      id: Date.now().toString(),
      amount,
      method,
      status: 'completed',
      timestamp: new Date().toISOString()
    }
    return newDeposit
  },
  
  createWithdrawal: async (amount: number, method: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const newWithdrawal = {
      id: Date.now().toString(),
      amount,
      method,
      status: 'pending',
      timestamp: new Date().toISOString()
    }
    return newWithdrawal
  }
}
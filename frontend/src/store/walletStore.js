// 钱包状态管理
// 从本地存储加载初始状态
const loadState = () => {
  try {
    const savedState = localStorage.getItem('walletState')
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (error) {
    console.error('加载钱包状态失败:', error)
  }
  
  // 默认状态
  return {
    isConnected: false,
    account: null,
    balance: '0.00',
    provider: null,
    signer: null,
    walletType: null, // 'metamask' 或 'privy'
    tokenBalances: {}
  }
}

// 保存状态到本地存储
const saveState = (state) => {
  try {
    // 只保存必要的状态，避免保存provider和signer等不可序列化的对象
    const stateToSave = {
      isConnected: state.isConnected,
      account: state.account,
      balance: state.balance,
      walletType: state.walletType
    }
    localStorage.setItem('walletState', JSON.stringify(stateToSave))
  } catch (error) {
    console.error('保存钱包状态失败:', error)
  }
}

let state = loadState()

const listeners = []

const walletStore = {
  getState() {
    return { ...state }
  },

  setState(newState) {
    state = { ...state, ...newState }
    saveState(state)
    this.notifyListeners()
  },

  subscribe(listener) {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  },

  notifyListeners() {
    listeners.forEach(listener => listener(state))
  },

  disconnect() {
    state = {
      isConnected: false,
      account: null,
      balance: '0.00',
      provider: null,
      signer: null,
      walletType: null,
      tokenBalances: {}
    }
    saveState(state)
    this.notifyListeners()
  }
}

export default walletStore
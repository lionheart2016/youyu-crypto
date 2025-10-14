import React, { useEffect, useState } from 'react'
import { PrivyProvider, usePrivy, useCreateWallet, useWallets, useConnectWallet } from '@privy-io/react-auth'

// Privy配置 - 使用真实的应用ID
const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  appearance: {
    theme: 'light',
    accentColor: '#3B82F6',
    logo: '/logo.svg'
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets'
  },
  // 添加外部钱包连接器配置
  externalWallets: {
    // 启用外部钱包连接器
    enabled: true,
    // 配置支持的钱包列表
    connectors: [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'https://cdn.privy.io/wallet-logos/metamask.png'
      },
      {
        id: 'coinbase-wallet',
        name: 'Coinbase Wallet',
        icon: 'https://cdn.privy.io/wallet-logos/coinbase-wallet.png'
      },
      {
        id: 'wallet-connect',
        name: 'WalletConnect',
        icon: 'https://cdn.privy.io/wallet-logos/wallet-connect.png'
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        icon: 'https://cdn.privy.io/wallet-logos/rainbow.png'
      },
      {
        id: 'phantom',
        name: 'Phantom',
        icon: 'https://cdn.privy.io/wallet-logos/phantom.png'
      }
    ]
  }
}

// 主认证组件
function PrivyAuth() {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const { createWallet } = useCreateWallet()
  const { wallets } = useWallets()
  const { connectWallet } = useConnectWallet({
    onSuccess: ({wallet}) => {
      console.log('外部钱包连接成功:', wallet)
      // 通知父窗口外部钱包连接成功
      window.parent.postMessage({
        type: 'EXTERNAL_WALLET_CONNECTED',
        wallet: {
          address: wallet.address,
          chain: wallet.chain,
          type: wallet.walletClientType
        }
      }, '*')
    },
    onError: (error) => {
      console.error('外部钱包连接失败:', error)
      window.parent.postMessage({
        type: 'PRIVY_ERROR',
        error: `连接外部钱包失败: ${error.message || error}`
      }, '*')
    }
  })
  const [walletInfo, setWalletInfo] = useState(null)
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [externalWallets, setExternalWallets] = useState([])
  const [isConnectingExternal, setIsConnectingExternal] = useState(false)

  useEffect(() => {
    // 监听来自父窗口的消息
    const handleMessage = (event) => {
      if (event.data.type === 'OPEN_LOGIN_MODAL') {
        // 自动打开钱包连接
        const method = event.data.method || 'wallet'
        console.log('收到登录请求，方法:', method)
        handleLogin(method)
      } else if (event.data.type === 'LOGOUT_REQUEST') {
        // 执行登出
        console.log('收到登出请求')
        handleLogout()
      } else if (event.data.type === 'SYNC_AUTH_STATE') {
        // 同步认证状态
        console.log('收到状态同步请求')
        // 状态同步将在另一个useEffect中处理
      } else if (event.data.type === 'CREATE_WALLET_REQUEST') {
        // 创建钱包请求
        console.log('收到创建钱包请求')
        handleCreateWallet()
      } else if (event.data.type === 'CONNECT_EXTERNAL_WALLET') {
        // 连接外部钱包请求
        console.log('收到连接外部钱包请求')
        const walletType = event.data.walletType || 'metamask'
        handleConnectExternalWallet(walletType)
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    console.log('认证状态变化:', { authenticated, user })
    
    // 当用户认证状态变化时，获取钱包信息
    if (authenticated && user) {
      // 获取嵌入式钱包信息
      const embeddedWallet = user.linkedAccounts?.find(
        account => account.type === 'wallet' && account.walletClientType === 'privy'
      )
      
      if (embeddedWallet) {
        setWalletInfo({
          address: embeddedWallet.address,
          chain: embeddedWallet.chain,
          type: 'embedded'
        })
      }
      
      // 通知父窗口认证状态变化
      const userInfo = {
        id: user.id,
        email: user.email?.address,
        name: user.google?.name || user.email?.address?.split('@')[0],
        walletAddress: embeddedWallet?.address,
        balance: '0.00' // 可以在这里添加真实的余额信息
      }
      
      console.log('发送认证成功消息:', userInfo)
      window.parent.postMessage({
        type: 'PRIVY_AUTH_STATE',
        authenticated: true,
        user: userInfo
      }, '*')
    } else if (!authenticated) {
      setWalletInfo(null)
      // 通知父窗口登出状态
      console.log('发送登出消息')
      window.parent.postMessage({
        type: 'PRIVY_AUTH_STATE',
        authenticated: false,
        user: null
      }, '*')
    }
  }, [authenticated, user])

  // 监听钱包连接状态变化
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      console.log('检测到连接的钱包:', wallets)
      
      // 更新外部钱包列表
      const externalWalletsList = wallets.filter(wallet => wallet.walletClientType !== 'privy')
      setExternalWallets(externalWalletsList)
      
      // 如果有外部钱包连接，更新钱包信息
      if (externalWalletsList.length > 0) {
        const primaryWallet = externalWalletsList[0]
        setWalletInfo({
          address: primaryWallet.address,
          chain: primaryWallet.chain,
          type: 'external',
          walletType: primaryWallet.walletClientType
        })
        
        // 通知父窗口外部钱包连接成功
        window.parent.postMessage({
          type: 'EXTERNAL_WALLET_CONNECTED',
          wallet: {
            address: primaryWallet.address,
            chain: primaryWallet.chain,
            type: primaryWallet.walletClientType
          }
        }, '*')
      }
    }
  }, [wallets])

  // 处理连接外部钱包
  const handleConnectExternalWallet = async (walletType) => {
    try {
      setIsConnectingExternal(true)
      console.log('开始连接外部钱包:', walletType)
      
      // 使用Privy的connectWallet方法来连接外部钱包
      connectWallet({
        wallet: {
          walletType: walletType
        }
      })
      
      console.log('外部钱包连接流程已触发:', walletType)
      
    } catch (error) {
      console.error('连接外部钱包失败:', error)
      window.parent.postMessage({
        type: 'PRIVY_ERROR',
        error: `连接外部钱包失败: ${error.message}`
      }, '*')
    } finally {
      setIsConnectingExternal(false)
    }
  }

  // 处理登录
  const handleLogin = async (method = 'wallet') => {
    try {
      if (method === 'wallet') {
        await login()
      } else if (method === 'google') {
        await login({ method: 'google' })
      } else if (method === 'email') {
        await login({ method: 'email' })
      } else if (method.startsWith('external-')) {
        // 处理外部钱包登录
        const walletType = method.replace('external-', '')
        await handleConnectExternalWallet(walletType)
      }
    } catch (error) {
      console.error('登录失败:', error)
      // 通知父窗口错误
      window.parent.postMessage({
        type: 'PRIVY_ERROR',
        error: error.message
      }, '*')
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
      window.parent.postMessage({
        type: 'PRIVY_ERROR',
        error: error.message
      }, '*')
    }
  }

  // 创建钱包
  const handleCreateWallet = async () => {
    try {
      setIsCreatingWallet(true)
      console.log('🚀 React应用开始创建钱包...')
      console.log('当前认证状态:', authenticated)
      console.log('用户信息:', user)
      
      if (!authenticated) {
        throw new Error('用户未认证，无法创建钱包')
      }
      
      if (!user) {
        throw new Error('用户信息不存在，无法创建钱包')
      }
      
      // 创建钱包 - 默认创建以太坊钱包
      console.log('📤 调用createWallet函数...')
      const wallet = await createWallet()
      
      console.log('✅ 钱包创建成功:', wallet)
      console.log('钱包地址:', wallet.address)
      console.log('钱包链:', wallet.chain)
      
      // 更新钱包信息
      setWalletInfo({
        address: wallet.address,
        chain: wallet.chain || 'ethereum',
        type: 'embedded'
      })
      
      console.log('📤 准备发送WALLET_CREATED消息到父窗口...')
      
      // 通知父窗口钱包创建成功
      window.parent.postMessage({
        type: 'WALLET_CREATED',
        wallet: {
          address: wallet.address,
          chain: wallet.chain || 'ethereum'
        }
      }, '*')
      
      console.log('✅ WALLET_CREATED消息已发送')
      
    } catch (error) {
      console.error('💥 创建钱包失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      window.parent.postMessage({
        type: 'PRIVY_ERROR',
        error: error.message || '创建钱包失败'
      }, '*')
    } finally {
      setIsCreatingWallet(false)
      console.log('🏁 React应用创建钱包流程结束')
    }
  }

  if (!ready) {
    return (
      <div className="privy-container">
        <div className="privy-header">
          <h1>🔐 钱包认证</h1>
          <p>正在初始化认证系统...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="privy-container">
      <div className="privy-header">
        <h1>🔐 钱包认证</h1>
        <p>使用Privy进行真实钱包认证</p>
      </div>

      {!authenticated ? (
        <div>
          <button 
            className="privy-button privy-button-primary"
            onClick={() => handleLogin('wallet')}
          >
            🔗 连接钱包
          </button>
          
          <button 
            className="privy-button privy-button-secondary"
            onClick={() => handleLogin('google')}
          >
            🔐 Google登录
          </button>
          
          <button 
            className="privy-button privy-button-secondary"
            onClick={() => handleLogin('email')}
          >
            📧 邮箱登录
          </button>
        </div>
      ) : (
        <div>
          <div className="privy-user-info">
            <h3>👤 用户信息</h3>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>邮箱:</strong> {user.email?.address || '未设置'}</p>
            <p><strong>姓名:</strong> {user.google?.name || user.email?.address?.split('@')[0] || '用户'}</p>
            <p><strong>钱包地址:</strong> {walletInfo?.address || '未连接钱包'}</p>
            <p><strong>钱包类型:</strong> {walletInfo?.type === 'embedded' ? '嵌入式钱包' : '外部钱包'}</p>
            {walletInfo?.walletType && (
              <p><strong>外部钱包:</strong> {walletInfo.walletType}</p>
            )}
          </div>
          
          {/* 外部钱包连接按钮 - 只有在用户认证后才显示 */}
          <div className="external-wallets-section">
            <h4>🌐 连接外部钱包</h4>
            <button 
              className="privy-button privy-button-primary"
              onClick={() => handleConnectExternalWallet('metamask')}
              disabled={isConnectingExternal}
            >
              {isConnectingExternal ? '⏳ 连接中...' : '🔗 连接外部钱包'}
            </button>
          </div>
          
          {/* 创建钱包按钮 - 只有在没有钱包地址时显示 */}
          {!walletInfo?.address && (
            <button 
              className="privy-button privy-button-primary"
              onClick={handleCreateWallet}
              disabled={isCreatingWallet}
            >
              {isCreatingWallet ? '⏳ 创建中...' : '💳 创建钱包'}
            </button>
          )}
          
          <button 
            className="privy-button privy-button-secondary"
            onClick={handleLogout}
          >
            🚪 断开连接
          </button>
        </div>
      )}
    </div>
  )
}

// 主应用组件
function App() {
  return (
    <PrivyProvider appId={privyConfig.appId} config={privyConfig}>
      <PrivyAuth />
    </PrivyProvider>
  )
}

export default App
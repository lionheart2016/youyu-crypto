import React, { useEffect, useState } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'

// Privy配置 - 使用真实的应用ID
const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  appearance: {
    theme: 'light',
    accentColor: '#3B82F6',
    logo: 'https://your-logo-url.com/logo.png'
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets'
  }
}

// 演示模式组件
function DemoAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (method) => {
    // 模拟登录过程
    setTimeout(() => {
      setIsAuthenticated(true)
      const demoUser = {
        id: `demo-${method}-user`,
        email: `${method}@demo.com`,
        name: `Demo ${method} User`,
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
      }
      setUser(demoUser)
      
      // 通知父窗口
      window.parent.postMessage({
        type: 'PRIVY_AUTH_STATE',
        authenticated: true,
        user: demoUser
      }, '*')
    }, 2000)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    window.parent.postMessage({
      type: 'PRIVY_AUTH_STATE',
      authenticated: false,
      user: null
    }, '*')
  }

  return (
    <div className="privy-container">
      <div className="privy-header">
        <h1>🔐 钱包认证 (演示模式)</h1>
        <p>当前为演示模式，请配置实际Privy应用ID</p>
      </div>

      {!isAuthenticated ? (
        <div>
          <button 
            className="privy-button privy-button-primary"
            onClick={() => handleLogin('wallet')}
          >
            🔗 模拟钱包连接
          </button>
          
          <button 
            className="privy-button privy-button-secondary"
            onClick={() => handleLogin('google')}
          >
            🔐 模拟Google登录
          </button>
          
          <button 
            className="privy-button privy-button-secondary"
            onClick={() => handleLogin('email')}
          >
            📧 模拟邮箱登录
          </button>
          
          <div style={{marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '6px', fontSize: '14px', color: '#856404'}}>
            <strong>提示：</strong>这是演示模式。要使用真实Privy认证，请：<br/>
            1. 访问 <a href="https://privy.io" target="_blank" style={{color: '#007bff'}}>privy.io</a> 创建应用<br/>
            2. 在项目根目录创建 .env 文件<br/>
            3. 设置 VITE_PRIVY_APP_ID=您的应用ID
          </div>
        </div>
      ) : (
        <div>
          <div className="privy-user-info">
            <h3>👤 用户信息 (演示)</h3>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>邮箱:</strong> {user.email}</p>
            <p><strong>姓名:</strong> {user.name}</p>
            <p><strong>钱包地址:</strong> {user.walletAddress}</p>
          </div>
          
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

// 主认证组件
function PrivyAuth() {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const [walletInfo, setWalletInfo] = useState(null)

  useEffect(() => {
    // 监听来自父窗口的消息
    const handleMessage = (event) => {
      if (event.data.type === 'OPEN_LOGIN_MODAL') {
        // 自动打开钱包连接
        handleLogin('wallet')
      } else if (event.data.type === 'LOGOUT_REQUEST') {
        // 执行登出
        handleLogout()
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
          chain: embeddedWallet.chain
        })
      }
      
      // 通知父窗口认证状态变化
      const userInfo = {
        id: user.id,
        email: user.email?.address,
        name: user.google?.name || user.email?.address?.split('@')[0],
        walletAddress: embeddedWallet?.address
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

  // 处理登录
  const handleLogin = async (method = 'wallet') => {
    try {
      if (method === 'wallet') {
        await login()
      } else if (method === 'google') {
        await login({ method: 'google' })
      } else if (method === 'email') {
        await login({ method: 'email' })
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

  if (!ready) {
    return (
      <div className="privy-container">
        <div className="privy-loading">
          <p>正在加载认证服务...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="privy-container">
      <div className="privy-header">
        <h1>钱包认证</h1>
        <p>连接您的钱包开始使用</p>
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
            {user.email?.address && (
              <p><strong>邮箱:</strong> {user.email.address}</p>
            )}
            {user.google?.name && (
              <p><strong>姓名:</strong> {user.google.name}</p>
            )}
            {walletInfo && (
              <p><strong>钱包地址:</strong> {walletInfo.address}</p>
            )}
          </div>
          
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
  const [useDemoMode, setUseDemoMode] = useState(null) // 初始为null表示未确定
  
  useEffect(() => {
    // 检查是否应该使用演示模式
    const appId = privyConfig.appId
    const shouldUseDemoMode = appId === 'demo-mode' || !appId || appId === 'undefined'
    setUseDemoMode(shouldUseDemoMode)
  }, [])
  
  // 等待检测完成
  if (useDemoMode === null) {
    return (
      <div className="privy-container">
        <div className="privy-loading">
          <p>正在检测认证模式...</p>
        </div>
      </div>
    )
  }
  
  if (useDemoMode) {
    return <DemoAuth />
  }
  
  return (
    <PrivyProvider appId={privyConfig.appId} config={privyConfig}>
      <PrivyAuth />
    </PrivyProvider>
  )
}

export default App
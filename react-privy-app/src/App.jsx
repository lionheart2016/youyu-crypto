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

// 主认证组件
function PrivyAuth() {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const [walletInfo, setWalletInfo] = useState(null)

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
  
  // 监听来自父窗口的同步请求
  useEffect(() => {
    const handleSyncRequest = (event) => {
      if (event.data.type === 'SYNC_AUTH_STATE') {
        console.log('收到同步请求，当前状态:', { authenticated, user })
        
        if (authenticated && user) {
          const embeddedWallet = user.linkedAccounts?.find(
            account => account.type === 'wallet' && account.walletClientType === 'privy'
          )
          
          const userInfo = {
            id: user.id,
            email: user.email?.address,
            name: user.google?.name || user.email?.address?.split('@')[0],
            walletAddress: embeddedWallet?.address,
            balance: '0.00'
          }
          
          window.parent.postMessage({
            type: 'PRIVY_AUTH_STATE',
            authenticated: true,
            user: userInfo
          }, '*')
        } else {
          window.parent.postMessage({
            type: 'PRIVY_AUTH_STATE',
            authenticated: false,
            user: null
          }, '*')
        }
      }
    }
    
    window.addEventListener('message', handleSyncRequest)
    return () => window.removeEventListener('message', handleSyncRequest)
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
  return (
    <PrivyProvider appId={privyConfig.appId} config={privyConfig}>
      <PrivyAuth />
    </PrivyProvider>
  )
}

export default App
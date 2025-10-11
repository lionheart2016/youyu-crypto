import { ref, provide, inject, onMounted, onUnmounted } from 'vue'
import { privyConfig } from '../config/privy.js'

// 创建Privy上下文键
const PrivyContextKey = Symbol('privy')

export const createPrivyContext = () => {
  // Vue响应式状态
  const ready = ref(false)
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const currentWallet = ref(null)
  const walletAddress = ref('')
  const walletBalance = ref('0')
  const googleLoginEnabled = ref(true)
  const iframeRef = ref(null)
  const showIframe = ref(false)
  
  // 监听来自React应用的消息
  const messageHandler = (event) => {
    console.log('收到消息:', event.data)
    
    if (event.data.type === 'PRIVY_AUTH_STATE') {
      console.log('处理认证状态消息:', event.data)
      console.log('当前状态更新前:', {
        isAuthenticated: isAuthenticated.value,
        user: user.value,
        walletAddress: walletAddress.value,
        walletBalance: walletBalance.value
      })
      
      isAuthenticated.value = event.data.authenticated
      user.value = event.data.user
      if (event.data.authenticated && event.data.user) {
        walletAddress.value = event.data.user.walletAddress || ''
        walletBalance.value = event.data.user.balance || '0'
        console.log('用户认证成功，状态更新后:', {
          isAuthenticated: isAuthenticated.value,
          user: user.value,
          walletAddress: walletAddress.value,
          walletBalance: walletBalance.value
        })
        
        // 认证成功后立即隐藏iframe
        hidePrivyIframe()
        console.log('认证成功，已隐藏iframe')
      } else {
        walletAddress.value = ''
        walletBalance.value = '0'
        user.value = null
        console.log('用户已登出，状态更新后:', {
          isAuthenticated: isAuthenticated.value,
          user: user.value,
          walletAddress: walletAddress.value,
          walletBalance: walletBalance.value
        })
      }
    } else if (event.data.type === 'PRIVY_ERROR') {
      error.value = event.data.error
      console.error('Privy错误:', event.data.error)
    }
  }
  
  // 初始化Privy - 通过iframe嵌入React应用
  const initPrivy = () => {
    try {
      console.log('Privy初始化开始')
      
      // 添加消息监听器
      window.addEventListener('message', messageHandler)
      
      // 设置iframe引用
      ready.value = true
      
      // 延迟同步状态，确保iframe已加载
      setTimeout(() => {
        syncAuthState()
      }, 1000)
      
      console.log('Privy初始化完成 - 通过iframe嵌入React应用')
      
    } catch (err) {
      console.error('Privy初始化失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 同步认证状态
  const syncAuthState = () => {
    if (!ready.value) {
      console.log('Privy未就绪，跳过状态同步')
      return
    }
    
    console.log('发送状态同步请求到React应用')
    
    // 检查iframe是否已加载
    if (iframeRef.value && iframeRef.value.contentWindow) {
      iframeRef.value.contentWindow.postMessage({
        type: 'SYNC_AUTH_STATE',
        timestamp: Date.now()
      }, 'http://localhost:3001')
      console.log('状态同步请求已发送')
    } else {
      console.warn('iframe未准备好，无法发送同步请求')
    }
  }
  
  // 手动触发状态同步
  const manualSync = () => {
    console.log('手动触发状态同步')
    syncAuthState()
  }
  
  // 检查认证状态
  const checkAuthStatus = () => {
    return isAuthenticated.value
  }

  // 显示iframe
  const showPrivyIframe = () => {
    showIframe.value = true
  }
  
  // 隐藏iframe
  const hidePrivyIframe = () => {
    showIframe.value = false
  }
  
  // 设置iframe引用
  const setIframeRef = (ref) => {
    iframeRef.value = ref
  }
  
  // 通过iframe打开React应用的登录界面
  const loginWithPrivy = async (method = 'wallet', options = {}) => {
    if (!ready.value) {
      console.error('Privy未就绪')
      error.value = 'Privy认证系统未就绪，请刷新页面重试'
      throw new Error('Privy未就绪')
    }
    
    // 如果iframe已经在显示，先隐藏再重新显示，确保状态正确
    if (showIframe.value) {
      hidePrivyIframe()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    try {
      loading.value = true
      error.value = null
      
      // 显示iframe
      showPrivyIframe()
      
      // 等待iframe加载完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 检查iframe是否已加载
      if (!iframeRef.value || !iframeRef.value.contentWindow) {
        throw new Error('iframe加载失败')
      }
      
      // 通知React应用打开登录界面
      iframeRef.value.contentWindow.postMessage({
        type: 'OPEN_LOGIN_MODAL',
        method: method,
        options: options
      }, 'http://localhost:3001')
      
      console.log('已请求打开Privy登录界面，方法:', method)
      
      return { success: true }
    } catch (err) {
      console.error('打开登录界面失败:', err)
      error.value = err.message
      
      // 发生错误时隐藏iframe
      hidePrivyIframe()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 连接钱包（兼容现有接口）
  const connectWallet = async () => {
    return await loginWithPrivy('wallet')
  }
  
  // 通过iframe通知React应用登出
  const logoutWithPrivy = async () => {
    try {
      loading.value = true
      
      // 通知React应用登出
      if (iframeRef.value && iframeRef.value.contentWindow) {
        iframeRef.value.contentWindow.postMessage({
          type: 'LOGOUT_REQUEST'
        }, 'http://localhost:3001')
      }
      
      // 清除本地状态
      isAuthenticated.value = false
      user.value = null
      walletAddress.value = ''
      walletBalance.value = '0'
      
      console.log('已请求Privy登出')
      
    } catch (err) {
      console.error('登出请求失败:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 断开连接（兼容现有接口）
  const disconnectWallet = async () => {
    return await logoutWithPrivy()
  }
  
  // Google登录处理
  const handleGoogleLogin = async (googleUserData) => {
    try {
      console.log('处理Google登录:', googleUserData)
      
      // 使用Privy进行真实Google登录
      const result = await loginWithPrivy({ method: 'google' })
      
      console.log('Google登录成功:', result)
      
      return result
    } catch (error) {
      console.error('Google登录处理失败:', error)
      throw error
    }
  }
  
  // 邮箱登录处理
  const handleEmailLogin = async (email, verificationCode) => {
    try {
      loading.value = true
      error.value = null
      
      // 使用Privy进行真实邮箱登录
      const result = await loginWithPrivy({ method: 'email', email })
      
      console.log('邮箱登录成功:', result)
      
      return { success: true }
    } catch (err) {
      console.error('邮箱登录处理失败:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 发送邮箱验证码
  const sendEmailVerificationCode = async (email) => {
    try {
      if (!email) {
        throw new Error('邮箱地址不能为空')
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('请输入有效的邮箱地址')
      }
      
      loading.value = true
      error.value = null
      
      // 使用Privy发送真实邮箱验证码
      const result = await loginWithPrivy({ method: 'email', email })
      
      console.log('邮箱验证码发送成功:', result)
      
      return { success: true }
    } catch (err) {
      console.error('邮箱验证码发送失败:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 检查Google登录是否可用
  const isGoogleLoginEnabled = () => {
    return googleLoginEnabled.value
  }
  
  // 获取用户信息
  const getUser = () => {
    return user.value
  }
  
  // 发送真实区块链交易
  const sendTransactionWithPrivy = async (transaction) => {
    if (!isAuthenticated.value) {
      throw new Error('用户未认证')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // 检查是否有真实的钱包连接
      if (!currentWallet.value || !walletAddress.value) {
        throw new Error('请先连接钱包')
      }
      
      // 构建交易参数
      const txParams = {
        from: walletAddress.value,
        to: transaction.to,
        value: transaction.value ? BigInt(transaction.value).toString() : '0',
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit || '21000',
        gasPrice: transaction.gasPrice || undefined
      }
      
      // 发送真实交易
      const result = await currentWallet.value.sendTransaction(txParams)
      
      console.log('真实交易发送成功:', result)
      
      return result
      
    } catch (err) {
      console.error('交易发送失败:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 真实签名消息
  const signMessageWithPrivy = async (message) => {
    if (!isAuthenticated.value) {
      throw new Error('用户未认证')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // 检查是否有真实的钱包连接
      if (!currentWallet.value || !walletAddress.value) {
        throw new Error('请先连接钱包')
      }
      
      // 使用真实钱包签名
      const signature = await currentWallet.value.signMessage({
        message: message
      })
      
      console.log('真实消息签名成功:', signature)
      
      return signature
      
    } catch (err) {
      console.error('消息签名失败:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const context = {
    // 状态
    ready,
    isAuthenticated,
    user,
    loading,
    error,
    currentWallet,
    walletAddress,
    walletBalance,
    googleLoginEnabled,
    showIframe,
    
    // 方法
    initPrivy,
    login: loginWithPrivy,
    logout: logoutWithPrivy,
    connectWallet,
    disconnectWallet,
    handleGoogleLogin,
    isGoogleLoginEnabled,
    sendEmailVerificationCode,
    handleEmailLogin,
    getUser,
    sendTransaction: sendTransactionWithPrivy,
    signMessage: signMessageWithPrivy,
    showPrivyIframe,
    hidePrivyIframe,
    setIframeRef,
    syncAuthState,
    manualSync
  }
  
  return context
}

export const usePrivy = () => {
  const context = inject(PrivyContextKey);
  if (!context) {
    throw new Error('usePrivy must be used within a component that provides Privy context');
  }
  return context;
};

export const providePrivy = (context) => {
  provide(PrivyContextKey, context);
};
import React, { useEffect, useState } from 'react'
import { PrivyProvider, usePrivy, useCreateWallet, useWallets, useConnectWallet } from '@privy-io/react-auth'
import TransactionSender from './components/TransactionSender'
import UserInfo from './components/UserInfo'
import WalletList from './components/WalletList'
import WalletOperations from './components/WalletOperations'
import WalletActions from './components/WalletActions'
import LogoutButton from './components/LogoutButton'

// 为浏览器环境添加Buffer支持
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer

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
  // 启用多种登录方式：Google、Apple、GitHub、邮箱和钱包
  loginMethods: ['google', 'apple', 'github', 'email', 'wallet'],
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
  const { login, logout, authenticated, user, ready: privyReady } = usePrivy()
  const { createWallet } = useCreateWallet()
  const { wallets, ready: walletsReady } = useWallets()
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
  
  // 签名和转账功能状态
  const [isSigning, setIsSigning] = useState(false)
  const [signResult, setSignResult] = useState(null)
  
  // 钱包管理状态
  const [activeWallet, setActiveWallet] = useState(null)
  const [allWallets, setAllWallets] = useState([])

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
      } else if (event.data.type === 'SIGN_MESSAGE_REQUEST') {
        // 签名消息请求
        console.log('收到签名消息请求')
        const message = event.data.message || 'Hello, Privy!'
        handleSignMessage(message)
      } else if (event.data.type === 'SEND_TRANSACTION_REQUEST') {
        // 发送交易请求 - 现在由TransactionSender组件处理
        console.log('收到发送交易请求 - 将由TransactionSender组件处理')
        // 消息会传递给TransactionSender组件处理
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
      
      // 检查是否有外部钱包连接
      const hasExternalWallets = externalWallets && externalWallets.length > 0
      const primaryExternalWallet = hasExternalWallets ? externalWallets[0] : null
      
      // 优先使用外部钱包地址，如果没有则使用嵌入式钱包地址
      const walletAddress = primaryExternalWallet?.address || embeddedWallet?.address
      
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
        walletAddress: walletAddress, // 使用外部钱包或嵌入式钱包地址
        balance: '0.00' // 默认余额为0.00，不再从后端获取
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
  }, [authenticated, user, externalWallets])

  // 监听钱包连接状态变化
  useEffect(() => {
    console.log('钱包状态检查:', { 
      walletsReady, 
      walletsLength: wallets?.length, 
      userLinkedAccounts: user?.linkedAccounts,
      user: user 
    })
    
    // 确保钱包已经完全加载
    if (!walletsReady) {
      console.log('钱包尚未ready，等待...')
      return
    }
    
    console.log('检测到连接的钱包:', wallets)
    console.log('用户linkedAccounts:', user?.linkedAccounts)
    
    // 更新外部钱包列表
    const externalWalletsList = wallets.filter(wallet => wallet.walletClientType !== 'privy')
    setExternalWallets(externalWalletsList)
    
    // 构建所有钱包列表（包括嵌入式和外部钱包）
    const walletList = []
    const processedAddresses = new Set() // 用于避免重复地址
    
    // 方法1: 从useWallets获取的钱包（包括嵌入式和外部钱包）
    if (wallets && wallets.length > 0) {
      wallets.forEach(wallet => {
        if (wallet.address && !processedAddresses.has(wallet.address.toLowerCase())) {
          const isEmbedded = wallet.walletClientType === 'privy'
          walletList.push({
            address: wallet.address,
            chain: wallet.chain || 'ethereum',
            type: isEmbedded ? 'embedded' : 'external',
            walletType: wallet.walletClientType || (isEmbedded ? 'privy' : 'unknown'),
            name: isEmbedded ? '嵌入式钱包' : (wallet.walletClientType || '外部钱包')
          })
          processedAddresses.add(wallet.address.toLowerCase())
        }
      })
    }
    
    // 方法2: 从user.linkedAccounts获取钱包（包括嵌入式钱包）
    if (user?.linkedAccounts) {
      const walletAccounts = user.linkedAccounts.filter(account => account.type === 'wallet')
      console.log('从linkedAccounts找到的钱包账户:', walletAccounts)
      
      walletAccounts.forEach(account => {
        if (account.address && !processedAddresses.has(account.address.toLowerCase())) {
          const isEmbedded = account.walletClientType === 'privy'
          walletList.push({
            address: account.address,
            chain: account.chain || 'ethereum',
            type: isEmbedded ? 'embedded' : 'external',
            walletType: account.walletClientType || (isEmbedded ? 'privy' : 'unknown'),
            name: isEmbedded ? '嵌入式钱包' : (account.walletClientType || '外部钱包')
          })
          processedAddresses.add(account.address.toLowerCase())
        }
      })
    }
    
    // 方法3: 检查user对象中是否直接包含嵌入式钱包信息
    if (user?.wallet) {
      console.log('从user对象找到嵌入式钱包:', user.wallet)
      if (user.wallet.address && !processedAddresses.has(user.wallet.address.toLowerCase())) {
        walletList.push({
          address: user.wallet.address,
          chain: user.wallet.chain || 'ethereum',
          type: 'embedded',
          walletType: 'privy',
          name: '嵌入式钱包'
        })
        processedAddresses.add(user.wallet.address.toLowerCase())
      }
    }
    
    setAllWallets(walletList)
    console.log('最终所有钱包列表:', walletList)
    console.log('处理的钱包地址:', Array.from(processedAddresses))
    
    // 设置默认激活钱包（优先使用外部钱包，如果没有则使用嵌入式钱包）
    if (walletList.length > 0 && !activeWallet) {
      const defaultWallet = externalWalletsList.length > 0 ? walletList.find(w => w.type === 'external') : walletList[0]
      setActiveWallet(defaultWallet)
      
      // 更新钱包信息
      setWalletInfo({
        address: defaultWallet.address,
        chain: defaultWallet.chain,
        type: defaultWallet.type,
        walletType: defaultWallet.walletType
      })
      
      // 通知父窗口外部钱包连接成功
      if (defaultWallet.type === 'external') {
        window.parent.postMessage({
          type: 'EXTERNAL_WALLET_CONNECTED',
          wallet: {
            address: defaultWallet.address,
            chain: defaultWallet.chain,
            type: defaultWallet.walletType
          }
        }, '*')
      }
      
      // 同时更新认证状态，确保包含钱包地址和默认余额
      if (authenticated && user) {
        const userInfo = {
          id: user.id,
          email: user.email?.address,
          name: user.google?.name || user.email?.address?.split('@')[0],
          walletAddress: defaultWallet.address, // 使用激活钱包地址
          balance: '0.00' // 默认余额为0.00，不再从后端获取
        }
        
        console.log('更新认证状态，包含激活钱包地址和余额:', userInfo)
        window.parent.postMessage({
          type: 'PRIVY_AUTH_STATE',
          authenticated: true,
          user: userInfo
        }, '*')
      }
    }
  }, [wallets, walletsReady, authenticated, user, activeWallet])

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

  // 激活特定钱包
  const handleActivateWallet = (wallet) => {
    console.log('激活钱包:', wallet)
    setActiveWallet(wallet)
    
    // 更新钱包信息
    setWalletInfo({
      address: wallet.address,
      chain: wallet.chain,
      type: wallet.type,
      walletType: wallet.walletType
    })
    
    // 通知父窗口钱包激活变化
    window.parent.postMessage({
      type: 'WALLET_ACTIVATED',
      wallet: wallet
    }, '*')
    
    console.log('钱包激活成功:', wallet)
  }

  // 处理登录
  const handleLogin = async (method = 'wallet') => {
    try {
      if (method === 'wallet') {
        await login()
      } else if (method === 'google') {
        await login({ method: 'google' })
      } else if (method === 'apple') {
        await login({ method: 'apple' })
      } else if (method === 'github') {
        await login({ method: 'github' })
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

  // 处理签名请求
  const handleSignMessage = async (message) => {
    try {
      setIsSigning(true)
      setSignResult(null)
      
      console.log('📝 开始签名消息...')
      console.log('消息内容:', message)
      console.log('激活的钱包:', activeWallet)
      console.log('钱包信息:', walletInfo)
      console.log('可用钱包列表:', wallets)
      
      // 优先使用激活的钱包
      let walletToUse = activeWallet
      
      // 如果没有激活的钱包，尝试从钱包列表中获取
      if (!walletToUse && allWallets.length > 0) {
        walletToUse = allWallets[0]
        console.log('使用第一个钱包作为激活钱包:', walletToUse)
      }
      
      // 如果仍然没有钱包，使用旧的钱包信息
      if (!walletToUse && walletInfo?.address) {
        walletToUse = {
          address: walletInfo.address,
          name: walletInfo.type === 'embedded' ? '嵌入式钱包' : '外部钱包',
          type: walletInfo.type,
          chain: 'ethereum'
        }
        console.log('使用旧的钱包信息:', walletToUse)
      }
      
      if (!walletToUse?.address) {
        throw new Error('没有可用的钱包地址')
      }
      
      // 尝试获取实际的钱包对象进行签名
      let wallet = null
      
      // 方法1: 从wallets数组中获取匹配的钱包
      if (wallets && wallets.length > 0) {
        wallet = wallets.find(w => w.address === walletToUse.address)
        if (wallet) {
          console.log('从wallets数组获取钱包:', wallet)
        }
      }

      
      if (!wallet) {
        console.error('无法获取可用的钱包对象')
        console.error('walletToUse:', walletToUse)
        console.error('wallets:', wallets)
        console.error('user:', user)
        console.error('externalWallets:', externalWallets)
        throw new Error('无法获取可用的钱包对象，请确保钱包已正确连接')
      }
      
      console.log('使用钱包进行签名:', wallet)
      
      // 创建签名消息
      const messageToSign = typeof message === 'string' ? message : JSON.stringify(message)
      console.log('待签名消息:', messageToSign)
      
      // 使用钱包签名
      let signature
      try {
        if (wallet.sign) {
          // 如果钱包对象有sign方法，直接使用
          console.log('使用wallet.sign方法进行签名...')
          signature = await wallet.sign(messageToSign)
        } else {
          // 如果以上方法都不可用，尝试使用嵌入式钱包的签名功能
          console.log('尝试使用嵌入式钱包的签名功能...')
          if (walletInfo.type === 'embedded') {
            // 对于嵌入式钱包，使用Privy SDK进行签名
            console.log('使用嵌入式钱包的Privy SDK签名功能...')
            const provider = wallet.getEthereumProvider ? await wallet.getEthereumProvider() : null
            if (provider) {
              // 使用Privy SDK的签名功能
              if (wallet.signMessage) {
                signature = await wallet.signMessage(messageToSign)
              } else {
                throw new Error('钱包不支持签名功能')
              }
            } else {
              // 如果无法获取provider，尝试重新创建钱包
              console.log('重新创建嵌入式钱包进行签名...')
              const newWallet = await createWallet()
              if (newWallet && newWallet.signMessage) {
                signature = await newWallet.signMessage(messageToSign)
              } else {
                throw new Error('无法获取钱包provider进行签名')
              }
            }
          } else {
            throw new Error('钱包不支持签名功能，请确保钱包已正确连接并支持签名操作')
          }
        }
      } catch (signError) {
        console.error('签名方法失败:', signError)
        // 如果主要签名方法失败，尝试备用方法
        console.log('尝试备用签名方法...')
        try {
          if (walletInfo.type === 'embedded') {
            // 对于嵌入式钱包，尝试使用Privy SDK进行签名
            if (wallet.signMessage) {
              signature = await wallet.signMessage(messageToSign)
            } else {
              throw new Error('钱包不支持签名功能')
            }
          } else {
            throw signError
          }
        } catch (backupError) {
          console.error('备用签名方法也失败:', backupError)
          throw signError // 抛出原始错误
        }
      }
      
      console.log('✅ 签名成功:', signature)
      setSignResult({
        success: true,
        signature: signature,
        message: messageToSign,
        address: wallet.address || walletInfo.address
      })
      
      // 通知父窗口签名成功
      window.parent.postMessage({
        type: 'SIGN_SUCCESS',
        result: {
          signature: signature,
          message: messageToSign,
          address: wallet.address || walletInfo.address
        }
      }, '*')
      
    } catch (error) {
      console.error('💥 签名失败:', error)
      setSignResult({
        success: false,
        error: error.message || '签名失败'
      })
      
      // 通知父窗口签名失败
      window.parent.postMessage({
        type: 'SIGN_ERROR',
        error: error.message || '签名失败'
      }, '*')
    } finally {
      setIsSigning(false)
    }
  }

  // 切换到Sepolia网络 - 基于Privy官方文档优化
  const switchToSepolia = async () => {
    try {
      console.log('🔄 切换到Sepolia网络...')
      
      // 获取当前钱包列表
      const { wallets } = useWallets()
      
      if (!wallets || wallets.length === 0) {
        console.log('ℹ️  没有可用的钱包，跳过网络切换')
        return false
      }
      
      // 使用第一个钱包进行网络切换（根据Privy文档）
      const wallet = wallets[0]
      const sepoliaChainId = 11155111 // Sepolia的chain ID（十进制）
      
      try {
        // 使用Privy SDK的switchChain方法（官方推荐方式）
        await wallet.switchChain(sepoliaChainId)
        console.log('✅ 成功切换到Sepolia网络')
        return true
        
      } catch (switchError) {
        console.error('Privy switchChain失败:', switchError)
        
        // 如果Privy方法失败，尝试传统的MetaMask方法作为备用
        if (window.ethereum) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia的chain ID（十六进制）
            })
            console.log('✅ 使用MetaMask方法成功切换到Sepolia网络')
            return true
            
          } catch (metaMaskError) {
            // 如果网络不存在，尝试添加网络
            if (metaMaskError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',
                    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                  }],
                })
                console.log('✅ 成功添加并切换到Sepolia网络')
                return true
                
              } catch (addError) {
                console.error('添加Sepolia网络失败:', addError)
              }
            } else {
              console.error('MetaMask切换网络失败:', metaMaskError)
            }
          }
        }
        
        console.log('ℹ️  无法自动切换网络，将使用默认Sepolia RPC')
        return false
      }
      
    } catch (error) {
      console.error('网络切换失败:', error)
      return false
    }
  }





  // 在组件加载且未认证时自动触发登录
  useEffect(() => {
    if (privyReady && !authenticated && !user) {
      console.log('自动触发Privy登录界面...')
      login()
    }
  }, [privyReady, authenticated, user])

  // 不再定期刷新钱包余额（移除后端依赖）
  useEffect(() => {
    // 钱包余额功能已移除，此useEffect保留用于未来扩展
    return () => {}
  }, [allWallets])

  if (!privyReady) {
    return (
      <div className="privy-container">
        <div className="privy-header">
          <h1>🔐 钱包认证</h1>
          <p>正在初始化认证系统...</p>
        </div>
      </div>
    )
  }

  // 如果未认证，不显示任何按钮，让Privy处理登录界面
  if (!authenticated) {
    return (
      <div className="privy-container">
        <div className="privy-header">
          <h1>🔐 钱包认证</h1>
          <p>正在加载登录界面...</p>
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
    
          {authenticated && (
            <div className="authenticated-content">
              <UserInfo 
                user={user}
                walletsReady={walletsReady}
                wallets={wallets}
                activeWallet={activeWallet}
              />
              
              {/* 钱包卡片展示区域 */}
              <WalletList 
                walletsReady={walletsReady}
                allWallets={allWallets}
                activeWallet={activeWallet}
                onActivateWallet={handleActivateWallet}
              />
              
              {/* 钱包操作区域 */}
              <WalletOperations 
                walletInfo={walletInfo}
                isConnectingExternal={isConnectingExternal}
                isCreatingWallet={isCreatingWallet}
                onConnectExternalWallet={() => handleConnectExternalWallet('metamask')}
                onCreateWallet={handleCreateWallet}
              />
              
              {/* 签名和转账功能 - 只有在有钱包地址时显示 */}
              {activeWallet?.address && (
                <WalletActions 
                  activeWallet={activeWallet}
                  walletInfo={walletInfo}
                  wallets={wallets}
                  externalWallets={externalWallets}
                  user={user}
                  createWallet={createWallet}
                  switchToSepolia={switchToSepolia}
                  isSigning={isSigning}
                  signResult={signResult}
                  onSignMessage={() => handleSignMessage('Hello, Privy!')}
                />
              )}
              
              <LogoutButton onLogout={handleLogout} />
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
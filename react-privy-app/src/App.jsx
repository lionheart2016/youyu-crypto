import React, { useEffect, useState } from 'react'
import { PrivyProvider, usePrivy, useCreateWallet, useWallets, useConnectWallet } from '@privy-io/react-auth'
import { ethers } from 'ethers'

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
  const [isSendingTransaction, setIsSendingTransaction] = useState(false)
  const [signResult, setSignResult] = useState(null)
  const [transactionResult, setTransactionResult] = useState(null)
  
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
        // 发送交易请求
        console.log('收到发送交易请求')
        const transactionData = event.data.transactionData
        if (transactionData) {
          handleSendTransaction(transactionData)
        } else {
          console.error('缺少交易数据')
          window.parent.postMessage({
            type: 'TRANSACTION_ERROR',
            error: '缺少交易数据'
          }, '*')
        }
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
      
      // 同时更新认证状态，确保包含钱包地址
      if (authenticated && user) {
        const userInfo = {
          id: user.id,
          email: user.email?.address,
          name: user.google?.name || user.email?.address?.split('@')[0],
          walletAddress: defaultWallet.address, // 使用激活钱包地址
          balance: '0.00'
        }
        
        console.log('更新认证状态，包含激活钱包地址:', userInfo)
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
      
      // 方法2: 尝试从用户账户中获取钱包
      if (!wallet && user?.linkedAccounts) {
        const walletAccount = user.linkedAccounts.find(account => 
          account.type === 'wallet' && account.address === walletToUse.address
        )
        if (walletAccount) {
          console.log('从用户账户获取钱包信息:', walletAccount)
          // 创建一个模拟钱包对象
          wallet = {
            address: walletAccount.address,
            chain: walletAccount.chain,
            getEthereumProvider: async () => {
              // 尝试获取provider
              try {
                if (walletToUse.type === 'embedded' && window.ethereum) {
                  return window.ethereum
                }
                return null
              } catch (error) {
                console.error('获取provider失败:', error)
                return null
              }
            },
            sign: async (message) => {
              // 这里需要实现实际的签名逻辑
              // 对于嵌入式钱包，我们可以尝试使用provider和signer
              if (walletToUse.type === 'embedded') {
                try {
                  const provider = wallet.getEthereumProvider ? await wallet.getEthereumProvider() : null
                  if (provider) {
                    const signer = await provider.getSigner(walletAccount.address)
                    return await signer.signMessage(message)
                  } else {
                    throw new Error('无法获取provider')
                  }
                } catch (error) {
                  console.error('使用provider签名失败:', error)
                  // 如果provider方法失败，尝试创建新钱包
                  const embeddedWallet = await createWallet()
                  return await embeddedWallet.sign(message)
                }
              } else {
                throw new Error('无法获取钱包签名功能')
              }
            }
          }
        }
      }
      
      // 方法3: 如果是外部钱包，尝试重新连接
      if (!wallet && walletToUse.type === 'external' && externalWallets && externalWallets.length > 0) {
        wallet = externalWallets.find(w => w.address === walletToUse.address)
        if (wallet) {
          console.log('从外部钱包列表获取钱包:', wallet)
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
        } else if (wallet.signMessage) {
          // 如果钱包对象有signMessage方法，使用它
          console.log('使用wallet.signMessage方法进行签名...')
          signature = await wallet.signMessage(messageToSign)
        } else {
          // 如果以上方法都不可用，尝试使用嵌入式钱包的签名功能
          console.log('尝试使用嵌入式钱包的签名功能...')
          if (walletInfo.type === 'embedded') {
            // 对于嵌入式钱包，使用ethers.js进行签名
            console.log('使用嵌入式钱包的ethers签名功能...')
            const provider = wallet.getEthereumProvider ? await wallet.getEthereumProvider() : null
            if (provider) {
              const signer = await provider.getSigner()
              signature = await signer.signMessage(messageToSign)
            } else {
              // 如果无法获取provider，尝试重新创建钱包
              console.log('重新创建嵌入式钱包进行签名...')
              const newWallet = await createWallet()
              const newProvider = newWallet.getEthereumProvider ? await newWallet.getEthereumProvider() : null
              if (newProvider) {
                const signer = await newProvider.getSigner()
                signature = await signer.signMessage(messageToSign)
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
            // 对于嵌入式钱包，尝试使用provider进行签名
            const provider = wallet.getEthereumProvider ? await wallet.getEthereumProvider() : null
            if (provider) {
              const signer = await provider.getSigner()
              signature = await signer.signMessage(messageToSign)
            } else {
              throw new Error('无法获取钱包provider')
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

  // 切换到Sepolia网络
  const switchToSepolia = async () => {
    try {
      console.log('🔄 切换到Sepolia网络...')
      
      // 定义Sepolia网络配置
      const sepoliaChainId = '0xaa36a7' // Sepolia的chain ID
      const sepoliaRpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com'
      
      // 尝试通过wallet_switchEthereumChain切换到Sepolia
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
          })
          console.log('✅ 成功切换到Sepolia网络')
          return true
        } catch (switchError) {
          // 如果网络不存在，尝试添加网络
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: sepoliaChainId,
                  chainName: 'Sepolia Test Network',
                  rpcUrls: [sepoliaRpcUrl],
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
            console.error('切换网络失败:', switchError)
          }
        }
      }
      
      console.log('ℹ️  无法自动切换网络，将使用默认Sepolia RPC')
      return false
    } catch (error) {
      console.error('网络切换失败:', error)
      return false
    }
  }

  // 处理转账请求
  const handleSendTransaction = async (transactionData) => {
    try {
      setIsSendingTransaction(true)
      setTransactionResult(null)
      
      console.log('💸 开始发送交易...')
      console.log('交易数据:', transactionData)
      console.log('激活的钱包:', activeWallet)
      console.log('钱包信息:', walletInfo)
      
      // 首先尝试切换到Sepolia网络
      await switchToSepolia()
      
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
      
      // 尝试获取实际的钱包对象进行交易
      let wallet = null
      
      // 方法1: 从wallets数组中获取匹配的钱包
      if (wallets && wallets.length > 0) {
        wallet = wallets.find(w => w.address === walletToUse.address)
        if (wallet) {
          console.log('从wallets数组获取钱包:', wallet)
        }
      }
      
      // 方法2: 尝试从用户账户中获取钱包
      if (!wallet && user?.linkedAccounts) {
        const walletAccount = user.linkedAccounts.find(account => 
          account.type === 'wallet' && account.address === walletToUse.address
        )
        if (walletAccount) {
          console.log('从用户账户获取钱包信息:', walletAccount)
          // 创建一个模拟钱包对象
          wallet = {
            address: walletAccount.address,
            chain: walletAccount.chain,
            getEthereumProvider: async () => {
              // 尝试获取provider
              try {
                if (walletToUse.type === 'embedded' && window.ethereum) {
                  return window.ethereum
                }
                return null
              } catch (error) {
                console.error('获取provider失败:', error)
                return null
              }
            },
            sendTransaction: async (tx) => {
              // 这里需要实现实际的交易发送逻辑
              // 对于嵌入式钱包，我们可以尝试使用provider和signer
              if (walletToUse.type === 'embedded') {
                try {
                  // 对于嵌入式钱包，使用ethers.js创建provider和signer
                  console.log('使用嵌入式钱包发送交易...')
                  
                  // 获取provider - 使用window.ethereum或创建JsonRpcProvider
                  let provider
                  if (window.ethereum) {
                    provider = new ethers.BrowserProvider(window.ethereum)
                  } else {
                    // 如果没有window.ethereum，使用默认的RPC
                    provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
                  }
                  
                  // 创建signer - 对于Sepolia网络，使用地址创建Wallet
              const signerAddress = walletAccount.address
              console.log('使用地址创建Wallet signer，地址:', signerAddress)
              
              // 对于Sepolia网络，直接使用地址创建Wallet对象
              const signer = new ethers.Wallet(signerAddress, provider)
              console.log('创建Wallet signer成功:', signer)
                  
                  // 验证signer地址是否匹配
                  const signerAddressCheck = await signer.getAddress()
                  console.log('Signer地址验证:', signerAddressCheck)
                  
                  // 发送交易
                  const txResponse = await signer.sendTransaction(tx)
                  console.log('交易发送成功:', txResponse)
                  return txResponse
                  
                } catch (error) {
                  console.error('使用provider发送交易失败:', error)
                  // 如果provider方法失败，尝试创建新钱包
                  console.log('尝试重新创建钱包...')
                  const embeddedWallet = await createWallet()
                  return await embeddedWallet.sendTransaction(tx)
                }
              } else {
                throw new Error('无法获取钱包交易功能')
              }
            }
          }
        }
      }
      
      // 方法3: 如果是外部钱包，尝试重新连接
      if (!wallet && walletToUse.type === 'external' && externalWallets && externalWallets.length > 0) {
        wallet = externalWallets.find(w => w.address === walletToUse.address)
        if (wallet) {
          console.log('从外部钱包列表获取钱包:', wallet)
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
      
      console.log('使用钱包进行交易:', wallet)
      
      // 添加一个明确的标记来确认代码执行到这里
      console.log('🔍 DEBUG: 即将开始解析交易数据...')
      
      // 确保transactionData存在
      if (!transactionData) {
        console.error('❌ transactionData 为空或undefined')
        throw new Error('交易数据不能为空')
      }
      
      // 解析交易数据
      console.log('📋 准备解析transactionData:', transactionData)
      const { to, value, data = '0x', gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas } = transactionData
      
      console.log('📝 解析后的参数:', { to, value, data, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas })
      
      if (!to || !value) {
        console.error('❌ 缺少必要的交易参数:', { to, value })
        throw new Error('缺少必要的交易参数 (to, value)')
      }
      
      console.log('✅ 解析交易参数成功:', { to, value, data })
      
      // 创建交易对象 - 修复parseEther的使用
      let transaction
      try {
        console.log('🔧 开始创建交易对象...')
        console.log('💰 原始value:', value)
        console.log('📊 value类型:', typeof value)
        
        // 确保value是字符串格式，并使用parseEther转换为wei
        const valueStr = String(value)
        console.log('📝 转换后的value字符串:', valueStr)
        
        console.log('⚡ 准备调用ethers.parseEther...')
        const valueInWei = ethers.parseEther(valueStr)
        console.log('💎 转换后的value (wei):', valueInWei.toString())
        
        const fromAddress = wallet.address || walletInfo.address
        console.log('👤 使用的from地址:', fromAddress)
        
        console.log('🎯 准备创建交易对象...')
        transaction = {
          to: to,
          value: valueInWei,
          data: data,
          from: fromAddress
        }
        
        console.log('🎉 创建的交易对象:', transaction)
      } catch (parseError) {
        console.error('💥 创建交易对象失败:', parseError)
        console.error('📄 parseError详细信息:', {
          message: parseError.message,
          stack: parseError.stack,
          name: parseError.name
        })
        throw new Error(`创建交易对象失败: ${parseError.message}`)
      }
      
      console.log('✨ 交易对象创建成功:', transaction)
      
      // 添加gas参数
      if (gasLimit) {
        console.log('添加gasLimit:', gasLimit)
        transaction.gasLimit = gasLimit
      }
      if (gasPrice) {
        console.log('添加gasPrice:', gasPrice)
        transaction.gasPrice = gasPrice
      }
      if (maxFeePerGas) {
        console.log('添加maxFeePerGas:', maxFeePerGas)
        transaction.maxFeePerGas = maxFeePerGas
      }
      if (maxPriorityFeePerGas) {
        console.log('添加maxPriorityFeePerGas:', maxPriorityFeePerGas)
        transaction.maxPriorityFeePerGas = maxPriorityFeePerGas
      }
      
      console.log('最终交易对象:', transaction)
      
      // 发送交易
      let txResponse
      try {
        if (wallet.sendTransaction) {
          // 如果钱包对象有sendTransaction方法，直接使用
          console.log('使用wallet.sendTransaction方法发送交易...')
          txResponse = await wallet.sendTransaction(transaction)
        } else if (wallet.sendTransactionAsync) {
          // 如果钱包对象有其他交易方法，使用它
          console.log('使用wallet.sendTransactionAsync方法发送交易...')
          txResponse = await wallet.sendTransactionAsync(transaction)
        } else {
          // 如果以上方法都不可用，尝试使用嵌入式钱包的交易功能
          console.log('尝试使用嵌入式钱包的交易功能...')
          if (walletInfo.type === 'embedded') {
            // 对于嵌入式钱包，使用ethers.js进行交易
            console.log('使用嵌入式钱包的ethers交易功能...')
            
            try {
              // 获取provider - 明确使用Sepolia网络的JsonRpcProvider
              console.log('使用Sepolia网络RPC创建JsonRpcProvider')
              provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
              
              // 验证provider连接
              const network = await provider.getNetwork()
              console.log('Provider网络信息:', network)
              console.log('Chain ID:', network.chainId.toString())
              
              console.log('Provider创建成功:', provider)
              
              // 创建signer - 对于嵌入式钱包，使用默认的signer（索引0）
              const signerAddress = wallet.address || walletInfo.address
              console.log('尝试获取signer，地址:', signerAddress)
              
              // 对于BrowserProvider，getSigner()不需要参数或需要索引
              let signer
              try {
                if (window.ethereum) {
                  // BrowserProvider - 尝试获取第一个账户
                  signer = await provider.getSigner(0)
                  console.log('使用索引0获取到signer:', signer)
                } else {
                  // JsonRpcProvider - 尝试使用地址获取
                  signer = await provider.getSigner(signerAddress)
                  console.log('使用地址获取到signer:', signer)
                }
              } catch (signerError) {
                console.error('获取signer失败，尝试默认方式:', signerError)
                // 如果特定方式失败，尝试默认方式
                signer = await provider.getSigner()
                console.log('使用默认方式获取到signer:', signer)
              }
              
              // 验证signer地址是否匹配
              const signerAddressCheck = await signer.getAddress()
              console.log('Signer地址验证:', signerAddressCheck)
              
              // 发送交易
              console.log('使用signer发送交易...')
              txResponse = await signer.sendTransaction(transaction)
              console.log('交易发送成功:', txResponse)
              
            } catch (providerError) {
              console.error('使用provider发送交易失败:', providerError)
              console.error('Provider错误详情:', providerError.message)
              throw new Error(`Provider交易失败: ${providerError.message}`)
            }
            
          } else {
            throw new Error('钱包不支持交易功能，请确保钱包已正确连接并支持交易操作')
          }
        }
      } catch (txError) {
        console.error('交易发送方法失败:', txError)
        console.error('错误详情:', txError.message)
        
        // 如果主要交易方法失败，尝试备用方法
        console.log('尝试备用交易方法...')
        try {
          if (walletInfo.type === 'embedded') {
            // 对于嵌入式钱包，尝试使用provider进行交易
            console.log('备用方法：使用嵌入式钱包的ethers交易功能...')
            
            try {
              // 获取provider - 明确使用Sepolia网络的JsonRpcProvider
              console.log('备用方法：使用Sepolia网络RPC创建JsonRpcProvider')
              provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
              
              // 验证provider连接
              const network = await provider.getNetwork()
              console.log('备用方法Provider网络信息:', network)
              console.log('备用方法Chain ID:', network.chainId.toString())
              
              console.log('备用方法Provider创建成功:', provider)
              
              // 创建signer - 对于Sepolia网络，使用地址获取signer
              const signerAddress = wallet.address || walletInfo.address
              console.log('尝试获取signer，地址:', signerAddress)
              
              // 对于JsonRpcProvider，直接使用地址创建signer
              const signer = new ethers.Wallet(signerAddress, provider)
              console.log('使用地址创建signer:', signer)
              console.log('备用方法获取到signer:', signer)
              
              // 发送交易
              console.log('备用方法使用signer发送交易...')
              txResponse = await signer.sendTransaction(transaction)
              console.log('备用方法交易发送成功:', txResponse)
              
            } catch (backupProviderError) {
              console.error('备用方法使用provider发送交易失败:', backupProviderError)
              console.error('备用方法Provider错误详情:', backupProviderError.message)
              throw new Error(`备用Provider交易失败: ${backupProviderError.message}`)
            }
            
          } else {
            throw txError
          }
        } catch (backupError) {
          console.error('备用交易方法也失败:', backupError)
          console.error('备用方法错误详情:', backupError.message)
          throw new Error(`交易发送失败: ${txError.message || '未知错误'}`)
        }
      }
      
      console.log('✅ 交易发送成功:', txResponse)
      console.log('交易哈希:', txResponse.hash)
      
      // 等待交易确认（可选）
      if (transactionData.waitForConfirmation) {
        console.log('等待交易确认...')
        const receipt = await txResponse.wait()
        console.log('交易已确认:', receipt)
        
        setTransactionResult({
          success: true,
          hash: txResponse.hash,
          receipt: receipt,
          status: 'confirmed'
        })
      } else {
        setTransactionResult({
          success: true,
          hash: txResponse.hash,
          status: 'pending'
        })
      }
      
      // 通知父窗口交易成功
      window.parent.postMessage({
        type: 'TRANSACTION_SUCCESS',
        result: {
          hash: txResponse.hash,
          from: activeWallet?.address || wallet.address || walletInfo.address,
          to: to,
          value: value.toString()
        }
      }, '*')
      
    } catch (error) {
      console.error('💥 交易发送失败:', error)
      setTransactionResult({
        success: false,
        error: error.message || '交易发送失败'
      })
      
      // 通知父窗口交易失败
      window.parent.postMessage({
        type: 'TRANSACTION_ERROR',
        error: error.message || '交易发送失败'
      }, '*')
    } finally {
      setIsSendingTransaction(false)
    }
  }

  // 在组件加载且未认证时自动触发登录
  useEffect(() => {
    if (privyReady && !authenticated && !user) {
      console.log('自动触发Privy登录界面...')
      login()
    }
  }, [privyReady, authenticated, user])

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
              <div className="user-info-section">
                <div className="privy-user-info">
                  <h3>👤 用户信息</h3>
                  <div className="user-info-grid">
                    <div className="info-item">
                      <span className="info-label">用户ID:</span>
                      <span className="info-value">{user.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">邮箱:</span>
                      <span className="info-value">{user.email?.address || '未设置'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">姓名:</span>
                      <span className="info-value">{user.google?.name || user.email?.address?.split('@')[0] || '用户'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">钱包状态:</span>
                      <span className={`info-value status-${walletsReady ? 'ready' : 'loading'}`}>
                        {walletsReady ? '✅ 已加载' : '⏳ 加载中...'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">钱包数量:</span>
                      <span className="info-value">{wallets?.length || 0} 个</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">激活钱包:</span>
                      <span className="info-value wallet-address">
                        {activeWallet?.address ? `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}` : '未选择'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">钱包类型:</span>
                      <span className={`info-value wallet-type-${activeWallet?.type}`}>
                        {activeWallet?.type === 'embedded' ? '🏠 嵌入式钱包' : '🔗 外部钱包'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 钱包卡片展示区域 */}
              {walletsReady && allWallets.length > 0 && (
                <div className="wallets-cards-section">
                  <div className="section-header">
                    <h4>💼 我的钱包</h4>
                    <span className="wallet-count">共 {allWallets.length} 个钱包</span>
                  </div>
                  
                  <div className="wallets-grid">
                    {allWallets.map((wallet, index) => (
                      <div 
                        key={index} 
                        className={`wallet-card ${activeWallet?.address === wallet.address ? 'active' : ''}`}
                        onClick={() => handleActivateWallet(wallet)}
                      >
                        <div className="wallet-card-header">
                          <div className="wallet-type-badge">
                            {wallet.type === 'embedded' ? '🏠' : '🔗'}
                          </div>
                          <div className="wallet-status">
                            {activeWallet?.address === wallet.address ? (
                              <span className="active-indicator">✅ 已激活</span>
                            ) : (
                              <span className="inactive-indicator">⚪ 未激活</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="wallet-card-body">
                          <div className="wallet-name">
                            <h5>{wallet.name}</h5>
                          </div>
                          
                          <div className="wallet-address">
                            <span className="address-label">地址</span>
                            <div className="address-container">
                              <span className="address-text">
                                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                              </span>
                              <button 
                                className="copy-button" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigator.clipboard.writeText(wallet.address)
                                    .then(() => alert('地址已复制到剪贴板'))
                                    .catch(() => alert('复制失败'))
                                }}
                                title="复制地址"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                          
                          <div className="wallet-details">
                            <div className="detail-item">
                              <span className="detail-label">链类型:</span>
                              <span className="detail-value chain-badge">{wallet.chain}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">钱包类型:</span>
                              <span className={`detail-value type-badge ${wallet.type}`}>
                                {wallet.type === 'embedded' ? '嵌入式' : '外部'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">余额:</span>
                              <span className="detail-value balance">
                                {wallet.balance ? `${wallet.balance} ETH` : '⏳ 加载中...'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="wallet-card-footer">
                          <button 
                            className={`action-btn ${activeWallet?.address === wallet.address ? 'deactivate' : 'activate'}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActivateWallet(wallet)
                            }}
                          >
                            {activeWallet?.address === wallet.address ? '🔒 取消激活' : '✅ 激活钱包'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 钱包操作区域 */}
              <div className="wallet-operations-section">
                <h4>🛠️ 钱包操作</h4>
                
                <div className="operation-buttons">
                  {/* 外部钱包连接按钮 */}
                  <button 
                    className="operation-btn external-wallet-btn"
                    onClick={() => handleConnectExternalWallet('metamask')}
                    disabled={isConnectingExternal}
                  >
                    {isConnectingExternal ? '⏳ 连接中...' : '🔗 连接外部钱包'}
                  </button>
                  
                  {/* 创建钱包按钮 */}
                  {!walletInfo?.address && (
                    <button 
                      className="operation-btn create-wallet-btn"
                      onClick={handleCreateWallet}
                      disabled={isCreatingWallet}
                    >
                      {isCreatingWallet ? '⏳ 创建中...' : '💳 创建钱包'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* 签名和转账功能 - 只有在有钱包地址时显示 */}
              {activeWallet?.address && (
                <div className="wallet-actions-section">
                  <div className="section-header">
                    <h4>💼 钱包操作</h4>
                    <span className="active-wallet-info">当前使用: {activeWallet.name}</span>
                  </div>
                  
                  <div className="actions-grid">
                    {/* 签名功能 */}
                    <div className="action-card">
                      <div className="action-header">
                        <h5>📝 签名消息</h5>
                        <span className="action-description">对消息进行数字签名</span>
                      </div>
                      <button 
                        className="action-btn sign-btn"
                        onClick={() => handleSignMessage('Hello, Privy!')}
                        disabled={isSigning}
                      >
                        {isSigning ? '⏳ 签名中...' : '📝 签名消息'}
                      </button>
                      
                      {signResult && (
                        <div className={`result-display ${signResult.success ? 'success' : 'error'}`}>
                          {signResult.success ? (
                            <div className="result-content">
                              <div className="result-header">
                                <span className="result-icon">✅</span>
                                <span className="result-title">签名成功!</span>
                              </div>
                              <div className="result-details">
                                <p><strong>签名:</strong> {signResult.signature?.slice(0, 20)}...</p>
                                <p><strong>消息:</strong> {signResult.message}</p>
                                <p><strong>钱包:</strong> {activeWallet?.address ? `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}` : '未知'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="result-content">
                              <div className="result-header">
                                <span className="result-icon">❌</span>
                                <span className="result-title">签名失败</span>
                              </div>
                              <p className="error-message">{signResult.error}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 转账功能 */}
                    <div className="action-card">
                      <div className="action-header">
                        <h5>💸 发送交易</h5>
                        <span className="action-description">发送测试交易</span>
                      </div>
                      <button 
                        className="action-btn transaction-btn"
                        onClick={() => handleSendTransaction({
                          to: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
                          value: '0.001',
                          waitForConfirmation: false
                        })}
                        disabled={isSendingTransaction}
                      >
                        {isSendingTransaction ? '⏳ 发送中...' : '💸 发送测试交易'}
                      </button>
                      
                      {transactionResult && (
                        <div className={`result-display ${transactionResult.success ? 'success' : 'error'}`}>
                          {transactionResult.success ? (
                            <div className="result-content">
                              <div className="result-header">
                                <span className="result-icon">✅</span>
                                <span className="result-title">交易发送成功!</span>
                              </div>
                              <div className="result-details">
                                <p><strong>交易哈希:</strong> {transactionResult.hash?.slice(0, 20)}...</p>
                                <p><strong>状态:</strong> {transactionResult.status}</p>
                                <p><strong>发送钱包:</strong> {activeWallet?.address ? `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}` : '未知'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="result-content">
                              <div className="result-header">
                                <span className="result-icon">❌</span>
                                <span className="result-title">交易发送失败</span>
                              </div>
                              <p className="error-message">{transactionResult.error}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="logout-section">
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  🚪 断开连接
                </button>
              </div>
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
import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

const TransactionSender = ({ 
  activeWallet, 
  walletInfo, 
  wallets, 
  externalWallets, 
  user, 
  createWallet,
  switchToSepolia
}) => {
  // 获取Privy SDK功能
  const { sendTransaction } = usePrivy()
  // 交易表单状态
  const [transactionForm, setTransactionForm] = useState({
    recipient: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    amount: '0.001'
  })
  const [showTransactionPreview, setShowTransactionPreview] = useState(false)
  const [transactionResult, setTransactionResult] = useState(null)
  const [isSendingTransaction, setIsSendingTransaction] = useState(false)

  // 交易表单处理函数
  const handleTransactionFormChange = (field, value) => {
    setTransactionForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateAddress = (address) => {
    // 基本的以太坊地址验证
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleTransactionSubmit = () => {
    const { recipient, amount } = transactionForm
    
    // 验证地址格式
    if (!validateAddress(recipient)) {
      setTransactionResult({
        success: false,
        error: '接收方地址格式不正确，请输入有效的以太坊地址'
      })
      return
    }
    
    // 验证金额
    if (!amount || parseFloat(amount) <= 0) {
      setTransactionResult({
        success: false,
        error: '交易金额必须大于0'
      })
      return
    }
    
    // 显示交易预览
    setShowTransactionPreview(true)
  }

  const confirmTransaction = () => {
    setShowTransactionPreview(false)
    handleSendTransaction({
      to: transactionForm.recipient,
      value: transactionForm.amount,
      waitForConfirmation: false
    })
  }

  const cancelTransaction = () => {
    setShowTransactionPreview(false)
  }

  // 将ETH转换为wei的函数（替代ethers.parseEther）
  const ethToWei = (ethAmount) => {
    // 1 ETH = 10^18 wei
    const weiPerEth = BigInt('1000000000000000000')
    const ethAmountStr = ethAmount.toString()
    
    // 处理小数点
    const parts = ethAmountStr.split('.')
    const wholePart = parts[0] || '0'
    const decimalPart = parts[1] || ''
    
    // 确保小数部分有18位
    const paddedDecimal = decimalPart.padEnd(18, '0').slice(0, 18)
    
    // 组合成完整的wei值
    const totalWeiStr = wholePart + paddedDecimal
    return BigInt(totalWeiStr)
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
      if (!walletToUse && wallets?.length > 0) {
        walletToUse = wallets[0]
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
              // 这里需要实现实际的签名逻辑
              // 对于嵌入式钱包，我们可以尝试使用provider和signer
              if (walletToUse.type === 'embedded') {
                try {
                  const provider = wallet.getEthereumProvider ? await wallet.getEthereumProvider() : null
                  if (provider) {
                    const signer = await provider.getSigner(walletAccount.address)
                    return await signer.sendTransaction(tx)
                  } else {
                    throw new Error('无法获取provider')
                  }
                } catch (error) {
                  console.error('使用provider签名失败:', error)
                  // 如果provider方法失败，尝试创建新钱包
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
        
        // 确保value是字符串格式，并使用手动函数转换为wei
        const valueStr = String(value)
        console.log('📝 转换后的value字符串:', valueStr)
        
        console.log('⚡ 准备调用ethToWei函数...')
        const valueInWei = ethToWei(valueStr)
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
        // 优先使用usePrivy的sendTransaction方法（推荐方式）
        if (sendTransaction) {
          console.log('使用usePrivy的sendTransaction方法发送交易...')
          
          // 构建符合Privy SDK标准的交易参数
          const privyTransaction = {
            to: transaction.to,
            value: transaction.value.toString(), // 确保值为字符串格式
            address: transaction.from,
            chain: 'sepolia',               // 显式声明测试网,
            // 可选参数
            gasLimit: transaction.gasLimit,
            gasPrice: transaction.gasPrice,
            maxFeePerGas: transaction.maxFeePerGas,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
            nonce: transaction.nonce
          }
          
          console.log('Privy SDK交易参数:', privyTransaction)
          
          // 使用usePrivy的sendTransaction方法
          txResponse = await sendTransaction({
            to: transaction.to,
            value: transaction.value, // 确保值为字符串格式
          },
          {
            address: transaction.from,
          })
          console.log('usePrivy sendTransaction成功:', txResponse)
          
        }  else {
          // 如果Privy SDK方法不可用，尝试重新创建钱包
          console.log('Privy SDK方法不可用，尝试重新创建钱包...')
          
          try {
            const newWallet = await createWallet()
            
            if (newWallet && newWallet.sendTransaction) {
              console.log('使用新创建的钱包发送交易...')
              const privyTransaction = {
                to: transaction.to,
                value: transaction.value.toString(),
                data: transaction.data || '0x',
                chain: newWallet.chain || 'ethereum'
              }
              txResponse = await newWallet.sendTransaction(privyTransaction)
            } else {
              throw new Error('新创建的钱包不支持交易功能')
            }
          } catch (backupError) {
            console.error('重新创建钱包也失败:', backupError)
            throw new Error(`交易发送失败: ${txError.message || '未知错误'}`)
          }
        }
      } catch (txError) {
        console.error('主交易方法失败:', txError)
        console.error('错误详情:', txError.message)
        
        // 如果主方法失败，尝试重新创建钱包作为备用方案
        try {
          console.log('尝试重新创建钱包...')
          const newWallet = await createWallet()
          
          if (newWallet && newWallet.sendTransaction) {
            console.log('使用新创建的钱包发送交易...')
            const privyTransaction = {
              to: transaction.to,
              value: transaction.value.toString(),
              data: transaction.data || '0x',
              chain: newWallet.chain || 'ethereum'
            }
            txResponse = await newWallet.sendTransaction(privyTransaction)
          } else {
            throw new Error('新创建的钱包不支持交易功能')
          }
        } catch (backupError) {
          console.error('备用交易方法也失败:', backupError)
          throw new Error(`交易发送失败: ${txError.message || '未知错误'}`)
        }
      }
      
      console.log('✅ 交易发送成功:', txResponse)
      console.log('交易哈希:', txResponse.hash)

      setTransactionResult({
        success: true,
        hash: txResponse.hash,
        from: activeWallet?.address || wallet.address || walletInfo.address,
        to: transaction.to,
        value: transaction.value.toString()
      })
    
      
    } catch (error) {
      console.error('💥 交易发送失败:', error)
      setTransactionResult({
        success: false,
        error: error.message || '交易发送失败'
      })
      
      // 通知父窗口交易失败
      if (onTransactionResult) {
        onTransactionResult({
          success: false,
          error: error.message || '交易发送失败'
        })
      }
    } finally {
      setIsSendingTransaction(false)
    }
  }

  return (
    <div className="transaction-sender">
      {/* 转账功能 */}
      <div className="action-card">
        <div className="action-header">
          <h5>💸 发送交易</h5>
          <span className="action-description">发送测试交易</span>
        </div>
        
        {/* 交易输入表单 */}
        <div className="transaction-form">
          <div className="form-group">
            <label htmlFor="recipient-address">接收方地址:</label>
            <input
              id="recipient-address"
              type="text"
              className="form-input"
              placeholder="输入接收方以太坊地址 (0x...)"
              value={transactionForm.recipient}
              onChange={(e) => handleTransactionFormChange('recipient', e.target.value)}
              disabled={isSendingTransaction}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="transaction-amount">转账金额 (ETH):</label>
            <input
              id="transaction-amount"
              type="number"
              className="form-input"
              placeholder="输入转账金额"
              value={transactionForm.amount}
              onChange={(e) => handleTransactionFormChange('amount', e.target.value)}
              disabled={isSendingTransaction}
              step="0.001"
              min="0.001"
            />
          </div>
          
          <button 
            className="action-btn transaction-btn"
            onClick={handleTransactionSubmit}
            disabled={isSendingTransaction}
          >
            {isSendingTransaction ? '⏳ 发送中...' : '💸 发送交易'}
          </button>
        </div>
        
        {transactionResult && (
          <div className={`result-display ${transactionResult.success ? 'success' : 'error'}`}>
            {transactionResult.success ? (
              <div className="result-content">
                <div className="result-header">
                  <span className="result-icon">✅</span>
                  <span className="result-title">交易发送成功!</span>
                </div>
                <div className="result-details">
                  <p><strong>接收方地址:</strong> <span className="address-highlight">{transactionForm.recipient}</span></p>
                  <p><strong>转账金额:</strong> <span className="amount-highlight">{transactionForm.amount} ETH</span></p>
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
      
      {/* 交易预览模态框 */}
      {showTransactionPreview && (
        <div className="transaction-preview-modal">
          <div className="modal-overlay" onClick={cancelTransaction}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🔍 交易确认</h3>
                <button className="close-btn" onClick={cancelTransaction}>✕</button>
              </div>
              
              <div className="modal-body">
                <div className="transaction-details">
                  <div className="detail-section">
                    <h4>📤 发送方信息</h4>
                    <div className="detail-item">
                      <span className="detail-label">发送钱包:</span>
                      <span className="detail-value">{activeWallet?.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">发送地址:</span>
                      <span className="detail-value address">{activeWallet?.address}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>📥 接收方信息</h4>
                    <div className="detail-item">
                      <span className="detail-label">接收地址:</span>
                      <span className="detail-value address">{transactionForm.recipient}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>💰 交易详情</h4>
                    <div className="detail-item">
                      <span className="detail-label">转账金额:</span>
                      <span className="detail-value amount">{transactionForm.amount} ETH</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">网络:</span>
                      <span className="detail-value network">Sepolia 测试网</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="modal-btn cancel" onClick={cancelTransaction}>
                  取消
                </button>
                <button className="modal-btn confirm" onClick={confirmTransaction}>
                  确认发送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionSender
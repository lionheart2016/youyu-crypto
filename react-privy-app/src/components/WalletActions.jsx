import React from 'react'
import TransactionSender from './TransactionSender'
import TokenSwapCard from './TokenSwapCard'

/**
 * 钱包操作区域组件
 * 包含签名消息和发送交易的功能
 */
function WalletActions({ 
  activeWallet, 
  walletInfo, 
  wallets, 
  externalWallets, 
  user, 
  createWallet, 
  switchToSepolia, 
  isSigning, 
  signResult, 
  onSignMessage 
}) {
  if (!activeWallet?.address) {
    return null
  }

  return (
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
            onClick={onSignMessage}
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
        
        {/* 转账功能 - 由TransactionSender组件管理所有交易相关状态 */}
        <TransactionSender 
          activeWallet={activeWallet}
          user={user}
          createWallet={createWallet}
          switchToSepolia={switchToSepolia}
        />

        {/* 代币交换功能 - 只有在有钱包地址时显示 */}
        {activeWallet?.address && (
          <TokenSwapCard 
            walletAddress={activeWallet.address}
            network="sepolia"
          />
        )}
        
      </div>
    </div>
  )
}

export default WalletActions
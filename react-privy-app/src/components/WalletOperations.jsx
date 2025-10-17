import React from 'react'

/**
 * 钱包操作组件
 * 提供连接外部钱包和创建钱包的功能按钮
 */
const WalletOperations = ({ 
  onConnectExternalWallet, 
  onCreateWallet, 
  isConnectingExternal, 
  isCreatingWallet,
  hasEmbeddedWallet 
}) => {
  return (
    <div className="wallet-operations-section">
      <h4>🛠️ 钱包操作</h4>
      
      <div className="operation-buttons">
        {/* 外部钱包连接按钮 */}
        <button 
          className="operation-btn external-wallet-btn"
          onClick={() => onConnectExternalWallet('metamask')}
          disabled={isConnectingExternal}
        >
          {isConnectingExternal ? '⏳ 连接中...' : '🔗 连接外部钱包'}
        </button>
        
        {/* 创建钱包按钮 */}
        {!hasEmbeddedWallet && (
          <button 
            className="operation-btn create-wallet-btn"
            onClick={onCreateWallet}
            disabled={isCreatingWallet}
          >
            {isCreatingWallet ? '⏳ 创建中...' : '💳 创建钱包'}
          </button>
        )}
      </div>
    </div>
  )
}

export default WalletOperations
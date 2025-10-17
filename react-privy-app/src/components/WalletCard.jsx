import React from 'react'

/**
 * 钱包卡片组件
 * 显示单个钱包的详细信息和操作按钮
 */
const WalletCard = ({ wallet, isActive, onActivate, onCopyAddress }) => {
  const handleCopyAddress = (e) => {
    e.stopPropagation()
    onCopyAddress(wallet.address)
  }

  const handleActivate = (e) => {
    e.stopPropagation()
    onActivate(wallet)
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletTypeText = (type) => {
    return type === 'embedded' ? '嵌入式' : '外部'
  }

  return (
    <div 
      className={`wallet-card ${isActive ? 'active' : ''}`}
      onClick={() => onActivate(wallet)}
    >
      <div className="wallet-card-header">
        <div className="wallet-type-badge">
          {wallet.type === 'embedded' ? '🏠' : '🔗'}
        </div>
        <div className="wallet-status">
          {isActive ? (
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
              {formatAddress(wallet.address)}
            </span>
            <button 
              className="copy-button" 
              onClick={handleCopyAddress}
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
              {getWalletTypeText(wallet.type)}
            </span>
          </div>
          <div className="wallet-balance">
            {wallet.balance || '⏳ 加载中...'}
          </div>
        </div>
      </div>
      
      <div className="wallet-card-footer">
        <button 
          className={`action-btn ${isActive ? 'deactivate' : 'activate'}`}
          onClick={handleActivate}
        >
          {isActive ? '🔒 取消激活' : '✅ 激活钱包'}
        </button>
      </div>
    </div>
  )
}

export default WalletCard
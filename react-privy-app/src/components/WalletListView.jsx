import React from 'react'
import './WalletListView.css'

/**
 * 钱包列表视图组件
 * 以列表形式展示所有钱包，支持点击激活对应钱包
 */
const WalletListView = ({ wallets, activeWallet, onActivateWallet, onCopyAddress }) => {
  if (!wallets || wallets.length === 0) {
    return (
      <div className="wallet-list-view">
        <div className="wallet-list-header">
          <h3>💼 我的钱包</h3>
          <span className="wallet-count">暂无钱包</span>
        </div>
        <div className="empty-state">
          <p>📭 您还没有任何钱包</p>
          <small>请先创建或连接钱包</small>
        </div>
      </div>
    )
  }

  const handleCopyAddress = (address, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
      .then(() => alert('地址已复制到剪贴板'))
      .catch(() => alert('复制失败'))
  }

  const getWalletIcon = (walletType) => {
    switch (walletType) {
      case 'embedded':
      case 'privy':
        return '💳' // 嵌入式钱包图标
      case 'metamask':
        return '🦊' // MetaMask图标
      case 'coinbase-wallet':
        return '💰' // Coinbase钱包图标
      case 'walletconnect':
        return '🔗' // WalletConnect图标
      default:
        return '👛' // 默认钱包图标
    }
  }

  const getWalletTypeText = (walletType) => {
    switch (walletType) {
      case 'embedded':
      case 'privy':
        return '嵌入式钱包'
      case 'metamask':
        return 'MetaMask'
      case 'coinbase-wallet':
        return 'Coinbase钱包'
      case 'walletconnect':
        return 'WalletConnect'
      default:
        return '外部钱包'
    }
  }

  const formatAddress = (address) => {
    if (!address) return '未知地址'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="wallet-list-view">
      <div className="wallet-list-header">
        <h3>💼 我的钱包</h3>
        <span className="wallet-count">共 {wallets.length} 个钱包</span>
      </div>
      
      <div className="wallet-list">
        {wallets.map((wallet, index) => (
          <div 
            key={index}
            className={`wallet-item ${activeWallet?.address === wallet.address ? 'active' : ''}`}
            onClick={() => onActivateWallet(wallet)}
          >
            <div className="wallet-info">
              <div className="wallet-icon">
                {getWalletIcon(wallet.walletType || wallet.type)}
              </div>
              
              <div className="wallet-details">
                <div className="wallet-name">
                  {wallet.name || getWalletTypeText(wallet.walletType || wallet.type)}
                  {activeWallet?.address === wallet.address && (
                    <span className="active-badge">✅ 当前使用</span>
                  )}
                </div>
                
                <div className="wallet-address">
                  {formatAddress(wallet.address)}
                  <button 
                    className="copy-btn"
                    onClick={(e) => handleCopyAddress(wallet.address, e)}
                    title="复制地址"
                  >
                    📋
                  </button>
                </div>
                
                <div className="wallet-meta">
                  <span className="wallet-type">
                    {getWalletTypeText(wallet.walletType || wallet.type)}
                  </span>
                  <span className="wallet-chain">
                    {wallet.chain || '以太坊'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="wallet-actions">
              {activeWallet?.address === wallet.address ? (
                <span className="active-indicator">✅ 已激活</span>
              ) : (
                <button 
                  className="activate-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onActivateWallet(wallet)
                  }}
                >
                  激活钱包
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="wallet-list-footer">
        <p className="help-text">
          💡 点击钱包项或"激活钱包"按钮来切换当前使用的钱包
        </p>
      </div>
    </div>
  )
}

export default WalletListView
import React from 'react'

/**
 * 用户信息组件
 * 显示用户的基本信息和钱包状态
 */
const UserInfo = ({ user, walletsReady, wallets, activeWallet }) => {
  if (!user) return null

  const formatAddress = (address) => {
    if (!address) return '未选择'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletTypeText = (type) => {
    return type === 'embedded' ? '🏠 嵌入式钱包' : '🔗 外部钱包'
  }

  const getUserName = () => {
    return user.google?.name || user.email?.address?.split('@')[0] || '用户'
  }

  return (
    <div className="user-info-section">
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
          <span className="info-value">{getUserName()}</span>
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
            {formatAddress(activeWallet?.address)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">钱包类型:</span>
          <span className={`info-value wallet-type-${activeWallet?.type}`}>
            {activeWallet?.type ? getWalletTypeText(activeWallet.type) : '未选择'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default UserInfo
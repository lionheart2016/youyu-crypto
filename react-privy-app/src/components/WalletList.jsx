import React from 'react'
import WalletCard from './WalletCard'

/**
 * 钱包列表组件
 * 显示用户所有钱包的卡片列表
 */
const WalletList = ({ wallets, activeWallet, onActivateWallet, onCopyAddress }) => {
  if (!wallets || wallets.length === 0) {
    return null
  }

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address)
      .then(() => alert('地址已复制到剪贴板'))
      .catch(() => alert('复制失败'))
  }

  return (
    <div className="wallets-cards-section">
      <div className="section-header">
        <h4>💼 我的钱包</h4>
        <span className="wallet-count">共 {wallets.length} 个钱包</span>
      </div>
      
      <div className="wallets-grid">
        {wallets.map((wallet, index) => (
          <WalletCard
            key={index}
            wallet={{
              ...wallet,
              balance: '0.00' // 默认余额为0.00，不再从后端获取
            }}
            isActive={activeWallet?.address === wallet.address}
            onActivate={onActivateWallet}
            onCopyAddress={onCopyAddress || handleCopyAddress}
          />
        ))}
      </div>
    </div>
  )
}

export default WalletList
import React from 'react';
import './TokenList.css';

// 格式化地址显示，只显示开头和结尾
const formatAddress = (address) => {
  if (!address || typeof address !== 'string') return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Token图标组件，处理自定义图标和默认图标
const TokenIcon = ({ token }) => {
  // 如果有自定义图标，可以在这里添加逻辑
  // 目前使用默认的代币图标样式
  return (
    <div 
      className="token-icon-container"
      style={{
        backgroundColor: token.iconColor || '#2d3748',
        borderColor: token.iconBorderColor || '#4a5568'
      }}
    >
      {token.iconSymbol ? (
        <span className="token-icon-text">{token.iconSymbol}</span>
      ) : (
        <span className="default-token-icon">{token.symbol?.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};

// Token列表项组件
const TokenItem = ({ token }) => {
  return (
    <div className="token-item">
      <TokenIcon token={token} />
      <div className="token-info">
        <div className="token-header">
          <span className="token-symbol">{token.symbol}</span>
        </div>
        <div className="token-details">
          <span className="token-name">{token.name}</span>
          {token.address && (
            <span className="token-address">{formatAddress(token.address)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// 主TokenList组件
const TokenList = ({ tokens, onTokenSelect }) => {
  // 如果没有tokens数据，显示空状态
  if (!tokens || tokens.length === 0) {
    return (
      <div className="token-list empty">
        <div className="empty-state">
          <p>暂无代币数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-list">
      {tokens.map((token, index) => (
        <TokenItem 
          key={token.address || index} 
          token={token} 
        />
      ))}
    </div>
  );
};

export default TokenList;
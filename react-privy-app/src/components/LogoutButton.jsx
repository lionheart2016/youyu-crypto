import React from 'react'

/**
 * 登出按钮组件
 * 提供用户登出功能
 */
const LogoutButton = ({ onLogout }) => {
  return (
    <div className="logout-section">
      <button 
        className="logout-btn"
        onClick={onLogout}
      >
        🚪 断开连接
      </button>
    </div>
  )
}

export default LogoutButton
import React from 'react'
import { usePrivy } from '@privy-io/react-auth'

/**
 * 登出按钮组件
 * 提供用户登出功能
 */
const LogoutButton = () => {
  const { logout } = usePrivy()
  
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }
  
  return (
    <div className="logout-section">
      <button 
        className="logout-btn"
        onClick={handleLogout}
      >
        🚪 断开连接
      </button>
    </div>
  )
}

export default LogoutButton
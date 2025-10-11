// 测试状态同步功能
const testStateSync = () => {
  console.log('=== 状态同步测试开始 ===')
  
  // 模拟用户数据
  const mockUserData = {
    id: 'user_test_123',
    email: 'test@example.com',
    name: '测试用户',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    balance: '1.234'
  }
  
  // 模拟发送认证状态消息
  const mockAuthMessage = {
    type: 'PRIVY_AUTH_STATE',
    authenticated: true,
    user: mockUserData
  }
  
  console.log('模拟认证状态消息:', mockAuthMessage)
  
  // 测试解构的数据
  const testUser = mockUserData
  console.log('用户信息测试:')
  console.log('- 用户ID:', testUser.id)
  console.log('- 用户姓名:', testUser.name)
  console.log('- 用户邮箱:', testUser.email)
  console.log('- 钱包地址:', testUser.walletAddress)
  console.log('- 余额:', testUser.balance)
  
  // 测试模板字符串显示
  console.log('\n模板字符串测试:')
  console.log('用户ID:', testUser?.id || '无')
  console.log('用户姓名:', testUser?.name || '无')
  console.log('用户邮箱:', testUser?.email || '无')
  console.log('钱包地址:', testUser?.walletAddress || '无')
  console.log('余额:', testUser?.balance || '0')
  
  // 测试空数据情况
  console.log('\n空数据测试:')
  const emptyUser = null
  console.log('空用户ID:', emptyUser?.id || '无')
  console.log('空用户姓名:', emptyUser?.name || '无')
  
  console.log('\n=== 状态同步测试完成 ===')
}

testStateSync()
// 测试登录状态同步
console.log('🧪 测试登录状态同步...')

// 模拟从React Privy应用发送的认证状态消息
const testAuthState = {
  type: 'PRIVY_AUTH_STATE',
  authenticated: true,
  user: {
    id: 'test_user_123',
    name: '测试用户',
    email: 'test@example.com',
    type: 'wallet',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    walletBalance: '1.5'
  },
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  walletBalance: '1.5'
}

console.log('模拟认证状态消息:', JSON.stringify(testAuthState, null, 2))

// 解构用户信息
const { user, walletAddress, walletBalance } = testAuthState
console.log('📋 用户信息:')
console.log('- ID:', user.id)
console.log('- 姓名:', user.name)
console.log('- 邮箱:', user.email)
console.log('- 类型:', user.type)
console.log('- 钱包地址:', walletAddress)
console.log('- 钱包余额:', walletBalance, 'ETH')

// 测试空数据情况
const emptyAuthState = {
  type: 'PRIVY_AUTH_STATE',
  authenticated: false,
  user: null,
  walletAddress: null,
  walletBalance: null
}

console.log('\n🧪 测试空数据情况:')
console.log('空认证状态消息:', JSON.stringify(emptyAuthState, null, 2))

const { user: emptyUser, walletAddress: emptyWallet, walletBalance: emptyBalance } = emptyAuthState
console.log('空用户信息:', emptyUser)
console.log('空钱包地址:', emptyWallet)
console.log('空钱包余额:', emptyBalance)

console.log('\n✅ 测试完成！')
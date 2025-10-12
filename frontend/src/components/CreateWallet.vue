<template>
  <div class="create-wallet">
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 class="text-xl font-semibold text-white mb-4 flex items-center">
        <svg class="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        创建新钱包
      </h3>
      
      <div class="text-gray-300 mb-6">
        <p class="mb-2">使用Privy创建一个新的嵌入式钱包</p>
        <p class="text-sm text-gray-400">创建的钱包将安全地存储在您的账户中</p>
      </div>
      
      <div class="space-y-4">
        <button 
          @click="createWallet" 
          :disabled="isCreatingWallet"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
        >
          <svg v-if="!isCreatingWallet" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isCreatingWallet ? '创建中...' : '创建新钱包' }}
        </button>
        
        <div v-if="walletAddress" class="bg-green-900 border border-green-700 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-green-400 font-medium">钱包创建成功！</span>
          </div>
          <div class="text-sm text-gray-300">
            <p><strong>地址:</strong> {{ formatAddress(walletAddress) }}</p>
            <p><strong>余额:</strong> {{ walletBalance }} ETH</p>
          </div>
        </div>
        
        <div v-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-red-400">{{ error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePrivy } from '../contexts/PrivyContext.js';

const {
  authenticated,
  walletAddress,
  walletBalance
} = usePrivy();

const isCreatingWallet = ref(false);
const error = ref('');

// 格式化地址显示
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 创建钱包
const createWallet = async () => {
  error.value = '';
  isCreatingWallet.value = true;
  
  console.log('🚀 开始创建钱包流程...');
  
  try {
    // 检查认证状态
    if (!authenticated.value) {
      throw new Error('用户未认证，请先登录');
    }
    
    console.log('✅ 用户已认证，继续创建钱包...');
    
    // 通过iframe通知React应用创建钱包
    const iframe = document.querySelector('iframe[src*="3001"]');
    console.log('🔍 查找React iframe:', iframe ? '找到' : '未找到');
    
    if (iframe && iframe.contentWindow) {
      console.log('📤 发送CREATE_WALLET_REQUEST消息...');
      
      iframe.contentWindow.postMessage({
        type: 'CREATE_WALLET_REQUEST',
        timestamp: Date.now()
      }, 'http://localhost:3001');
      
      console.log('✅ 创建钱包请求已发送，等待响应...');
      
      // 设置超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('创建钱包超时，请重试')), 10000); // 10秒超时
      });
      
      // 等待钱包创建完成的Promise
      const walletCreatedPromise = new Promise((resolve) => {
        const checkWalletCreated = () => {
          if (walletAddress.value) {
            console.log('🎉 检测到钱包地址已更新:', walletAddress.value);
            resolve(true);
          } else {
            // 继续检查
            setTimeout(checkWalletCreated, 500);
          }
        };
        
        // 开始检查
        setTimeout(checkWalletCreated, 1000);
      });
      
      // 等待钱包创建完成或超时
      try {
        await Promise.race([walletCreatedPromise, timeoutPromise]);
        console.log('✅ 钱包创建流程完成');
      } catch (timeoutError) {
        console.error('⏰ 钱包创建超时');
        throw timeoutError;
      }
      
    } else {
      console.error('❌ 无法找到React应用iframe或contentWindow不可用');
      throw new Error('无法找到React应用iframe，请确保React应用已正确加载');
    }
  } catch (err) {
    console.error('💥 创建钱包失败:', err);
    error.value = err.message || '创建钱包失败，请重试';
    
    // 显示更详细的错误信息
    if (err.message.includes('超时')) {
      error.value = '创建钱包超时，请检查网络连接或刷新页面重试';
    } else if (err.message.includes('iframe')) {
      error.value = '无法连接到钱包服务，请确保所有服务都在运行';
    }
  } finally {
    isCreatingWallet.value = false;
    console.log('🏁 创建钱包流程结束');
  }
};
</script>

<style scoped>
.create-wallet {
  max-width: 400px;
  margin: 0 auto;
}
</style>
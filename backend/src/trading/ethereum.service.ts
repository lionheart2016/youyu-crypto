import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract, verifyMessage, isAddress, formatEther, parseEther, formatUnits, parseUnits } from 'ethers';
import { HttpService } from '@nestjs/axios';

interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  status: boolean;
  gasUsed: string;
}

interface TokenBalance {
  token: string;
  balance: string;
  decimals: number;
}

@Injectable()
export class EthereumService {
  private readonly logger = new Logger(EthereumService.name);
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  
  // ERC20代币合约地址
  private readonly tokenAddresses = {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  };

  // ERC20 ABI (简化版)
  private readonly erc20Abi = [
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL') || 
                    'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
      
      const privateKey = this.configService.get<string>('ETHEREUM_PRIVATE_KEY');
      
      this.provider = new JsonRpcProvider(rpcUrl);
      
      if (privateKey) {
        this.wallet = new Wallet(privateKey, this.provider);
        this.logger.log('以太坊钱包已初始化');
      } else {
        this.logger.warn('未配置以太坊私钥，部分功能将受限');
      }
      
      this.logger.log('以太坊服务初始化成功');
    } catch (error) {
      this.logger.error('以太坊服务初始化失败:', error);
    }
  }

  // 获取账户余额
  async getBalance(address: string): Promise<{
    ethBalance: string;
    tokenBalances: TokenBalance[];
  }> {
    try {
      // 获取ETH余额
      const ethBalance = await this.provider.getBalance(address);
      
      // 获取代币余额
      const tokenBalances: TokenBalance[] = [];
      
      for (const [symbol, tokenAddress] of Object.entries(this.tokenAddresses)) {
        try {
          const tokenContract = new Contract(tokenAddress, this.erc20Abi, this.provider);
          const balance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals();
          
          tokenBalances.push({
            token: symbol,
            balance: formatUnits(balance, decimals),
            decimals
          });
        } catch (error) {
          this.logger.warn(`获取 ${symbol} 余额失败:`, error.message);
        }
      }
      
      return {
        ethBalance: formatEther(ethBalance),
        tokenBalances
      };
    } catch (error) {
      this.logger.error('获取余额失败:', error);
      throw new Error('获取余额失败');
    }
  }

  // 验证签名
  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      this.logger.error('验证签名失败:', error);
      return false;
    }
  }

  // 发送ETH交易
  async sendETHTransaction(
    from: string,
    to: string,
    amount: string,
    signature: string
  ): Promise<TransactionReceipt> {
    try {
      // 验证签名
      const message = `发送 ${amount} ETH 到 ${to}`;
      const isValid = await this.verifySignature(message, signature, from);
      
      if (!isValid) {
        throw new Error('签名验证失败');
      }

      if (!this.wallet) {
        throw new Error('未配置服务器钱包，无法执行交易');
      }

      // 构建交易
      const feeData = await this.provider.getFeeData();
      const tx = {
        to,
        value: parseEther(amount),
        gasLimit: 21000,
        gasPrice: feeData.gasPrice
      };

      // 发送交易
      const transaction = await this.wallet.sendTransaction(tx);
      const receipt = await transaction.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      this.logger.error('发送ETH交易失败:', error);
      throw new Error(`交易失败: ${error.message}`);
    }
  }

  // 发送代币交易
  async sendTokenTransaction(
    from: string,
    to: string,
    tokenAddress: string,
    amount: string,
    signature: string
  ): Promise<TransactionReceipt> {
    try {
      // 验证签名
      const message = `发送 ${amount} 代币到 ${to}`;
      const isValid = await this.verifySignature(message, signature, from);
      
      if (!isValid) {
        throw new Error('签名验证失败');
      }

      if (!this.wallet) {
        throw new Error('未配置服务器钱包，无法执行交易');
      }

      const tokenContract = new Contract(tokenAddress, this.erc20Abi, this.wallet);
      
      // 获取代币精度
      const decimals = await tokenContract.decimals();
      const parsedAmount = parseUnits(amount, decimals);

      // 发送代币交易
      const transaction = await tokenContract.transfer(to, parsedAmount);
      const receipt = await transaction.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      this.logger.error('发送代币交易失败:', error);
      throw new Error(`代币交易失败: ${error.message}`);
    }
  }

  // 获取交易状态
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    confirmations?: number;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }
      
      if (receipt.status === 1) {
        const currentBlock = await this.provider.getBlockNumber();
        const confirmations = currentBlock - receipt.blockNumber;
        
        return {
          status: 'confirmed',
          blockNumber: receipt.blockNumber,
          confirmations
        };
      } else {
        return { status: 'failed' };
      }
    } catch (error) {
      this.logger.error('获取交易状态失败:', error);
      throw new Error('获取交易状态失败');
    }
  }

  // 获取Gas价格估算
  async getGasEstimation(to: string, value: string, data?: string): Promise<{
    gasLimit: string;
    gasPrice: string;
    totalCost: string;
  }> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      
      const tx = {
        to,
        value: parseEther(value),
        data: data || '0x'
      };
      
      const gasLimit = await this.provider.estimateGas(tx);
      const totalCost = gasPrice * gasLimit;
      
      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        totalCost: formatEther(totalCost)
      };
    } catch (error) {
      this.logger.error('Gas估算失败:', error);
      throw new Error('Gas估算失败');
    }
  }

  // 获取当前区块号
  async getCurrentBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      this.logger.error('获取区块号失败:', error);
      throw new Error('获取区块号失败');
    }
  }

  // 检查地址有效性
  isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  // 获取代币信息
  async getTokenInfo(tokenAddress: string): Promise<{
    symbol: string;
    name: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      const tokenContract = new Contract(tokenAddress, this.erc20Abi, this.provider);
      
      const [symbol, name, decimals, totalSupply] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);
      
      return {
        symbol,
        name,
        decimals,
        totalSupply: formatUnits(totalSupply, decimals)
      };
    } catch (error) {
      this.logger.error('获取代币信息失败:', error);
      throw new Error('获取代币信息失败');
    }
  }
}
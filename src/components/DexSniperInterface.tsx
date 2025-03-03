"use client";

import { useState } from 'react';
import { 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  Lock, 
  Play, 
  Shield, 
  ShoppingCart, 
  Trash2
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DexSniperInterface() {
  const [tokenAddress, setTokenAddress] = useState('0x0839F36B7353A2A4A13C5C2151e3d79c0a3eB2');
  const [selectedDex, setSelectedDex] = useState('PancakeSwap V2');
  const [logs, setLogs] = useState<string[]>([
    '20:02:13 - All transaction sent, waiting for receipt...',
    '20:02:14 - Settled',
    '20:02:14 - WALLET 1:',
    'Amounts:',
    '- Tokens sent: 1.2500231280001234',
    '- Tokens received: 0.17389023 Cake',
    '- Buyrate: 1.2500231280001234',
    '0x43b27fc1dbdf17b8d7d070c70e0bda5de5ecafd9000554fc5dcc7088e',
    '20:02:14 Force sell 100 sent, waiting for the result...',
    '20:02:45 Wallet 1 - Transaction sent, waiting for outcome...',
    '0x0a3b7d22132c7437500a23f8f6e647f50c6414455f59fe72c17e5ef25fc27237',
    'SETTLED',
    '0x0a3b7d22132c7437500a23f8f6e647f50c6414455f59fe72c17e5ef25fc27237',
    'Rate: 0.0001 WBNB per token'
  ]);

  // Mock data for demonstration
  const dexOptions = [
    'PancakeSwap V2',
    'PancakeSwap V3',
    'UniSwap V2',
    'UniSwap V3',
    'SushiSwap',
    'Arbitrum SushiSwap',
    'Arbitrum Camelot V3',
    'PancakeSwap V3',
    'SpookySwap',
    'Thena TraderJoe V1',
    'TraderJoe V2'
  ];

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleForceBuy = () => {
    addLog(`${new Date().toLocaleTimeString()} - Force buy initiated...`);
    // In a real app, this would trigger the buy transaction
  };

  const handleForceSell = () => {
    addLog(`${new Date().toLocaleTimeString()} - Force sell initiated...`);
    // In a real app, this would trigger the sell transaction
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4 space-y-4">
              {/* Header Section */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Token Addr:</span>
                    <div className="flex-1 flex items-center">
                      <Input 
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        className="h-8 bg-black text-green-400 border-gray-700 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                    Clear log
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pay Coin to trade:</span>
                    <Input 
                      defaultValue="0.001"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">DEX:</span>
                    <select 
                      className="flex-1 h-8 bg-gray-800 text-white rounded-md px-2 border border-gray-700 focus:border-blue-500 text-sm"
                      value={selectedDex}
                      onChange={(e) => setSelectedDex(e.target.value)}
                    >
                      {dexOptions.map((dex) => (
                        <option key={dex} value={dex}>{dex}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">GWEI to trade:</span>
                    <Input 
                      defaultValue="5"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pool:</span>
                    <Input 
                      defaultValue="0x43b27fc1dbdf17b8d7d070c70e0bda5de5ecafd9000554fc5dcc7088e"
                      className="flex-1 h-8 bg-black text-green-400 border-gray-700 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Tip (GWEI):</span>
                    <Input 
                      defaultValue="0.30"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                    <div className="flex items-center">
                      <Checkbox id="autoGwei" className="mr-2 h-4 w-4 rounded border-gray-500" />
                      <label htmlFor="autoGwei" className="text-xs">Auto Gwei</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                      add/try
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Buy slippage %:</span>
                    <Input 
                      defaultValue="99"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Sell slippage %:</span>
                    <Input 
                      defaultValue="99"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Max buy tax %:</span>
                    <Input 
                      defaultValue="10"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Max sell tax %:</span>
                    <Input 
                      defaultValue="10"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">GWEI to approve:</span>
                    <Input 
                      defaultValue="5"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select className="flex-1 h-8 bg-gray-800 text-white rounded-md px-2 border border-gray-700 focus:border-blue-500 text-sm">
                      <option>Approve before snipe</option>
                      <option>No approval</option>
                      <option>Approve after snipe</option>
                    </select>
                    <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                      Force Approve
                    </Button>
                  </div>
                </div>

                <div className="flex items-center">
                  <Checkbox id="retryBuy" className="mr-2 h-4 w-4 rounded border-gray-500" />
                  <label htmlFor="retryBuy" className="text-sm">Retry if BUY tx fails</label>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* PinkSale Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pinkSaleOptions" className="mr-2 h-4 w-4 rounded border-gray-500" />
                  <label htmlFor="pinkSaleOptions" className="text-sm font-medium">PinkSale options:</label>
                  <select className="flex-1 h-8 bg-gray-800 text-white rounded-md px-2 border border-gray-700 focus:border-blue-500 text-sm">
                    <option>Presale</option>
                    <option>Fairlaunch</option>
                    <option>Dutch Auction</option>
                  </select>
                  <Input 
                    defaultValue="0x0839a5d2700886a3f3f2f0f4105a9123"
                    className="flex-1 h-8 bg-black text-green-400 border-gray-700 font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                    AutoFill
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="tokenAmount" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="tokenAmount" className="text-sm">Token amount to buy:</label>
                    <Input 
                      defaultValue="500"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sellOnly" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="sellOnly" className="text-sm">Sell only</label>
                    <span className="text-sm">MethodId</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="limitBuy" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="limitBuy" className="text-sm">Limit buy order ($):</label>
                    <Input 
                      defaultValue="0.5"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="limitSell" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="limitSell" className="text-sm">Limit sell order ($):</label>
                    <Input 
                      defaultValue="0.5"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                    <span className="text-sm">% to sell</span>
                    <select className="w-20 h-8 bg-gray-800 text-white rounded-md px-2 border border-gray-700 focus:border-blue-500 text-sm">
                      <option>100</option>
                      <option>75</option>
                      <option>50</option>
                      <option>25</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="takeProfit" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="takeProfit" className="text-sm">Take Profit (%):</label>
                    <Input 
                      defaultValue="100"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="stopLoss" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="stopLoss" className="text-sm">Stop Loss (%):</label>
                    <Input 
                      defaultValue="20"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="waitSeconds" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="waitSeconds" className="text-sm">Wait X seconds(buy):</label>
                    <Input 
                      defaultValue="0"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="minPool" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="minPool" className="text-sm">Min pool amount:</label>
                    <Input 
                      defaultValue="0.0001"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="buyTax" className="mr-2 h-4 w-4 rounded border-gray-500" />
                    <label htmlFor="buyTax" className="text-sm">Buy the % of supply:</label>
                    <Input 
                      defaultValue="0.00001"
                      className="w-24 h-8 bg-black text-green-400 border-gray-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Execution Methods */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="h-8 bg-blue-900 hover:bg-blue-800 text-white">
                    START
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 bg-red-900 hover:bg-red-800 text-white">
                    STOP
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="mempoolSnipe" defaultChecked className="mr-2 h-4 w-4 rounded border-gray-500" />
                  <label htmlFor="mempoolSnipe" className="text-sm font-medium">Mempool Snipe</label>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <span className="text-sm">Mempool methodId</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="ttsa" className="mr-2 h-4 w-4 rounded border-gray-500" />
                  <label htmlFor="ttsa" className="text-sm font-medium">TTSA (try to save ass)</label>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <span className="text-sm">TTSA methodId</span>
                </div>

                <div className="flex justify-between mt-4">
                  <div className="text-center">
                    <div className="text-sm font-medium mb-2">Force Sell %</div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 bg-red-900 hover:bg-red-800 text-white"
                        onClick={handleForceSell}
                      >
                        Force Sell
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                        100
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                        50
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                        25
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 bg-gray-700 hover:bg-gray-600">
                        10
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 bg-green-700 hover:bg-green-600 text-white px-8"
                    onClick={handleForceBuy}
                  >
                    Force Buy
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Logs and Status */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-green-900 text-white">Buy tax: 0</Badge>
                  <Badge variant="outline" className="bg-red-900 text-white">Sell tax: 0</Badge>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-green-900 text-white">Trade enabled</Badge>
                  <Badge variant="outline" className="bg-blue-900 text-white">Safe!</Badge>
                </div>
              </div>

              <div className="bg-black rounded-md p-3 h-[500px] font-mono text-xs">
                <ScrollArea className="h-full">
                  {logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.includes('Error') ? 'text-red-500' : 
                      log.includes('Success') || log.includes('WALLET') ? 'text-green-400' : 
                      'text-gray-300'
                    }`}>
                      {log}
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pay coin price:</span>
                  <span className="text-green-400">216.34$ WBNB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price snipe coin:</span>
                  <span className="text-green-400">1.25570029003375645 Cake</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pool coin in pool:</span>
                  <span className="text-green-400">90234.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Value of the pool:</span>
                  <span className="text-green-400">19476157 $</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 text-xs">
                <div className="text-center">Wallet</div>
                <div className="text-center">Pay coin</div>
                <div className="text-center">Pay coin($)</div>
                <div className="text-center">Token</div>
                <div className="text-center">Token($)</div>
                <div className="text-center">Approved</div>

                <div className="text-center">0x0a..cef6</div>
                <div className="text-center">0.0326</div>
                <div className="text-center">6.8247</div>
                <div className="text-center">0.51000</div>
                <div className="text-center">0.64731</div>
                <div className="text-center">No</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
        <div>RPC: https://bsc-dataseed3.binance.org</div>
        <div className="flex space-x-4">
          <span>Check Latency</span>
          <span>Max GAS: 700000</span>
        </div>
      </div>
    </div>
  );
}
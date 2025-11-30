```tsx
'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { formatUnits } from 'viem';
import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = '0xYourContractAddressHere';

const abi = [/* 上面合约的 ABI 粘贴进来 */];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const [mounted, setMounted] = useState(false);

  const { data: lastCheckIn } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'lastCheckIn',
    args: [address!],
    chainId: base.id,
    query: { enabled: !!address },
  });

  const { data: count } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'checkInCount',
    args: [address!],
    chainId: base.id,
    query: { enabled: !!address },
  });

  const { data: totalUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'totalUsers',
    chainId: base.id,
  });

  const canCheckIn = !lastCheckIn || Number(lastCheckIn) * 1000 < Date.now() - 24*60*60*1000;

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* 背景渐变球 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            BaseDaily
          </h1>
          <p className="text-zinc-400 text-xl mb-12">每天签到 0.4u，躺赚 Base 生态积分</p>

          {!isConnected ? (
            <w3m-button size="lg" />
          ) : (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl max-w-md w-full">
              <div className="text-center space-y-8">
                <div>
                  <p className="text-zinc-500 text-sm">累计签到</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {count ? Number(count) : 0} 天
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm">全网用户</p>
                  <p className="text-3xl font-bold">{totalUsers ? Number(totalUsers) : 0}</p>
                </div>

                <button
                  onClick={() => writeContract({
                    address: CONTRACT_ADDRESS,
                    abi,
                    functionName: 'checkIn',
                    chainId: base.id,
                  })}
                  disabled={!canCheckIn || isPending}
                  className={`w-full py-6 rounded-2xl font-bold text-xl transition-all transform
                    ${canCheckIn 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 shadow-lg hover:shadow-cyan-500/25' 
                      : 'bg-zinc-800 cursor-not-allowed'
                    }`}
                >
                  {isPending ? '签到中...' : canCheckIn ? '今日签到 (~0.45u)' : '今日已签到'}
                </button>

                {!canCheckIn && (
                  <p className="text-zinc-500 text-sm">明天再来～</p>
                )}
              </div>
            </div>
          )}

          <p className="absolute bottom-8 text-zinc-600 text-sm">
            Powered by Base • Gas ≈ 0.00018 ETH
          </p>
        </div>
      </div>
    </>
  );
}
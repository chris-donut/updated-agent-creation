
import React, { useState } from 'react';
import { Agent, UserHolding } from '../types';
import { ArrowUpRight, TrendingUp, Users, ShieldCheck, Activity, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface ArenaLeaderboardProps {
  agents: Agent[];
  onOpenVault: (id: string) => void;
  userHoldings: Record<string, UserHolding>;
}

type SortField = 'rank' | 'return' | 'sharpe' | 'tvl' | 'score';

export const ArenaLeaderboard: React.FC<ArenaLeaderboardProps> = ({ agents, onOpenVault, userHoldings }) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc'); // Default to desc for metrics usually
    }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    let valA, valB;
    switch (sortField) {
      case 'rank':
        valA = a.marketMetrics.rank || 999;
        valB = b.marketMetrics.rank || 999;
        return sortDir === 'asc' ? valA - valB : valB - valA;
      case 'return':
        valA = a.sinceLaunchReturnPct;
        valB = b.sinceLaunchReturnPct;
        break;
      case 'sharpe':
        valA = a.sharpeEstimate || 0;
        valB = b.sharpeEstimate || 0;
        break;
      case 'tvl':
        valA = a.marketMetrics.tvl;
        valB = b.marketMetrics.tvl;
        break;
      case 'score':
        valA = a.lifecycle.validationScore;
        valB = b.lifecycle.validationScore;
        break;
      default:
        return 0;
    }
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const maxTVL = Math.max(...agents.map(a => a.marketMetrics.tvl));

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
        <div className="col-span-1 flex items-center cursor-pointer hover:text-white" onClick={() => handleSort('rank')}>
          # <SortIcon field="rank" />
        </div>
        <div className="col-span-4 flex items-center">Agent Strategy</div>
        <div className="col-span-2 flex items-center justify-end cursor-pointer hover:text-white" onClick={() => handleSort('return')}>
          Return <SortIcon field="return" />
        </div>
        <div className="col-span-1 flex items-center justify-end cursor-pointer hover:text-white" onClick={() => handleSort('sharpe')}>
          Sharpe <SortIcon field="sharpe" />
        </div>
        <div className="col-span-1 flex items-center justify-end cursor-pointer hover:text-white" onClick={() => handleSort('score')}>
          Reliability <SortIcon field="score" />
        </div>
        <div className="col-span-2 flex items-center justify-end cursor-pointer hover:text-white" onClick={() => handleSort('tvl')}>
          Natural Selection (TVL) <SortIcon field="tvl" />
        </div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800">
        {sortedAgents.map((agent) => {
          const isInvested = !!userHoldings[agent.id];
          
          return (
            <div key={agent.id} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-900/30 transition-colors items-center group">
              {/* Rank */}
              <div className="col-span-1 font-mono text-gray-500 font-bold">
                 {agent.marketMetrics.rank > 0 ? `#${agent.marketMetrics.rank}` : '-'}
              </div>

              {/* Agent Info */}
              <div className="col-span-4 flex items-center gap-3">
                 <div className="relative">
                    <img src={agent.avatarUrl} className="w-10 h-10 rounded-lg object-cover border border-gray-700" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-gray-800">
                        {agent.lifecycle.stage === 'live' ? <Activity size={10} className="text-emerald-500"/> : <ShieldCheck size={10} className="text-gray-500"/>}
                    </div>
                 </div>
                 <div>
                    <div className="font-bold text-gray-200 text-sm group-hover:text-indigo-400 transition-colors">{agent.name}</div>
                    <div className="flex gap-1 mt-1">
                        {agent.styleTags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                 </div>
              </div>

              {/* Return */}
              <div className="col-span-2 text-right">
                 <div className={`font-mono font-bold text-sm ${agent.sinceLaunchReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {agent.sinceLaunchReturnPct >= 0 ? '+' : ''}{agent.sinceLaunchReturnPct}%
                 </div>
                 <div className="text-[10px] text-gray-600">All Time</div>
              </div>

              {/* Sharpe */}
              <div className="col-span-1 text-right font-mono text-sm text-gray-300">
                 {agent.sharpeEstimate}
              </div>

              {/* Reliability Score */}
              <div className="col-span-1 text-right">
                 <span className={`font-bold text-xs px-1.5 py-0.5 rounded ${
                     agent.lifecycle.validationScore > 90 ? 'bg-emerald-950 text-emerald-500 border border-emerald-900' :
                     agent.lifecycle.validationScore > 75 ? 'bg-indigo-950 text-indigo-500 border border-indigo-900' :
                     'bg-gray-800 text-gray-400'
                 }`}>
                    {agent.lifecycle.validationScore}
                 </span>
              </div>

              {/* TVL / Natural Selection */}
              <div className="col-span-2 flex flex-col items-end justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs text-white font-bold">${(agent.marketMetrics.tvl / 1000).toFixed(1)}k</span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-0.5"><Users size={8} /> {agent.marketMetrics.copierCount}</span>
                  </div>
                  {/* Progress Bar for Natural Selection */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full"
                        style={{ width: `${(agent.marketMetrics.tvl / maxTVL) * 100}%` }}
                      ></div>
                  </div>
              </div>

              {/* Action */}
              <div className="col-span-1 text-right">
                  {isInvested ? (
                      <button className="px-3 py-1.5 bg-emerald-900/30 text-emerald-400 border border-emerald-900 rounded text-xs font-bold w-full">
                          Invested
                      </button>
                  ) : (
                      <button 
                        onClick={() => onOpenVault(agent.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold w-full shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-1"
                      >
                          <Copy size={12} /> Copy
                      </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

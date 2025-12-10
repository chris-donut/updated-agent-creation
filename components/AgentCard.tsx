
import React from 'react';
import { Agent, UserHolding } from '../types';
import { ShieldCheck, User, Cpu, Wallet, Lock, Activity, FlaskConical, FileText } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  showFitScore?: boolean;
  holding?: UserHolding;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, onClick, onDoubleClick, showFitScore, holding }) => {
  const pnl = holding ? holding.currentValue - holding.investedAmount : 0;
  const pnlPct = holding ? (pnl / holding.investedAmount) * 100 : 0;
  
  const isLive = agent.lifecycle.stage === 'live';
  const isPaper = agent.lifecycle.stage === 'paper';
  const isBacktest = agent.lifecycle.stage === 'backtest';

  return (
    <div 
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`
        w-full p-4 border-b cursor-pointer transition-all duration-200 relative group select-none
        ${isSelected 
          ? 'bg-gray-800/80 border-l-4 border-l-indigo-500 border-b-gray-800' 
          : 'bg-transparent border-b-gray-800/50 border-l-4 border-l-transparent hover:bg-gray-800/30'
        }
        ${holding ? 'border-l-4 !border-l-emerald-500 bg-emerald-950/10' : ''}
      `}
    >
      {/* Header: Name & Tags */}
      <div className="flex items-start justify-between mb-3 mt-1">
        <div className="flex items-center gap-3">
          <div className="relative">
             <img src={agent.avatarUrl} alt={agent.name} className={`w-12 h-12 rounded-xl object-cover border-2 ${holding ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : isLive ? 'border-emerald-500/50' : isPaper ? 'border-amber-500/50' : 'border-gray-600'}`} />
             {holding && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full border border-black">
                   <Lock size={10} strokeWidth={3} />
                </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-lg ${isSelected || holding ? 'text-white' : 'text-gray-200'}`}>
                {agent.name}
              </h3>
              
              {/* Validation Status Badge */}
              <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border tracking-wide ${
                  isLive ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' :
                  isPaper ? 'bg-amber-950/40 text-amber-400 border-amber-900' :
                  'bg-gray-800 text-gray-400 border-gray-700'
              }`}>
                 {isLive ? <Activity size={9} /> : isPaper ? <FileText size={9} /> : <FlaskConical size={9} />}
                 {agent.lifecycle.stage}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
               {/* Model Badge */}
              <div className="flex items-center gap-1 text-[10px] bg-gray-900 border border-gray-700 px-1.5 py-0.5 rounded text-gray-400">
                 <Cpu size={10} />
                 {agent.config.aiModel.split(' ')[0]}
              </div>
              
              {agent.styleTags.slice(0, 1).map(tag => (
                <span key={tag} className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Active Vault Badge - Replaces generic badge with a status indicator */}
        {holding && (
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active
             </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs border-t border-gray-800/50 pt-3">
        <div>
          <span className="text-gray-500 block mb-0.5 font-medium">{isLive ? 'Real Return' : 'Simulated PnL'}</span>
          <span className={`font-mono font-bold ${agent.sinceLaunchReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {agent.sinceLaunchReturnPct >= 0 ? '+' : ''}{agent.sinceLaunchReturnPct}%
          </span>
        </div>
        <div>
          <span className="text-gray-500 block mb-0.5 font-medium">Validation</span>
          <span className={`font-mono font-bold ${
              agent.lifecycle.validationScore > 80 ? 'text-emerald-400' : 
              agent.lifecycle.validationScore > 60 ? 'text-amber-400' : 'text-gray-400'
          }`}>
             {agent.lifecycle.validationScore}/100
          </span>
        </div>
        
        {/* If user has money, show their PnL, otherwise show Drawdown */}
        {holding ? (
           <div className="col-span-1 pl-2 border-l border-emerald-900/50">
             <span className="text-emerald-500/70 block mb-0.5 font-semibold">Your Equity</span>
             <span className="font-mono font-bold text-white block">
                ${holding.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
             </span>
             <span className={`text-[10px] ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
             </span>
           </div>
        ) : (
          <div>
            <span className="text-gray-500 block mb-0.5 font-medium">Max Drawdown</span>
            <span className="font-mono font-bold text-rose-400">{agent.maxDrawdownPct}%</span>
          </div>
        )}
      </div>
      
      {/* Active Bottom Border Highlight */}
      {holding && (
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
      )}
    </div>
  );
};

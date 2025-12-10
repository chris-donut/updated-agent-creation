
import React, { useState } from 'react';
import { Agent, Trade, Position, EquityPoint, UserHolding } from '../types';
import { ArenaLeaderboard } from '../components/ArenaLeaderboard';
import { EquityChart } from '../components/EquityChart';
import { Globe, TrendingUp, Filter } from 'lucide-react';

interface ArenaViewProps {
  agents: Agent[];
  trades: Trade[];
  positions: Position[];
  equityData: EquityPoint[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onOpenVault: (id: string) => void;
  onOpenNodeEditor?: (id: string) => void; 
  onNavigateToDetail?: () => void;
  userHoldings: Record<string, UserHolding>;
}

export const ArenaView: React.FC<ArenaViewProps> = ({ 
  agents, 
  equityData,
  onOpenVault,
  userHoldings
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | 'live' | 'paper'>('all');

  // Filter logic
  const filteredAgents = agents.filter(agent => {
      if (stageFilter !== 'all' && agent.lifecycle.stage !== stageFilter) return false;
      return true;
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black">
      
      {/* LEFT PANEL: Chart & Controls */}
      <div className="w-[40%] min-w-[450px] max-w-[600px] flex flex-col border-r border-gray-800 bg-gray-950/50 shrink-0">
          
          {/* Hero Header */}
          <div className="p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <Globe className="text-indigo-500" size={24} /> Agent Arena
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                  Discover validated autonomous strategies. Capital flows to the most efficient strategies through our natural selection protocol. 
                  <span className="text-indigo-400 font-bold ml-1">Copy the winners.</span>
              </p>
          </div>

          {/* Chart Section */}
          <div className="flex-1 p-6 flex flex-col min-h-0">
             <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <TrendingUp size={14} className="text-emerald-500" /> Market Performance
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     <span className="text-[10px] font-bold text-emerald-400">LIVE FEED</span>
                 </div>
             </div>
             
             {/* Chart Container */}
             <div className="flex-1 bg-gray-900/40 rounded-xl border border-gray-800/50 p-4 backdrop-blur-sm relative overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0">
                    <EquityChart 
                        data={equityData} 
                        agents={filteredAgents} 
                        viewMode="equity" 
                        showBenchmark={true} 
                    />
                </div>
             </div>
          </div>
          
          {/* Controls Footer */}
          <div className="p-6 border-t border-gray-800 bg-gray-900/30">
               <div className="flex items-center justify-between mb-3">
                   <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                       <Filter size={12} /> Filter View
                   </div>
                   <span className="text-[10px] text-gray-500 font-mono">
                       Showing {filteredAgents.length} Agents
                   </span>
               </div>
               <div className="flex bg-gray-900 rounded p-1 border border-gray-800 shadow-sm">
                    <button onClick={() => setStageFilter('all')} className={`flex-1 text-xs py-2 rounded font-medium transition-colors ${stageFilter === 'all' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>All Stages</button>
                    <button onClick={() => setStageFilter('live')} className={`flex-1 text-xs py-2 rounded font-medium transition-colors ${stageFilter === 'live' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/30 shadow' : 'text-gray-500 hover:text-gray-300'}`}>Live Only</button>
                    <button onClick={() => setStageFilter('paper')} className={`flex-1 text-xs py-2 rounded font-medium transition-colors ${stageFilter === 'paper' ? 'bg-amber-900/30 text-amber-400 border border-amber-900/30 shadow' : 'text-gray-500 hover:text-gray-300'}`}>Paper Trading</button>
               </div>
          </div>
      </div>

      {/* RIGHT PANEL: Leaderboard */}
      <div className="flex-1 flex flex-col bg-black min-w-0 relative">
          <div className="flex-1 overflow-y-auto">
              <ArenaLeaderboard 
                agents={filteredAgents} 
                onOpenVault={onOpenVault} 
                userHoldings={userHoldings}
              />
          </div>
      </div>
    </div>
  );
};

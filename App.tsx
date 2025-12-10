
import React, { useState } from 'react';
import { ArenaView } from './views/ArenaView';
import { AgentDetailView } from './views/AgentDetailView';
import { NodeBuilderView } from './views/NodeBuilderView'; 
import { BacktestView } from './views/BacktestView';
import { DepositModal } from './components/DepositModal';
import { agents, trades, positions, equityData } from './data';
import { UserHolding } from './types';
import { PieChart, Bell, User, LayoutDashboard, Globe, FlaskConical } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'arena' | 'portfolio' | 'node-editor' | 'backtest'>('arena');
  const [previousScreen, setPreviousScreen] = useState<'arena' | 'portfolio' | 'backtest'>('arena');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('overview');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // User Portfolio State
  const [userHoldings, setUserHoldings] = useState<Record<string, UserHolding>>({
    'kimi-01': { agentId: 'kimi-01', investedAmount: 5000, currentValue: 5240.50 }
  });

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
    setCurrentScreen('portfolio');
  };

  const handleOpenVault = (id: string) => {
    setSelectedAgentId(id);
    setIsDepositModalOpen(true);
  };

  const handleOpenNodeEditor = (id: string) => {
    setSelectedAgentId(id);
    setPreviousScreen(currentScreen === 'node-editor' ? 'arena' : currentScreen as any);
    setCurrentScreen('node-editor');
  }

  const handleCloseNodeEditor = () => {
    setCurrentScreen(previousScreen as any);
  }

  const handleDeposit = (amount: number) => {
    setUserHoldings((prev: Record<string, UserHolding>) => ({
      ...prev,
      [selectedAgentId]: {
        agentId: selectedAgentId,
        investedAmount: (prev[selectedAgentId]?.investedAmount || 0) + amount,
        currentValue: (prev[selectedAgentId]?.currentValue || 0) + amount 
      }
    }));
    setIsDepositModalOpen(false);
  };

  const totalBalance = (Object.values(userHoldings) as UserHolding[]).reduce((sum, h) => sum + h.currentValue, 12450);
  // Safe lookup for modal, fallback if in overview mode
  const depositAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-indigo-500/30">
      
      {/* Node Builder Overlay (Fullscreen) */}
      {currentScreen === 'node-editor' && (
        <NodeBuilderView agent={depositAgent} onClose={handleCloseNodeEditor} />
      )}

      {/* Main App Content */}
      {currentScreen !== 'node-editor' && (
        <>
          {/* Top Navigation Bar */}
          <nav className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white cursor-pointer" onClick={() => setCurrentScreen('arena')}>
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <PieChart className="text-white" size={20} />
                </div>
                DONUT
              </div>
              
              <div className="hidden md:flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                <button 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentScreen === 'arena' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setCurrentScreen('arena')}
                >
                  <Globe size={14} /> Live Arena
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentScreen === 'portfolio' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => {
                      setCurrentScreen('portfolio');
                      if (selectedAgentId === 'overview' && Object.keys(userHoldings).length > 0) {
                          // Keep overview
                      } else if (!userHoldings[selectedAgentId]) {
                          setSelectedAgentId('overview');
                      }
                  }}
                >
                  <LayoutDashboard size={14} /> My Portfolio
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentScreen === 'backtest' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setCurrentScreen('backtest')}
                >
                  <FlaskConical size={14} /> Strategy Lab
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden lg:block text-right">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Balance</div>
                <div className="text-sm font-mono font-bold text-white flex items-center gap-2 justify-end">
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalBalance)}
                </div>
              </div>
              <div className="flex items-center gap-4 border-l border-gray-800 pl-6">
                <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-gray-700">
                  <User size={16} className="text-white" />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {currentScreen === 'arena' && (
              <ArenaView 
                agents={agents}
                trades={trades}
                positions={positions}
                equityData={equityData}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
                onOpenVault={handleOpenVault}
                onOpenNodeEditor={handleOpenNodeEditor}
                onNavigateToDetail={() => {
                    setCurrentScreen('portfolio');
                }}
                userHoldings={userHoldings}
              />
            )}
            
            {currentScreen === 'portfolio' && (
              <AgentDetailView 
                agents={agents}
                userHoldings={userHoldings}
                selectedAgentId={selectedAgentId}
                onSelectAgent={(id) => setSelectedAgentId(id)}
                trades={trades}
                positions={positions}
                equityData={equityData}
                onBack={() => setCurrentScreen('arena')}
                onOpenNodeEditor={(id) => handleOpenNodeEditor(id)}
              />
            )}

            {currentScreen === 'backtest' && (
              <BacktestView />
            )}
          </main>

          {/* Modals */}
          {isDepositModalOpen && (
            <DepositModal 
              agent={depositAgent} 
              onClose={() => setIsDepositModalOpen(false)}
              onDeposit={handleDeposit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;

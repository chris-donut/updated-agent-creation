
import React, { useState } from 'react';
import { Play, Settings, Activity, Calendar, Server, Cpu, ShieldAlert, BarChart3, Terminal, RotateCcw, Save, AlertTriangle, Box, GitCommit, Shield, Layers, ChevronDown, ChevronUp, Maximize2, X, Wallet, Key, Sliders, FileText, CheckCircle2, History, BrainCircuit, Microscope, Sparkles, Target, Database } from 'lucide-react';
import { EquityChart } from '../components/EquityChart';
import { EquityPoint, Agent } from '../types';

// Renamed from Node to GraphNode to avoid conflict with window.Node
const GraphNode = ({ title, icon: Icon, color, x, y, inputs = [], outputs = [], value, isSelected, onClick, mode }: any) => (
  <div 
    onClick={onClick}
    onMouseDown={(e) => e.stopPropagation()} // Prevent canvas drag
    className={`absolute w-48 bg-gray-950 border rounded-lg shadow-xl flex flex-col group transition-all cursor-grab active:cursor-grabbing z-10 ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-gray-800 hover:border-gray-600'}`}
    style={{ left: x, top: y }}
  >
    {/* Header */}
    <div className={`h-1 w-full rounded-t-lg ${color}`}></div>
    <div className="p-3 border-b border-gray-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={14} className={`group-hover:text-white ${isSelected ? 'text-white' : 'text-gray-400'}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-200'}`}>{title}</span>
      </div>
    </div>
    
    {/* Body */}
    <div className="p-3 bg-gray-900/50">
       {value && <div className="text-center font-mono text-sm font-bold text-gray-300">{value}</div>}
       {mode === 'trader' && title === 'LLM Agent' && (
           <div className="mt-2 text-[10px] text-emerald-400 flex items-center justify-center gap-1 bg-emerald-950/30 rounded py-1 px-2 border border-emerald-900/50">
               <Sparkles size={10} /> DIRECT MODE
           </div>
       )}
       {mode === 'designer' && title === 'Strategy Engine' && (
           <div className="mt-2 text-[10px] text-cyan-400 flex items-center justify-center gap-1 bg-cyan-950/30 rounded py-1 px-2 border border-cyan-900/50">
               <Database size={10} /> PARAM SEARCH
           </div>
       )}
    </div>

    {/* Ports */}
    {inputs.map((_: any, i: number) => (
        <div key={i} className="absolute -left-1.5 top-1/2 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-950 hover:bg-white transition-colors"></div>
    ))}
    {outputs.map((_: any, i: number) => (
        <div key={i} className="absolute -right-1.5 top-1/2 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-950 hover:bg-white transition-colors"></div>
    ))}
  </div>
);

export const BacktestView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showResultsPanel, setShowResultsPanel] = useState(true);
  
  // Mode State: 'trader' (Direct LLM) vs 'designer' (Strategy Builder)
  const [agentMode, setAgentMode] = useState<'trader' | 'designer'>('trader');

  // Viewport State for Panning
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Configuration State
  const [config, setConfig] = useState({
    // Basic
    name: 'New Agent Blueprint',
    pairs: 'BTC-USDT\nETH-USDT',
    // AI
    apiKey: '',
    aiModel: 'google/gemini-3-pro-preview',
    // Brain - Trader
    systemPrompt: 'You are a conservative swing trader. Only trade when the trend is clear.',
    strategyPrompt: 'Check 4H structure. If bullish, look for pullbacks to EMA20. Confirm with volume.',
    // Brain - Designer
    objectivePrompt: 'Maximize Sharpe Ratio on 15m timeframe. Keep Max DD < 15%.',
    searchSpace: 'ma_fast: [5, 20]\nma_slow: [50, 200]\nrsi_period: [7, 21]',
    // Execution
    candleInterval: '5m',
    maxRecords: 100,
    positionSize: 10, // %
    leverage: 3,
    stopLoss: 2.5,
    takeProfit: 5.0,
    // Backtest
    startDate: '2025-12-02',
    endDate: '2025-12-04',
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setViewport(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mock Result Data Generator
  const generateBacktestResults = () => {
    const points: EquityPoint[] = [];
    let capital = 10000;
    let btcPrice = 65000;
    
    for (let i = 0; i < 60; i++) {
        const date = new Date(config.startDate);
        date.setDate(date.getDate() + i);
        const change = (Math.random() - 0.42) * 0.03; 
        capital *= (1 + change);
        btcPrice *= (1 + (Math.random() - 0.48) * 0.02);

        points.push({
            date: date.toLocaleDateString(),
            'strategy': Number(capital.toFixed(2)),
            'btc': 10000 * (btcPrice / 65000), 
            'strategy_dd': 0, 
            'btc_dd': 0
        });
    }
    
    const totalReturn = ((capital - 10000) / 10000) * 100;

    return {
        id: config.name,
        status: 'COMPLETED',
        equity: points,
        metrics: {
            totalReturn: totalReturn.toFixed(2),
            netPnl: (capital - 10000).toFixed(2),
            sharpe: 2.14,
            maxDrawdown: -12.4,
            winRate: 41.1,
            trades: 56
        }
    };
  };

  const handleRunBacktest = () => {
    setIsRunning(true);
    setProgress(0);
    setLogs(['Initializing Agent Environment...', `Mode: ${agentMode === 'trader' ? 'Direct LLM Trader' : 'Strategy Designer'}`, `Loading Model: ${config.aiModel}...`]);
    setShowResultsPanel(true);
    setSimulationResult(null);

    let step = 0;
    const interval = setInterval(() => {
        step++;
        const newProgress = Math.min(step * 10, 100);
        setProgress(newProgress);

        if (step === 2) setLogs(prev => [...prev, `[INIT] Validating OpenRouter API Key... OK`]);
        if (step === 3) setLogs(prev => [...prev, `[DATA] Fetching ${config.maxRecords} records for ${config.pairs.split('\n')[0]}...`]);
        
        if (agentMode === 'trader') {
            if (step === 5) setLogs(prev => [...prev, `[BRAIN] Ingesting market state...`]);
            if (step === 6) setLogs(prev => [...prev, `[LLM] Reasoning: "Trend looks bullish, waiting for pullback..."`]);
        } else {
            if (step === 5) setLogs(prev => [...prev, `[SEARCH] Testing candidate param set #1...`]);
            if (step === 6) setLogs(prev => [...prev, `[OPTIMIZE] Found local maxima for Sharpe Ratio (1.8)...`]);
        }
        
        if (step === 7) setLogs(prev => [...prev, `[TRADE] LONG BTC-USDT @ $64,200 | Size: ${config.positionSize}%`]);
        if (step === 8) setLogs(prev => [...prev, `[RISK] Stop Loss triggered at -${config.stopLoss}%`]);

        if (step >= 10) {
            clearInterval(interval);
            setIsRunning(false);
            setLogs(prev => [...prev, `Simulation Complete. Generating Blueprint Report.`]);
            setSimulationResult(generateBacktestResults());
        }
    }, 250);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#09090b]">
      
      {/* LEFT: NODE EDITOR CANVAS */}
      <div 
        className={`flex-1 relative bg-[#050505] overflow-hidden flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg p-1 flex gap-1 pointer-events-auto shadow-lg">
                <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Add Node"><Box size={16} /></button>
                <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Add Logic"><GitCommit size={16} /></button>
                <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Risk Rule"><Shield size={16} /></button>
            </div>
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-gray-500 pointer-events-auto shadow-lg">
                <span>CANVAS: {isDragging ? 'PANNING' : 'IDLE'}</span>
                <span className="text-gray-700">|</span>
                <span>{Math.round(viewport.x)}, {Math.round(viewport.y)}</span>
            </div>
        </div>

        {/* Nodes Layer (Movable) */}
        <div 
            className="absolute inset-0 w-full h-full transform origin-top-left will-change-transform"
            style={{ transform: `translate(${viewport.x}px, ${viewport.y}px)` }}
        >
            {/* Grid Background */}
            <div className="absolute -inset-[3000px] opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <path d="M 190 150 C 300 150, 300 250, 430 250" stroke="#3f3f46" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                <path d="M 620 250 C 700 250, 700 350, 800 350" stroke="#10b981" strokeWidth="2" fill="none" />
                <path d="M 430 450 C 550 450, 550 250, 620 250" stroke="#3f3f46" strokeWidth="2" fill="none" />
            </svg>
            
            {/* Nodes - Changing based on Mode */}
            <GraphNode title="Market Data" icon={Activity} color="bg-cyan-500" x={40} y={100} outputs={[1]} value={`${config.pairs.split('\n').length} Pairs`} onClick={() => setActiveNode('n1')} mode={agentMode} />
            <GraphNode title="Feature Eng" icon={Box} color="bg-purple-500" x={280} y={200} inputs={[1]} outputs={[1]} value={agentMode === 'trader' ? 'Input Schema' : `${config.candleInterval} Candles`} onClick={() => setActiveNode('n2')} mode={agentMode} />
            
            {agentMode === 'trader' ? (
                // TRADER NODES
                <>
                    <GraphNode title="LLM Agent" icon={BrainCircuit} color="bg-amber-500" x={480} y={200} inputs={[1]} outputs={[1]} value={config.aiModel.split('/')[1] || 'Gemini'} onClick={() => setActiveNode('n3')} mode={agentMode} />
                    <GraphNode title="Risk Envelope" icon={Shield} color="bg-rose-500" x={280} y={400} outputs={[1]} value={`Hard Constraints`} onClick={() => setActiveNode('n4')} mode={agentMode} />
                </>
            ) : (
                // DESIGNER NODES
                <>
                    <GraphNode title="Strategy Engine" icon={Settings} color="bg-teal-500" x={480} y={200} inputs={[1]} outputs={[1]} value={'Deterministic'} onClick={() => setActiveNode('n3')} mode={agentMode} />
                    <GraphNode title="Optimizer" icon={Microscope} color="bg-indigo-500" x={480} y={400} outputs={[1]} value={`Bayesian`} onClick={() => setActiveNode('n4')} mode={agentMode} />
                </>
            )}
            
            <GraphNode title="Execution" icon={Server} color="bg-emerald-500" x={700} y={300} inputs={[1]} value={`Size: ${config.positionSize}%`} onClick={() => setActiveNode('n5')} mode={agentMode} />
        </div>
        
        {/* Floating Controls (Fixed UI) */}
        <div className="absolute bottom-12 left-6 flex flex-col gap-2 pointer-events-none z-20">
            <div className="pointer-events-auto flex flex-col gap-2">
                <button className="w-8 h-8 bg-gray-900 border border-gray-800 rounded flex items-center justify-center text-gray-400 hover:text-white shadow-lg" onClick={() => setViewport({x: 0, y: 0})}>
                    <Maximize2 size={14} />
                </button>
            </div>
        </div>

        {/* BOTTOM PANEL: MONITOR RUNS & LOGS */}
        <div className={`absolute bottom-0 left-0 right-0 border-t border-gray-800 bg-[#09090b] transition-all duration-300 z-30 flex flex-col ${showResultsPanel ? 'h-[400px]' : 'h-10'}`}>
            {/* Panel Header */}
            <div className="h-10 flex items-center justify-between px-4 bg-gray-900 border-b border-gray-800 shrink-0 cursor-pointer hover:bg-gray-800" onClick={() => setShowResultsPanel(!showResultsPanel)}>
                <div className="flex items-center gap-3">
                    <Activity size={14} className={isRunning ? "text-indigo-400 animate-pulse" : "text-gray-500"} />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Monitor Simulation</span>
                    {isRunning && <span className="text-[10px] text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-900/50">RUNNING {progress}%</span>}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    {showResultsPanel ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
            </div>

            {/* Panel Content */}
            {showResultsPanel && (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Runs List & Logs */}
                    <div className="w-80 border-r border-gray-800 flex flex-col bg-gray-950/50">
                        {/* Run History List */}
                        <div className="flex-1 overflow-y-auto border-b border-gray-800">
                            <div className="p-2 space-y-1">
                                <div className="text-[10px] text-gray-500 uppercase px-2 py-1 font-bold">Recent Runs</div>
                                <div className={`p-2 rounded cursor-pointer border ${simulationResult ? 'bg-indigo-900/20 border-indigo-500/50' : 'hover:bg-gray-900 border-transparent'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-200">{config.name}</span>
                                        {simulationResult ? <CheckCircle2 size={12} className="text-emerald-500"/> : <Activity size={12} className="text-gray-600"/>}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>{agentMode === 'trader' ? 'Direct LLM' : 'Optimizer'}</span>
                                        <span>{new Date().toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Live Logs */}
                        <div className="h-40 bg-black flex flex-col">
                            <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Terminal size={10}/> Logs</span>
                                <RotateCcw size={10} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => setLogs([])}/>
                            </div>
                            <div className="flex-1 p-2 overflow-y-auto font-mono text-[10px] space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i} className="text-gray-400 border-l-2 border-gray-800 pl-2 hover:border-indigo-500 hover:text-gray-200">
                                        <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                        {log}
                                    </div>
                                ))}
                                <div className="h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Results Dashboard */}
                    <div className="flex-1 bg-gray-900/10 flex flex-col relative overflow-hidden">
                        {!simulationResult ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                <BarChart3 size={48} className="opacity-20 mb-4" />
                                <h3 className="text-sm font-medium text-gray-500">Ready to Simulate</h3>
                                <p className="text-xs text-gray-600 mt-1 max-w-xs text-center">
                                    Configure your Agent Blueprint in the sidebar and click "Simulate & Validate" to test.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                {/* Banner Status */}
                                <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-lg font-bold text-white">{simulationResult.id}</h2>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> BLUEPRINT VALIDATED
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {config.startDate} - {config.endDate} • {config.pairs.split('\n').length} Pairs • {config.aiModel}
                                        </div>
                                    </div>
                                    <div className="flex gap-6 text-right">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Net PnL</div>
                                            <div className={`text-xl font-mono font-bold ${parseFloat(simulationResult.metrics.netPnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                ${simulationResult.metrics.netPnl} <span className="text-sm">({simulationResult.metrics.totalReturn}%)</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Max DD</div>
                                            <div className="text-xl font-mono font-bold text-rose-400">{simulationResult.metrics.maxDrawdown}%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Chart */}
                                <div className="flex-1 p-4 min-h-0">
                                    <EquityChart 
                                        data={simulationResult.equity} 
                                        agents={[{ 
                                            id: 'strategy', 
                                            name: 'Blueprint', 
                                            avatarUrl: '',
                                            styleTags: [], 
                                            sinceLaunchReturnPct: 0, 
                                            maxDrawdownPct: 0, 
                                            tradesPerDay: 0, 
                                            daysLive: 0, 
                                            emotionalFirewallLevel: 'Strict', 
                                            description: '', 
                                            lifecycle: {
                                                stage: 'backtest',
                                                version: 'v0.0.1',
                                                validationScore: 0
                                            },
                                            marketMetrics: {
                                                tvl: 0,
                                                copierCount: 0,
                                                rank: 0
                                            },
                                            config: {
                                                riskProfile: 'Balanced',
                                                aiModel: config.aiModel,
                                                horizon: 'Intraday',
                                                maxTokens: 8192,
                                                cerberus: {
                                                    structural: 50,
                                                    quant: 50,
                                                    strategic: 50,
                                                    governor: 'Moderate'
                                                },
                                                edge: {
                                                    dog: 50,
                                                    tail: 50
                                                }
                                            }
                                        }]}
                                        viewMode="equity"
                                        showBenchmark={true}
                                    />
                                </div>

                                {/* Stats Footer */}
                                <div className="h-16 border-t border-gray-800 bg-gray-950 flex items-center px-6 gap-8">
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase">Win Rate</span>
                                        <span className="text-sm font-mono font-bold text-white">{simulationResult.metrics.winRate}%</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-500 uppercase">Sharpe Ratio</span>
                                        <span className="text-sm font-mono font-bold text-white">{simulationResult.metrics.sharpe}</span>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                        <button className="px-3 py-1.5 rounded border border-gray-700 hover:bg-gray-800 text-xs text-gray-300">View Logs</button>
                                        <button className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20">
                                            Promote to Agent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT: CONFIG SIDEBAR */}
      <div className="w-96 bg-gray-950 border-l border-gray-800 flex flex-col z-20 shadow-2xl">
         <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-950 shrink-0">
             <div className="flex items-center gap-2">
                 <Settings size={16} className="text-indigo-400" />
                 <span className="font-bold text-sm text-gray-200">Blueprint Config</span>
             </div>
             <button className="text-xs text-indigo-400 hover:text-indigo-300">Reset</button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-6">
             
             {/* AGENT MODE SWITCHER */}
             <div className="space-y-3">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                     <BrainCircuit size={12} /> Brain Mode
                 </div>
                 <div className="bg-gray-900 p-1 rounded-lg border border-gray-800 flex">
                     <button 
                        onClick={() => setAgentMode('trader')}
                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-all ${agentMode === 'trader' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                     >
                         <BrainCircuit size={12} /> Direct Trader
                     </button>
                     <button 
                        onClick={() => setAgentMode('designer')}
                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-all ${agentMode === 'designer' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                     >
                         <Microscope size={12} /> Designer
                     </button>
                 </div>
                 <div className="text-[10px] text-gray-500 leading-tight px-1">
                     {agentMode === 'trader' 
                        ? 'LLM acts as a live decision maker. You define the Persona and Logic.' 
                        : 'LLM acts as a researcher. You define the Goal and Search Space.'}
                 </div>
             </div>

             <div className="border-t border-gray-800 my-2"></div>
            
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                     <FileText size={12} /> Blueprint Info
                 </div>
                 <input 
                    type="text" 
                    value={config.name} 
                    onChange={(e) => setConfig({...config, name: e.target.value})} 
                    className="w-full bg-black border border-gray-800 rounded px-2 py-1.5 text-xs text-white" 
                    placeholder="Blueprint Name"
                 />
             </div>

             <div className="border-t border-gray-800 my-2"></div>

             {/* BRAIN CONFIG - DYNAMIC */}
             <div className="space-y-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                     {agentMode === 'trader' ? <BrainCircuit size={12} /> : <Target size={12} />} 
                     {agentMode === 'trader' ? 'Trader Personality' : 'Optimizer Objective'}
                 </div>
                 
                 {agentMode === 'trader' ? (
                     <>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1">System Prompt (Identity)</label>
                            <textarea 
                                value={config.systemPrompt}
                                onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                                className="w-full h-20 bg-gray-900 border border-gray-800 rounded p-2 text-[10px] font-mono text-gray-300 focus:border-indigo-500 focus:outline-none resize-none"
                                placeholder="You are a conservative trader..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Strategy Prompt (Logic)</label>
                            <textarea 
                                value={config.strategyPrompt}
                                onChange={(e) => setConfig({...config, strategyPrompt: e.target.value})}
                                className="w-full h-20 bg-gray-900 border border-gray-800 rounded p-2 text-[10px] font-mono text-gray-300 focus:border-indigo-500 focus:outline-none resize-none"
                                placeholder="Look for EMA crosses..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Model</label>
                            <select 
                                value={config.aiModel}
                                onChange={(e) => setConfig({...config, aiModel: e.target.value})}
                                className="w-full bg-black border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-300"
                            >
                                <option value="google/gemini-3-pro-preview">google/gemini-3-pro-preview</option>
                                <option value="anthropic/claude-3-opus">anthropic/claude-3-opus</option>
                            </select>
                        </div>
                     </>
                 ) : (
                     <>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Objective Prompt (Goal)</label>
                            <textarea 
                                value={config.objectivePrompt}
                                onChange={(e) => setConfig({...config, objectivePrompt: e.target.value})}
                                className="w-full h-20 bg-gray-900 border border-gray-800 rounded p-2 text-[10px] font-mono text-gray-300 focus:border-indigo-500 focus:outline-none resize-none"
                                placeholder="Maximize Sharpe Ratio..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Search Space Configuration</label>
                            <textarea 
                                value={config.searchSpace}
                                onChange={(e) => setConfig({...config, searchSpace: e.target.value})}
                                className="w-full h-20 bg-black border border-gray-800 rounded p-2 text-[10px] font-mono text-cyan-400 focus:border-indigo-500 focus:outline-none resize-none"
                                placeholder="ma_length: [10, 50]..."
                            />
                        </div>
                     </>
                 )}
             </div>

             <div className="border-t border-gray-800 my-2"></div>

             {/* MECHANICS */}
             <div className="space-y-3">
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                     <Sliders size={12} /> Mechanics & Risk
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <div>
                         <label className="text-[10px] text-gray-500 block mb-1">Candle Interval</label>
                         <select value={config.candleInterval} onChange={(e) => setConfig({...config, candleInterval: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-300">
                             <option value="1m">1m</option>
                             <option value="5m">5m</option>
                             <option value="1h">1h</option>
                         </select>
                     </div>
                     <div>
                         <label className="text-[10px] text-gray-500 block mb-1">Stop Loss (%)</label>
                         <input type="number" step="0.1" value={config.stopLoss} onChange={(e) => setConfig({...config, stopLoss: parseFloat(e.target.value)})} className="w-full bg-black border border-gray-800 rounded px-2 py-1.5 text-xs text-rose-400 font-bold text-right" />
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                         <label className="text-[10px] text-gray-500 block mb-1">Trading Pairs</label>
                         <input type="text" value={config.pairs.split('\n')[0]} readOnly className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-400" />
                    </div>
                    <div>
                         <label className="text-[10px] text-gray-500 block mb-1">Size (%)</label>
                         <input type="number" value={config.positionSize} onChange={(e) => setConfig({...config, positionSize: parseInt(e.target.value)})} className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white" />
                    </div>
                 </div>
             </div>
         </div>

         {/* Run Button Footer */}
         <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0">
             <button 
                onClick={handleRunBacktest}
                disabled={isRunning}
                className={`w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isRunning 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                }`}
             >
                {isRunning ? (
                    <>Processing...</>
                ) : (
                    <><Play size={16} fill="currentColor" /> Simulate & Validate</>
                )}
             </button>
         </div>
      </div>
    </div>
  );
};

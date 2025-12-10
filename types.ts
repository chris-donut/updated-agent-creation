
export type AgentStyle = "Trend" | "Low Frequency" | "BTC+ETH" | "Perps ≤ 3x" | "Mean Reversion" | "Scalp" | "DeFi-Native";

export type LifecycleStage = 'backtest' | 'paper' | 'live';

export type AgentConfig = {
  riskProfile: "Very Conservative" | "Conservative" | "Balanced" | "Aggressive";
  aiModel: string; // e.g., "Qwen Max", "Claude 3.5"
  horizon: string; // e.g., "Swing", "Intraday"
  maxTokens: number;
  cerberus: {
    structural: number;
    quant: number;
    strategic: number;
    governor: "Weak" | "Moderate" | "Strong";
  };
  edge: {
    dog: number; // Structure
    tail: number; // Sentiment
  };
};

export type Agent = {
  id: string;
  name: string;
  avatarUrl: string;
  styleTags: AgentStyle[];
  sinceLaunchReturnPct: number;
  maxDrawdownPct: number;
  sharpeEstimate?: number;
  tradesPerDay: number;
  daysLive: number;
  fitScoreForUser?: number;
  emotionalFirewallLevel: "Strict" | "Moderate" | "Loose";
  description: string;
  config: AgentConfig; 
  lifecycle: {
    stage: LifecycleStage;
    version: string;
    validationScore: number; // 0-100 score indicating robustness
  };
  marketMetrics: {
      tvl: number; // Total Value Locked in USD
      copierCount: number; // Number of users copying
      rank: number; // Global Rank
  };
  fullStrategyMemo?: {
    goal: string;
    dataSources: string[];
    riskGuardrails: string[];
  };
};

export type TradeThought = {
  summary: string;
  marketState: string; // Corresponds to "USER_PROMPT" / "Raw Data"
  chainOfThought: string;
  decisionProtocol: string;
};

export type Trade = {
  id: string;
  agentId: string;
  timestamp: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  notional: number;
  holdingTimeMinutes: number;
  pnlDollar: number;
  pnlPct: number;
  ruleTag: string;
  actionTag: "Entry" | "Add" | "Reduce" | "StopLoss" | "TakeProfit";
  explanation: string;
  thoughts?: TradeThought; // New rich data field
};

export type ExitPlan = {
  targetPrice: number;
  stopLossPrice: number;
  description: string;
};

export type Position = {
  id: string;
  agentId: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  liquidationPrice?: number;
  size: number;
  leverage: number;
  unrealizedPnlDollar: number;
  unrealizedPnlPct: number;
  explanation: string;
  exitPlan?: ExitPlan;
};

export type EquityPoint = {
  date: string;
  [key: string]: number | string; 
};

export type UserHolding = {
  agentId: string;
  investedAmount: number;
  currentValue: number;
};

export type BacktestConfig = {
  pairs: string[];
  aiModel: string;
  intervalSeconds: number;
  temperature: number;
  candleInterval: string;
  stopLoss: number;
  takeProfit: number;
  startDate: string;
  endDate: string;
  initialCapital: number;
};

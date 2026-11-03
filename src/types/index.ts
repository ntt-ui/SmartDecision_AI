export interface ProjectOption {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export type CriterionType = 'benefit' | 'cost';

export interface ProjectCriteria {
  id: string;
  name: string;
  weight: number; // percentage (0 - 100)
  description?: string;
  type?: CriterionType; // 'benefit' (higher is better) or 'cost' (lower is better)
}

export interface Project {
  id: string;
  name: string;
  businessName?: string;
  domain: string;
  problemDescription: string;
  options: ProjectOption[];
  criteria: ProjectCriteria[];
  // scores[optionId][criteriaId] = score from 1 to 5
  scores: Record<string, Record<string, number>>;
  // notes[optionId][criteriaId] = justification/evidence notes
  notes?: Record<string, Record<string, string>>;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface SampleProjectAnalysis {
  recommendedOptionName: string;
  whyRecommended: string;
  keyStrengths: string[];
  tradeOffs: string;
  implementationAdvice: string;
}

export interface SampleProject extends Project {
  category: 'Kinh doanh' | 'Quản trị' | 'Công nghệ' | 'Marketing' | 'Đầu tư' | 'Vận hành';
  analysisRationale: SampleProjectAnalysis;
}

export interface WSMOptionResult {
  option: ProjectOption;
  totalScore: number; // weighted sum (max 5.0)
  percentageScore: number; // (totalScore / 5.0) * 100
  rank: number;
  criteriaScores: {
    criteriaId: string;
    criteriaName: string;
    rawScore: number;
    effectiveScore: number; // normalized (inverted if cost)
    criterionType: CriterionType;
    weight: number;
    weightedScore: number;
    note?: string;
  }[];
}

export interface CrossoverPoint {
  criteriaId: string;
  criteriaName: string;
  currentWeight: number;
  crossoverWeight: number;
  currentLeaderName: string;
  challengerName: string;
  isWithinBounds: boolean; // 0 <= crossoverWeight <= 100
  direction: 'increase' | 'decrease';
  explanation: string;
}

export interface WhatIfScenarioResult {
  id: string;
  name: string;
  description: string;
  weights: Record<string, number>;
  rankings: WSMOptionResult[];
  winnerName: string;
  isDominant?: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  proposal?: WsmProposalData;
}

export interface WsmProposalData {
  projectTitle: string;
  domain: string;
  problemDescription: string;
  options: string[];
  criteria: {
    name: string;
    weight: number;
    description?: string;
    type?: CriterionType;
  }[];
  weightRationale?: string;
}

export interface AiDetailedAnalysis {
  generatedAt: string;
  isCompleteData: boolean;
  dataCompletenessNote?: string;
  // 1. Ưu điểm, hạn chế và đánh đổi của từng phương án
  optionTradeoffs: {
    optionId: string;
    optionName: string;
    pros: string[];
    cons: string[];
    tradeOffSummary: string;
  }[];
  // 2. Giải thích nguyên nhân phương án xếp hạng cao nhất
  topOptionRationale: {
    topOptionName: string;
    scoreSummary: string;
    keyDrivingCriteria: string[];
    whyBetterThanRunnerUp: string;
  };
  // 3. Kết hợp kết quả đa chiều (Radar, Stacked Bar, 1-1, Crossover, What-If)
  multidimensionalInsights: {
    stackedBarInsight: string;
    radarInsight: string;
    headToHeadInsight: string;
    sensitivityInsight: string;
    whatIfInsight: string;
  };
  // 4. Phân tích rủi ro & Phương án giảm thiểu
  risksAndMitigations: {
    risk: string;
    impact: 'Cao' | 'Trung bình' | 'Thấp' | 'High' | 'Medium' | 'Low';
    affectedOption: string;
    mitigationStrategy: string;
  }[];
  // 5. Khuyến nghị cuối cùng & Điều kiện thay đổi khuyến nghị
  finalRecommendation: {
    recommendationText: string;
    confidenceLevel: string;
    triggerConditionsToReconsider: string[];
  };
  // 6. Kế hoạch thực thi theo từng giai đoạn
  implementationRoadmap: {
    phase: string;
    timeframe: string;
    tasks: string[];
    requiredResources: string[];
    expectedDeliverables: string;
  }[];
  // Raw markdown for quick copy & reading
  rawMarkdown: string;
}

export interface AiFollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

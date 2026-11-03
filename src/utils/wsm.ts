import {
  Project,
  ProjectCriteria,
  WSMOptionResult,
  CrossoverPoint,
  WhatIfScenarioResult,
  CriterionType,
} from '../types';

export const SCORE_DESCRIPTIONS: Record<number, { title: string; desc: string; badgeColor: string }> = {
  1: {
    title: '1 - Rất kém / Rủi ro cao',
    desc: 'Không đáp ứng yêu cầu, chi phí/rủi ro quá lớn hoặc chất lượng rất thấp.',
    badgeColor: 'text-red-700 bg-red-50 border-red-200',
  },
  2: {
    title: '2 - Kém / Dưới trung bình',
    desc: 'Đáp ứng một phần nhỏ, cần cải thiện nhiều, chi phí cao hoặc rủi ro đáng kể.',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  3: {
    title: '3 - Trung bình / Chấp nhận được',
    desc: 'Đạt yêu cầu tiêu chuẩn ở mức trung bình, đảm bảo vận hành.',
    badgeColor: 'text-slate-700 bg-slate-100 border-slate-200',
  },
  4: {
    title: '4 - Tốt / Đạt kỳ vọng',
    desc: 'Đáp ứng tốt các yêu cầu đề ra, vận hành ổn định, mang lại hiệu quả rõ rệt.',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  5: {
    title: '5 - Xuất sắc / Vượt trội',
    desc: 'Vượt trội hoàn toàn so với yêu cầu, tối ưu chi phí, hiệu năng cao nhất.',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
};

// Heatmap gradient color for matrix cells
export function getHeatmapColor(score: number): {
  bg: string;
  text: string;
  border: string;
  lightBg: string;
} {
  const rounded = Math.round(score);
  switch (rounded) {
    case 5:
      return {
        bg: 'bg-emerald-500 text-white',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        lightBg: 'bg-emerald-50/80',
      };
    case 4:
      return {
        bg: 'bg-blue-500 text-white',
        text: 'text-blue-800',
        border: 'border-blue-300',
        lightBg: 'bg-blue-50/80',
      };
    case 3:
      return {
        bg: 'bg-slate-400 text-white',
        text: 'text-slate-800',
        border: 'border-slate-300',
        lightBg: 'bg-slate-50/80',
      };
    case 2:
      return {
        bg: 'bg-amber-500 text-white',
        text: 'text-amber-800',
        border: 'border-amber-300',
        lightBg: 'bg-amber-50/80',
      };
    case 1:
    default:
      return {
        bg: 'bg-rose-500 text-white',
        text: 'text-rose-800',
        border: 'border-rose-300',
        lightBg: 'bg-rose-50/80',
      };
  }
}

export function validateWeights(criteria: ProjectCriteria[]): {
  isValid: boolean;
  sum: number;
  diff: number;
} {
  const sum = criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  const roundedSum = Math.round(sum * 10) / 10;
  const diff = Math.round((100 - roundedSum) * 10) / 10;
  return {
    isValid: Math.abs(100 - roundedSum) < 0.01,
    sum: roundedSum,
    diff,
  };
}

export function autoBalanceWeights(criteria: ProjectCriteria[]): ProjectCriteria[] {
  if (criteria.length === 0) return [];
  const baseWeight = Math.floor(100 / criteria.length);
  const remainder = 100 - baseWeight * criteria.length;

  return criteria.map((c, index) => ({
    ...c,
    weight: index === 0 ? baseWeight + remainder : baseWeight,
  }));
}

/**
 * Core WSM computation with Benefit/Cost normalization and cell notes
 */
export function calculateWSM(
  project: Project,
  overrideWeights?: Record<string, number>
): WSMOptionResult[] {
  const { options, criteria, scores, notes } = project;
  if (!options || options.length === 0) return [];

  // Effective weights map
  const effectiveWeights = new Map<string, number>();
  criteria.forEach((c) => {
    const w =
      overrideWeights && overrideWeights[c.id] !== undefined
        ? overrideWeights[c.id]
        : c.weight;
    effectiveWeights.set(c.id, Number(w) || 0);
  });

  const results: WSMOptionResult[] = options.map((option) => {
    const optScores = scores[option.id] || {};
    const optNotes = notes?.[option.id] || {};

    const criteriaScores = criteria.map((c) => {
      const rawScore = Number(optScores[c.id]) || 0;
      const criterionType: CriterionType = c.type === 'cost' ? 'cost' : 'benefit';

      // Normalization: If Cost criterion, inverted score is (6 - rawScore)
      const effectiveScore = criterionType === 'cost' ? Math.max(1, 6 - rawScore) : rawScore;

      const weight = effectiveWeights.get(c.id) || 0;
      const weightedScore = (weight / 100) * effectiveScore;

      return {
        criteriaId: c.id,
        criteriaName: c.name,
        rawScore,
        effectiveScore,
        criterionType,
        weight,
        weightedScore: Math.round(weightedScore * 1000) / 1000,
        note: optNotes[c.id],
      };
    });

    const totalScore = criteriaScores.reduce((sum, item) => sum + item.weightedScore, 0);
    const roundedTotal = Math.round(totalScore * 100) / 100;
    const percentageScore = Math.round((roundedTotal / 5.0) * 1000) / 10;

    return {
      option,
      totalScore: roundedTotal,
      percentageScore,
      rank: 0,
      criteriaScores,
    };
  });

  // Sort descending by totalScore
  results.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  let currentRank = 1;
  results.forEach((item, index) => {
    if (index > 0 && item.totalScore < results[index - 1].totalScore) {
      currentRank = index + 1;
    }
    item.rank = currentRank;
  });

  return results;
}

/**
 * Exact Mathematical Crossover Threshold Solution
 * Solves: S_A(w_k) = S_B(w_k) where remaining weights are proportionally scaled.
 */
export function calculateCrossoverThresholds(
  project: Project,
  overrideWeights?: Record<string, number>
): CrossoverPoint[] {
  const currentResults = calculateWSM(project, overrideWeights);
  if (currentResults.length < 2 || project.criteria.length < 2) return [];

  const leader = currentResults[0];
  const runnerUp = currentResults[1];

  const points: CrossoverPoint[] = [];

  project.criteria.forEach((c) => {
    const currentWeight =
      overrideWeights && overrideWeights[c.id] !== undefined
        ? overrideWeights[c.id]
        : c.weight;

    // Leader and runnerUp effective scores on this criterion
    const sA_k =
      leader.criteriaScores.find((cs) => cs.criteriaId === c.id)?.effectiveScore || 0;
    const sB_k =
      runnerUp.criteriaScores.find((cs) => cs.criteriaId === c.id)?.effectiveScore || 0;

    // Remaining weighted averages
    let sumWeightOther = 0;
    let sumScoreAOther = 0;
    let sumScoreBOther = 0;

    project.criteria.forEach((otherC) => {
      if (otherC.id !== c.id) {
        const wOther =
          overrideWeights && overrideWeights[otherC.id] !== undefined
            ? overrideWeights[otherC.id]
            : otherC.weight;
        sumWeightOther += wOther;

        const otherA =
          leader.criteriaScores.find((cs) => cs.criteriaId === otherC.id)?.effectiveScore || 0;
        const otherB =
          runnerUp.criteriaScores.find((cs) => cs.criteriaId === otherC.id)?.effectiveScore || 0;

        sumScoreAOther += (wOther / 100) * otherA;
        sumScoreBOther += (wOther / 100) * otherB;
      }
    });

    if (sumWeightOther <= 0) return;

    // Normalized average of other criteria
    const avgOtherA = (sumScoreAOther / sumWeightOther) * 100;
    const avgOtherB = (sumScoreBOther / sumWeightOther) * 100;

    // Equation:
    // S_A(w) = (w / 100) * sA_k + ((100 - w) / 100) * avgOtherA
    // S_B(w) = (w / 100) * sB_k + ((100 - w) / 100) * avgOtherB
    // Set S_A(w) = S_B(w)
    // w * (sA_k - avgOtherA) + 100 * avgOtherA = w * (sB_k - avgOtherB) + 100 * avgOtherB
    // w * [ (sA_k - avgOtherA) - (sB_k - avgOtherB) ] = 100 * [ avgOtherB - avgOtherA ]

    const denominator = (sA_k - avgOtherA) - (sB_k - avgOtherB);
    const numerator = 100 * (avgOtherB - avgOtherA);

    if (Math.abs(denominator) > 0.0001) {
      const crossoverW = Math.round((numerator / denominator) * 10) / 10;
      const isWithinBounds = crossoverW >= 0 && crossoverW <= 100;

      if (isWithinBounds) {
        const direction = crossoverW > currentWeight ? 'increase' : 'decrease';
        const explanation =
          direction === 'increase'
            ? `Nếu trọng số của "${c.name}" tăng từ ${currentWeight}% lên ${crossoverW}%, "${runnerUp.option.name}" sẽ vượt mặt "${leader.option.name}".`
            : `Nếu trọng số của "${c.name}" giảm từ ${currentWeight}% xuống ${crossoverW}%, "${runnerUp.option.name}" sẽ vươn lên dẫn đầu.`;

        points.push({
          criteriaId: c.id,
          criteriaName: c.name,
          currentWeight,
          crossoverWeight: crossoverW,
          currentLeaderName: leader.option.name,
          challengerName: runnerUp.option.name,
          isWithinBounds: true,
          direction,
          explanation,
        });
      }
    }
  });

  return points;
}

/**
 * Generate 4 Strategic What-If Scenarios:
 * 1. Current Baseline
 * 2. Cost-First (Heavier weights on cost/budget/pricing criteria)
 * 3. Quality-First (Heavier weights on capabilities, reliability, quality)
 * 4. Equal Weights (100 / N for every criteria)
 */
export function generateWhatIfScenarios(project: Project): {
  scenarios: WhatIfScenarioResult[];
  dominantWinnerName: string | null;
} {
  const { criteria } = project;
  if (!criteria || criteria.length === 0) {
    return { scenarios: [], dominantWinnerName: null };
  }

  // 1. Baseline
  const baselineWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    baselineWeights[c.id] = c.weight;
  });
  const baselineRankings = calculateWSM(project, baselineWeights);

  // 2. Cost-First: 2.5x multiplier on cost criteria or criteria with cost in name
  const rawCostWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    const isCost =
      c.type === 'cost' ||
      /chi phí|giá|ngân sách|cost|price|budget|tco/i.test(c.name);
    rawCostWeights[c.id] = c.weight * (isCost ? 2.5 : 0.6);
  });
  const sumCost = Object.values(rawCostWeights).reduce((a, b) => a + b, 0) || 1;
  const costWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    costWeights[c.id] = Math.round((rawCostWeights[c.id] / sumCost) * 1000) / 10;
  });
  const costRankings = calculateWSM(project, costWeights);

  // 3. Quality-First: 2.5x multiplier on performance/quality/feature criteria
  const rawQualityWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    const isQuality =
      c.type !== 'cost' &&
      /chất lượng|năng lực|hiệu quả|tính năng|bảo mật|hỗ trợ|quality|performance|feature/i.test(
        c.name
      );
    rawQualityWeights[c.id] = c.weight * (isQuality ? 2.5 : 0.6);
  });
  const sumQuality = Object.values(rawQualityWeights).reduce((a, b) => a + b, 0) || 1;
  const qualityWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    qualityWeights[c.id] = Math.round((rawQualityWeights[c.id] / sumQuality) * 1000) / 10;
  });
  const qualityRankings = calculateWSM(project, qualityWeights);

  // 4. Equal Weights
  const eqW = Math.round((100 / criteria.length) * 10) / 10;
  const equalWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    equalWeights[c.id] = eqW;
  });
  const equalRankings = calculateWSM(project, equalWeights);

  const scenarios: WhatIfScenarioResult[] = [
    {
      id: 'baseline',
      name: 'Cơ sở hiện tại (Current Baseline)',
      description: 'Đánh giá theo tỷ trọng trọng số gốc đã được cấu hình.',
      weights: baselineWeights,
      rankings: baselineRankings,
      winnerName: baselineRankings[0]?.option.name || '',
    },
    {
      id: 'cost_first',
      name: 'Thắt chặt ngân sách (Cost-First Focus)',
      description: 'Tăng 250% tỷ trọng các tiêu chí chi phí, giá thành và rủi ro.',
      weights: costWeights,
      rankings: costRankings,
      winnerName: costRankings[0]?.option.name || '',
    },
    {
      id: 'quality_first',
      name: 'Đẳng cấp chất lượng (Quality-First Focus)',
      description: 'Ưu tiên tối đa chất lượng, tính năng, hiệu năng và độ ổn định.',
      weights: qualityWeights,
      rankings: qualityRankings,
      winnerName: qualityRankings[0]?.option.name || '',
    },
    {
      id: 'equal_weights',
      name: 'Cân bằng đồng đều (Equal Weights)',
      description: 'Phân bổ trọng số cào bằng nhau cho tất cả các tiêu chí.',
      weights: equalWeights,
      rankings: equalRankings,
      winnerName: equalRankings[0]?.option.name || '',
    },
  ];

  // Check Dominant Strategy: is the winner the same in all 4 scenarios?
  const firstWinner = scenarios[0]?.winnerName;
  const isDominant =
    Boolean(firstWinner) && scenarios.every((s) => s.winnerName === firstWinner);

  if (isDominant && firstWinner) {
    scenarios.forEach((s) => (s.isDominant = true));
  }

  return {
    scenarios,
    dominantWinnerName: isDominant ? firstWinner : null,
  };
}

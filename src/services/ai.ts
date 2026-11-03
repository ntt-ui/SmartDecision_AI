import { WsmProposalData, Project, AiDetailedAnalysis, AiFollowUpMessage, WSMOptionResult, CrossoverPoint, WhatIfScenarioResult } from '../types';

export interface HealthCheckResponse {
  status: string;
  hasGeminiKey: boolean;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  proposal?: WsmProposalData;
  error?: string;
}

export async function checkAiHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      return { status: 'error', hasGeminiKey: false, timestamp: new Date().toISOString() };
    }
    return await res.json();
  } catch (e) {
    return { status: 'offline', hasGeminiKey: false, timestamp: new Date().toISOString() };
  }
}

// Helper to parse ```wsm_proposal ... ``` block if present in the text response
export function extractWsmProposal(text: string): { cleanText: string; proposal?: WsmProposalData } {
  const codeBlockRegex = /```wsm_proposal\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);

  if (!match) {
    return { cleanText: text };
  }

  try {
    const jsonStr = match[1];
    const proposal = JSON.parse(jsonStr) as WsmProposalData;
    const cleanText = text.replace(codeBlockRegex, '').trim();
    return { cleanText, proposal };
  } catch (e) {
    console.warn('Failed to parse wsm_proposal json block', e);
    return { cleanText: text };
  }
}

export async function sendAiChatMessage(
  messages: { role: string; content: string }[],
  projectContext?: any
): Promise<ChatResponse> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, projectContext }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi kết nối với máy chủ AI.');
  }

  const { cleanText, proposal } = extractWsmProposal(data.reply);
  return {
    reply: cleanText,
    proposal,
  };
}

export async function generateWsmFromProblem(params: {
  problemDescription: string;
  domain?: string;
  businessName?: string;
}): Promise<WsmProposalData> {
  const res = await fetch('/api/gemini/generate-wsm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi tạo cấu trúc WSM bằng AI.');
  }

  return {
    projectTitle: data.projectTitle || 'Dự án ra quyết định WSM',
    domain: params.domain || 'Lựa chọn phần mềm & giải pháp công nghệ',
    problemDescription: params.problemDescription,
    options: Array.isArray(data.options) ? data.options.map((o: any) => o.name || String(o)) : [],
    criteria: Array.isArray(data.criteria)
      ? data.criteria.map((c: any) => ({
          name: c.name,
          weight: Number(c.weight) || 0,
          description: c.description || '',
        }))
      : [],
    weightRationale: data.weightRationale || data.objectiveSummary,
  };
}

export async function analyzeProjectResultsWithAi(
  project: Project,
  wsmResults?: WSMOptionResult[],
  crossoverPoints?: CrossoverPoint[],
  whatIfScenarios?: { scenarios: WhatIfScenarioResult[]; dominantWinnerName: string | null },
  language: 'vi' | 'en' = 'vi'
): Promise<AiDetailedAnalysis> {
  const res = await fetch('/api/gemini/analyze-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project,
      wsmResults,
      crossoverPoints,
      whatIfScenarios,
      language,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi phân tích kết quả dự án.');
  }

  return data as AiDetailedAnalysis;
}

export async function sendAdvisoryFollowUp(
  messages: { role: string; content: string }[],
  project: Project,
  previousAnalysis?: AiDetailedAnalysis | null,
  language: 'vi' | 'en' = 'vi'
): Promise<string> {
  const res = await fetch('/api/gemini/advisor-followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      project,
      previousAnalysis,
      language,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi gửi câu hỏi tiếp theo cho Cố vấn AI.');
  }

  return data.reply || '';
}

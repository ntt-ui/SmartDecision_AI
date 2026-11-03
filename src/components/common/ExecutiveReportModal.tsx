import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  Copy,
  Check,
  Building2,
  Calendar,
  Trophy,
  Scale,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  Project,
  WSMOptionResult,
  CrossoverPoint,
  WhatIfScenarioResult,
  AiDetailedAnalysis,
} from '../../types';
import { RadarChart } from './RadarChart';
import { HeadToHeadComparison } from './HeadToHeadComparison';
import { Language, translations } from '../../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  effectiveResults: WSMOptionResult[];
  crossoverPoints: CrossoverPoint[];
  whatIfScenarios: { scenarios: WhatIfScenarioResult[]; dominantWinnerName: string | null };
  aiAnalysis: AiDetailedAnalysis | null;
  onTriggerAiAnalysis?: () => void;
  isAiLoading?: boolean;
  lang?: Language;
}

export const ExecutiveReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  project,
  effectiveResults,
  crossoverPoints,
  whatIfScenarios,
  aiAnalysis,
  onTriggerAiAnalysis,
  isAiLoading = false,
  lang = 'vi',
}) => {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!isOpen) return null;

  const topOption = effectiveResults[0];
  const runnerUp = effectiveResults[1];
  const marginDiff =
    topOption && runnerUp
      ? Math.round((topOption.totalScore - runnerUp.totalScore) * 100) / 100
      : 0;
  const marginPercent =
    topOption && runnerUp && runnerUp.totalScore > 0
      ? Math.round((marginDiff / runnerUp.totalScore) * 1000) / 10
      : 0;

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# BÁO CÁO ĐIỀU HÀNH RA QUYẾT ĐỊNH (EXECUTIVE DECISION REPORT)\n`;
    md += `SmartDecision AI Platform - Weighted Scoring Model (WSM)\n\n`;
    md += `## 1. THÔNG TIN DỰ ÁN\n`;
    md += `- Tên dự án: ${project.name}\n`;
    if (project.businessName) md += `- Doanh nghiệp / Tổ chức: ${project.businessName}\n`;
    md += `- Lĩnh vực: ${project.domain}\n`;
    md += `- Ngày lập báo cáo: ${new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}\n`;
    md += `- Bối cảnh & Vấn đề: ${project.problemDescription || 'N/A'}\n\n`;

    md += `## 2. KẾT QUẢ XẾP HẠNG PHƯƠNG ÁN WSM\n`;
    effectiveResults.forEach((r) => {
      md += `* Hạng #${r.rank}: **${r.option.name}** - Tổng điểm: **${r.totalScore.toFixed(2)} / 5.0** (${r.percentageScore}%)\n`;
    });
    if (topOption && runnerUp) {
      md += `\n* Mức chênh lệch chiến thắng (Margin): +${marginDiff} điểm (+${marginPercent}% so với ${runnerUp.option.name})\n`;
    }
    if (whatIfScenarios.dominantWinnerName) {
      md += `* Chiến lược vượt trội tuyệt đối (Dominant Strategy): "${whatIfScenarios.dominantWinnerName}" dẫn đầu trong mọi kịch bản thử nghiệm.\n`;
    }

    if (aiAnalysis?.finalRecommendation) {
      md += `\n## 3. KHUYẾN NGHỊ TỪ CỐ VẤN CHIẾN LƯỢC AI\n`;
      md += `${aiAnalysis.finalRecommendation.recommendationText}\n`;
      md += `- Độ tin cậy: ${aiAnalysis.finalRecommendation.confidenceLevel}\n`;
      if (aiAnalysis.finalRecommendation.triggerConditionsToReconsider?.length) {
        md += `- Điều kiện cân nhắc lại quyết định:\n`;
        aiAnalysis.finalRecommendation.triggerConditionsToReconsider.forEach((c) => {
          md += `  * ${c}\n`;
        });
      }
    }

    if (aiAnalysis?.implementationRoadmap?.length) {
      md += `\n## 4. KẾ HOẠCH THỰC THI THEO GIAI ĐOẠN\n`;
      aiAnalysis.implementationRoadmap.forEach((p) => {
        md += `### ${p.phase} (${p.timeframe})\n`;
        md += `* Công việc: ${p.tasks.join(', ')}\n`;
        md += `* Nguồn lực: ${p.requiredResources.join(', ')}\n`;
        md += `* Kết quả kỳ vọng: ${p.expectedDeliverables}\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    setShowExportMenu(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {lang === 'vi' ? 'Báo Cáo Điều Hành Ra Quyết Định' : 'Executive Decision Report Preview'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'vi' ? 'Tổng hợp toàn diện dữ liệu WSM, phân tích đa chiều và khuyến nghị Cố vấn AI' : 'Consolidated executive memo with WSM analytics and strategic AI advisory'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title={lang === 'vi' ? 'Sao chép văn bản báo cáo' : 'Copy report text'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? (lang === 'vi' ? 'Đã sao chép' : 'Copied!') : (lang === 'vi' ? 'Sao chép' : 'Copy Text')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
              title={lang === 'vi' ? 'In trực tiếp hoặc chọn Lưu dưới dạng PDF' : 'Print directly or Save as PDF'}
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <FileDown className="w-3.5 h-3.5 text-blue-200" />
              <span>{lang === 'vi' ? 'In / Xuất PDF' : 'Print / Export PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title={lang === 'vi' ? 'Đóng xem trước' : 'Close preview'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 md:p-10 overflow-y-auto space-y-8 bg-white print:p-0 print:overflow-visible">
          {/* Header Memo Style */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-blue-700">
                  SMARTDECISION AI • EXECUTIVE MEMORANDUM
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {project.name}
                </h1>
                {project.businessName && (
                  <p className="text-sm font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{project.businessName}</span>
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                <div>
                  <span className="font-medium text-slate-400">{lang === 'vi' ? 'Lĩnh vực:' : 'Domain:'}</span>{' '}
                  <strong className="text-slate-800">{project.domain}</strong>
                </div>
                <div>
                  <span className="font-medium text-slate-400">{lang === 'vi' ? 'Ngày lập:' : 'Date:'}</span>{' '}
                  <strong className="text-slate-800 font-mono">
                    {new Date(project.updatedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </strong>
                </div>
                <div>
                  <span className="font-medium text-slate-400">{lang === 'vi' ? 'Phương pháp:' : 'Methodology:'}</span>{' '}
                  <strong className="text-blue-700">Weighted Scoring Model (WSM)</strong>
                </div>
              </div>
            </div>

            {project.problemDescription && (
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block font-semibold mb-1">
                  {lang === 'vi' ? 'Bối cảnh & Mục tiêu quyết định:' : 'Context & Decision Objective:'}
                </strong>
                {project.problemDescription}
              </div>
            )}
          </div>

          {/* Section 1: Executive Summary & Winner Spotlight */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{lang === 'vi' ? '1. Kết Luận & Phương Án Tối Ưu Đề Xuất' : '1. Executive Decision Summary'}</span>
            </h2>

            {topOption && (
              <div className="p-5 rounded-xl border-2 border-blue-500 bg-blue-50/40 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700">
                      {lang === 'vi' ? 'PHƯƠNG ÁN XẾP HẠNG SỐ #1 (OPTIMAL CHOICE)' : 'HIGHEST RANKED ALTERNATIVE (#1)'}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                      {topOption.option.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {topOption.option.description || (lang === 'vi' ? 'Phương án đạt tổng điểm WSM cao nhất dựa trên ma trận trọng số.' : 'Highest overall weighted scoring alternative.')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-medium">{lang === 'vi' ? 'Điểm WSM Tổng hợp' : 'WSM Overall Score'}</div>
                      <div className="text-3xl font-extrabold text-blue-700 font-mono">
                        {topOption.totalScore.toFixed(2)}
                        <span className="text-sm text-slate-400 font-normal"> / 5.0</span>
                      </div>
                    </div>

                    {runnerUp && (
                      <div className="p-3 bg-white border border-blue-200 rounded-xl text-center shadow-xs">
                        <div className="text-[10px] text-slate-400 font-medium uppercase">{lang === 'vi' ? 'Chênh lệch (Margin)' : 'Victory Margin'}</div>
                        <div className="text-sm font-bold text-emerald-600 font-mono">
                          +{marginDiff}đ (+{marginPercent}%)
                        </div>
                        <div className="text-[10px] text-slate-400">vs {runnerUp.option.name}</div>
                      </div>
                    )}
                  </div>
                </div>

                {whatIfScenarios.dominantWinnerName && (
                  <div className="mt-3.5 pt-3 border-t border-blue-200/80 flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {lang === 'vi'
                        ? `Chiến lược vượt trội tuyệt đối (Dominant Strategy): "${whatIfScenarios.dominantWinnerName}" dẫn đầu trong cả 4 kịch bản chiến lược thử nghiệm.`
                        : `Dominant Strategy: "${whatIfScenarios.dominantWinnerName}" leads across all 4 strategic simulation scenarios.`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section 2: WSM Rankings Table */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>{lang === 'vi' ? '2. Bảng Xếp Hạng Toàn Bộ Phương Án' : '2. Complete Alternatives Ranking'}</span>
            </h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">Hạng</th>
                    <th className="py-2.5 px-3">Tên phương án</th>
                    <th className="py-2.5 px-3 text-right">Điểm WSM (/5.0)</th>
                    <th className="py-2.5 px-3 text-right">Tỷ lệ (%)</th>
                    <th className="py-2.5 px-3 text-center">Vị thế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {effectiveResults.map((r) => (
                    <tr key={r.option.id} className={r.rank === 1 ? 'bg-blue-50/30 font-semibold' : ''}>
                      <td className="py-2 px-3 text-center font-mono">
                        {r.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold">1</span>
                        ) : (
                          `#${r.rank}`
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-slate-900 font-medium">{r.option.name}</span>
                        {r.option.description && (
                          <span className="block text-[11px] text-slate-400 font-normal">{r.option.description}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {r.totalScore.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {r.percentageScore}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            r.rank === 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.rank === 2
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.rank === 1 ? (lang === 'vi' ? 'Quán quân' : 'Winner') : r.rank === 2 ? (lang === 'vi' ? 'Á quân' : 'Runner-up') : (lang === 'vi' ? 'Xem xét' : 'Alternative')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Visual Analytics (Radar & Sensitivity) */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>{lang === 'vi' ? '3. Phân Tích Năng Lực Đa Chiều & Độ Nhạy' : '3. Multidimensional Competency & Sensitivity'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  {lang === 'vi' ? 'Hồ sơ năng lực Radar (Spider Chart)' : 'Competency Radar Profile'}
                </h4>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <RadarChart
                    criteria={project.criteria}
                    options={project.options}
                    scores={project.scores}
                    lang={lang}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  {lang === 'vi' ? 'Phân tích Điểm Giao Cắt Đảo Chiều (Crossover Points)' : 'Crossover Threshold Analysis'}
                </h4>
                {crossoverPoints.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">
                    {lang === 'vi'
                      ? 'Phương án dẫn đầu giữ vững vị thế trong dải trọng số an toàn, không bị soán ngôi.'
                      : 'Leading alternative remains robust across typical weight variations.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {crossoverPoints.slice(0, 3).map((cp) => (
                      <div key={cp.criteriaId} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{cp.criteriaName}</span>
                          <span className="font-mono text-amber-700">Ngưỡng: {cp.crossoverWeight}%</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{cp.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: AI Strategic Advisor Recommendations */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{lang === 'vi' ? '4. Khuyến Nghị & Đánh Đổi Từ Cố Vấn AI' : '4. Strategic AI Advisory & Trade-Offs'}</span>
              </h2>

              {!aiAnalysis && onTriggerAiAnalysis && (
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={onTriggerAiAnalysis}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiLoading ? (lang === 'vi' ? 'Đang tạo...' : 'Generating...') : (lang === 'vi' ? 'Tạo nhận định AI' : 'Generate AI Advisory')}</span>
                </button>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-4">
                {/* Trade-offs of alternatives */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">
                    {lang === 'vi' ? 'Đánh đổi & So sánh các phương án:' : 'Trade-off Analysis:'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiAnalysis.optionTradeoffs?.map((item) => (
                      <div key={item.optionId} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2">
                        <strong className="text-slate-900 block font-bold">{item.optionName}</strong>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">{lang === 'vi' ? 'Ưu điểm:' : 'Pros:'}</span>
                          <ul className="list-disc list-inside text-[11px] text-slate-600">
                            {item.pros?.map((p, idx) => <li key={idx}>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-red-700 uppercase">{lang === 'vi' ? 'Hạn chế:' : 'Cons:'}</span>
                          <ul className="list-disc list-inside text-[11px] text-slate-600">
                            {item.cons?.map((c, idx) => <li key={idx}>{c}</li>)}
                          </ul>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-700 italic">
                          <strong>{lang === 'vi' ? 'Đánh đổi cốt lõi:' : 'Core trade-off:'}</strong> {item.tradeOffSummary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Recommendation & Trigger Conditions */}
                {aiAnalysis.finalRecommendation && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-emerald-900 text-sm">
                        {lang === 'vi' ? 'Khuyến nghị quyết định chính thức:' : 'Final Strategic Recommendation:'}
                      </strong>
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                        {lang === 'vi' ? 'Độ tin cậy:' : 'Confidence:'} {aiAnalysis.finalRecommendation.confidenceLevel}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      {aiAnalysis.finalRecommendation.recommendationText}
                    </p>

                    {aiAnalysis.finalRecommendation.triggerConditionsToReconsider?.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200/60">
                        <span className="font-semibold text-emerald-900 text-[11px] block mb-1">
                          {lang === 'vi' ? 'Điều kiện khiến khuyến nghị có thể thay đổi (Trigger Conditions):' : 'Conditions to Reconsider:'}
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                          {aiAnalysis.finalRecommendation.triggerConditionsToReconsider.map((cond, i) => (
                            <li key={i}>{cond}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Implementation Roadmap */}
                {aiAnalysis.implementationRoadmap?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === 'vi' ? 'Kế hoạch thực thi theo giai đoạn (Implementation Roadmap):' : 'Implementation Roadmap:'}
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 w-32">{lang === 'vi' ? 'Giai đoạn' : 'Phase'}</th>
                            <th className="py-2 px-3 w-28">{lang === 'vi' ? 'Thời gian' : 'Timeframe'}</th>
                            <th className="py-2 px-3">{lang === 'vi' ? 'Công việc cần làm' : 'Key Tasks'}</th>
                            <th className="py-2 px-3">{lang === 'vi' ? 'Kết quả kỳ vọng' : 'Deliverables'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {aiAnalysis.implementationRoadmap.map((p, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{p.phase}</td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{p.timeframe}</td>
                              <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                                {p.tasks?.join('; ')}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 text-[11px] font-medium">{p.expectedDeliverables}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                {lang === 'vi'
                  ? 'Chưa tạo phân tích AI chuyên sâu. Nhấn "Tạo nhận định AI" ở trên để tích hợp phân tích đa chiều vào báo cáo.'
                  : 'AI advisory analysis not yet generated. Click "Generate AI Advisory" to incorporate deep insights.'}
              </div>
            )}
          </section>

          {/* Section 5: Sign-off & Approvals (Executive Standard) */}
          <section className="pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              {lang === 'vi' ? 'Xác Nhận & Ký Duyệt Phê Chuẩn' : 'Sign-Off & Executive Approvals'}
            </h4>
            <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
              <div className="space-y-12">
                <div className="font-semibold text-slate-800">{lang === 'vi' ? 'Người lập báo cáo' : 'Prepared By'}</div>
                <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto" />
                <div className="text-[11px] text-slate-400">Bộ phận Phân tích / Project Lead</div>
              </div>
              <div className="space-y-12">
                <div className="font-semibold text-slate-800">{lang === 'vi' ? 'Hội đồng thẩm định' : 'Reviewed By'}</div>
                <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto" />
                <div className="text-[11px] text-slate-400">Ban Thẩm định / Finance & Ops</div>
              </div>
              <div className="space-y-12">
                <div className="font-semibold text-slate-800">{lang === 'vi' ? 'Tổng Giám đốc / Ban Lãnh đạo' : 'Approved By'}</div>
                <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto" />
                <div className="text-[11px] text-slate-400">CEO / Board of Directors</div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Control Footer (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            {lang === 'vi'
              ? 'Mẹo: Để lưu thành tệp PDF, trong hộp thoại in hãy chọn đích là "Lưu dưới dạng PDF" (Save as PDF).'
              : 'Tip: To export as PDF, select destination "Save as PDF" in your print dialog.'}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép nội dung' : 'Copy Content')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white" />
              <FileDown className="w-4 h-4 text-blue-200" />
              <span>{lang === 'vi' ? 'In / Xuất PDF ngay' : 'Print / Export PDF Now'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {lang === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

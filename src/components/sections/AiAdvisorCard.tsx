import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldAlert,
  Send,
  Bot,
  User,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Calendar,
  Briefcase,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  Project,
  WSMOptionResult,
  CrossoverPoint,
  WhatIfScenarioResult,
  AiDetailedAnalysis,
  AiFollowUpMessage,
} from '../../types';
import { analyzeProjectResultsWithAi, sendAdvisoryFollowUp } from '../../services/ai';
import { Language, translations } from '../../utils/i18n';

interface Props {
  project: Project;
  effectiveResults: WSMOptionResult[];
  crossoverPoints: CrossoverPoint[];
  whatIfScenarios: { scenarios: WhatIfScenarioResult[]; dominantWinnerName: string | null };
  aiAnalysis: AiDetailedAnalysis | null;
  onAnalysisUpdate: (analysis: AiDetailedAnalysis) => void;
  hasAiKey: boolean;
  lang?: Language;
}

export const AiAdvisorCard: React.FC<Props> = ({
  project,
  effectiveResults,
  crossoverPoints,
  whatIfScenarios,
  aiAnalysis,
  onAnalysisUpdate,
  hasAiKey,
  lang = 'vi',
}) => {
  const t = translations[lang];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'tradeoffs' | 'whyWon' | 'multidim' | 'risks' | 'recommendation' | 'roadmap'>('tradeoffs');

  // Follow-up chat state
  const [followUpMessages, setFollowUpMessages] = useState<AiFollowUpMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Check data completeness
  const totalOptions = project.options?.length || 0;
  const totalCriteria = project.criteria?.length || 0;
  const expectedCells = totalOptions * totalCriteria;
  let scoredCells = 0;
  project.options?.forEach((opt) => {
    project.criteria?.forEach((crit) => {
      if (project.scores?.[opt.id]?.[crit.id] !== undefined && project.scores[opt.id][crit.id] !== null) {
        scoredCells++;
      }
    });
  });
  const totalWeight = (project.criteria || []).reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  const isWeight100 = Math.abs(totalWeight - 100) < 0.5;
  const isAllCellsScored = scoredCells >= expectedCells && expectedCells > 0;
  const isCompleteData = isAllCellsScored && isWeight100;

  const handleRequestAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeProjectResultsWithAi(
        project,
        effectiveResults,
        crossoverPoints,
        whatIfScenarios,
        lang
      );
      onAnalysisUpdate(result);
    } catch (err: any) {
      setError(err.message || 'Lỗi phân tích kết quả bằng AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFollowUp = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || followUpInput.trim();
    if (!textToSend || isFollowUpLoading) return;

    const userMsg: AiFollowUpMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...followUpMessages, userMsg];
    setFollowUpMessages(nextMessages);
    if (!customText) setFollowUpInput('');
    setIsFollowUpLoading(true);

    try {
      const reply = await sendAdvisoryFollowUp(
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
        project,
        aiAnalysis,
        lang
      );

      const aiMsg: AiFollowUpMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setFollowUpMessages([...nextMessages, aiMsg]);
    } catch (err: any) {
      const errorMsg: AiFollowUpMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Lỗi kết nối khi gửi câu hỏi tiếp theo.'}`,
        timestamp: new Date().toISOString(),
      };
      setFollowUpMessages([...nextMessages, errorMsg]);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!aiAnalysis) return;
    navigator.clipboard.writeText(aiAnalysis.rawMarkdown);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const quickFollowUps = lang === 'vi' ? [
    'Nếu phương án á quân giảm giá 15% thì có lật ngược kết quả không?',
    'Rủi ro lớn nhất khi triển khai phương án #1 và cách phòng ngừa?',
    'Làm thế nào để thuyết phục Hội đồng Quản trị phê duyệt phương án tối ưu?',
  ] : [
    'What if the runner-up offers a 15% price cut?',
    'What is the highest risk of implementing alternative #1 and how to mitigate?',
    'How can we present and defend this recommendation to executive leadership?',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t.aiAnalysis}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'vi'
              ? 'Phân tích đa chiều, đánh đổi, rủi ro và xây dựng lộ trình thực thi dựa trên dữ liệu WSM thực tế'
              : 'Rigorous trade-off evaluation, risk matrix, and phased roadmap grounded in authentic WSM calculations'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {aiAnalysis && (
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Sao chép toàn bộ văn bản báo cáo"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedRaw ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép văn bản' : 'Copy Text')}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={handleRequestAnalysis}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? (lang === 'vi' ? 'AI đang phân tích...' : 'Analyzing...') : t.requestInDepthAdvisory}</span>
          </button>
        </div>
      </div>

      {/* Completeness Warning if matrix has empty cells or weights != 100 */}
      {!isCompleteData && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block mb-0.5">
              {lang === 'vi' ? 'Thông báo về tính hoàn thiện của dữ liệu:' : 'Data Completeness Notice:'}
            </strong>
            <p className="text-amber-800 leading-relaxed">
              {lang === 'vi'
                ? `Ma trận hiện có ${scoredCells}/${expectedCells} ô đã chấm điểm và tổng trọng số là ${totalWeight.toFixed(1)}%. Cố vấn AI sẽ đưa ra nhận định sơ bộ trên các số liệu hiện có, nhưng để đảm bảo tính chuẩn xác và khách quan tuyệt đối, khuyến nghị bạn chấm đủ 100% các ô.`
                : `Matrix currently has ${scoredCells}/${expectedCells} rated cells and total weight is ${totalWeight.toFixed(1)}%. AI will provide preliminary insights on current data, but complete evaluation requires all cells to be scored.`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Analysis Display */}
      {aiAnalysis ? (
        <div className="space-y-5">
          {/* Sub-tab navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('tradeoffs')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTab === 'tradeoffs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. {t.tradeOffAnalysis}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('whyWon')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTab === 'whyWon'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. {t.winnerRationale}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('multidim')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTab === 'multidim'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. {t.multidimensionalInsights}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('risks')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTab === 'risks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              4. {t.risksAndMitigation}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('recommendation')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTab === 'recommendation'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              5. {t.finalRecommendation}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              6. {t.implementationRoadmap}
            </button>
          </div>

          {/* Sub-tab 1: Option Trade-offs */}
          {activeSubTab === 'tradeoffs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {lang === 'vi' ? 'Phân tích Ưu điểm, Hạn chế & Đánh đổi của từng phương án' : 'Pros, Cons & Strategic Trade-offs per Alternative'}
                </h4>
                <span className="text-[11px] text-slate-500">{aiAnalysis.optionTradeoffs?.length} {t.optionsCount}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiAnalysis.optionTradeoffs?.map((item) => (
                  <div
                    key={item.optionId}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{item.optionName}</h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        ID: {item.optionId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {lang === 'vi' ? 'Ưu điểm nổi trội:' : 'Core Strengths:'}
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {item.pros?.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold shrink-0">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1 mb-1">
                        <XCircle className="w-3 h-3 text-red-600" />
                        {lang === 'vi' ? 'Hạn chế & Điểm yếu:' : 'Weaknesses & Bottlenecks:'}
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {item.cons?.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold shrink-0">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800">
                      <span className="font-bold text-blue-700 block text-[11px] uppercase mb-0.5">
                        {lang === 'vi' ? 'Đánh đổi phải chấp nhận:' : 'Critical Trade-off:'}
                      </span>
                      <p className="italic text-slate-600 text-[11px] leading-relaxed">
                        "{item.tradeOffSummary}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 2: Why #1 Won */}
          {activeSubTab === 'whyWon' && aiAnalysis.topOptionRationale && (
            <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-xs font-bold text-blue-950 uppercase">
                    {lang === 'vi' ? 'Lý giải nguyên nhân chiến thắng của phương án #1' : 'Why #1 Alternative Won'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {aiAnalysis.topOptionRationale.topOptionName}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-blue-100 rounded-lg text-xs text-slate-800 leading-relaxed">
                <strong className="block text-slate-900 font-semibold mb-1">
                  {lang === 'vi' ? 'Tổng quan điểm số & Tỷ trọng WSM:' : 'Score & WSM Weight Summary:'}
                </strong>
                {aiAnalysis.topOptionRationale.scoreSummary}
              </div>

              <div>
                <strong className="block text-xs font-semibold text-slate-900 mb-2">
                  {lang === 'vi' ? 'Các tiêu chí cốt lõi tạo ra lợi thế quyết định:' : 'Key Driving Criteria Creating Victory Advantage:'}
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiAnalysis.topOptionRationale.keyDrivingCriteria?.map((crit, idx) => (
                    <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                <strong className="block font-bold mb-1">
                  {lang === 'vi' ? 'So sánh với phương án Á quân:' : 'Why Superior to the Runner-Up:'}
                </strong>
                {aiAnalysis.topOptionRationale.whyBetterThanRunnerUp}
              </div>
            </div>
          )}

          {/* Sub-tab 3: Multidimensional Insights */}
          {activeSubTab === 'multidim' && aiAnalysis.multidimensionalInsights && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                {lang === 'vi' ? 'Tổng hợp nhận định từ 5 góc nhìn phân tích WSM' : 'Synthesized Insights from 5 Analytical Dimensions'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {lang === 'vi' ? 'Biểu đồ Cột Xếp Chồng' : 'Stacked Bar Breakdown'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiAnalysis.multidimensionalInsights.stackedBarInsight}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-purple-700 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    {lang === 'vi' ? 'Biểu đồ Radar Năng Lực Đa Chiều' : 'Radar Multi-axial Profile'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiAnalysis.multidimensionalInsights.radarInsight}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {lang === 'vi' ? 'So sánh Đối đầu Trực diện 1-1' : 'Head-to-Head 1-on-1 Delta'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiAnalysis.multidimensionalInsights.headToHeadInsight}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    {lang === 'vi' ? 'Độ nhạy & Điểm giao cắt (Crossover)' : 'Sensitivity & Crossover Thresholds'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiAnalysis.multidimensionalInsights.sensitivityInsight}
                  </p>
                </div>

                <div className="md:col-span-2 p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {lang === 'vi' ? '4 Kịch bản What-If & Chiến lược Vượt trội Tuyệt đối' : 'What-If Scenarios & Dominant Strategy'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiAnalysis.multidimensionalInsights.whatIfInsight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 4: Risks & Mitigations */}
          {activeSubTab === 'risks' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                {lang === 'vi' ? 'Ma trận Rủi ro Tiềm ẩn & Phương án Giảm thiểu' : 'Potential Risks & Mitigation Matrix'}
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-44">{lang === 'vi' ? 'Rủi ro nhận diện' : 'Identified Risk'}</th>
                      <th className="py-2.5 px-3 w-28">{lang === 'vi' ? 'Phương án bị ảnh hưởng' : 'Affected Option'}</th>
                      <th className="py-2.5 px-3 w-24 text-center">{lang === 'vi' ? 'Tác động' : 'Impact'}</th>
                      <th className="py-2.5 px-3">{lang === 'vi' ? 'Phương án giảm thiểu khuyến nghị' : 'Recommended Mitigation'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aiAnalysis.risksAndMitigations?.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{r.risk}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{r.affectedOption}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              r.impact === 'Cao' || r.impact === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : r.impact === 'Trung bình' || r.impact === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.impact}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 leading-relaxed">{r.mitigationStrategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 5: Final Recommendation & Trigger Conditions */}
          {activeSubTab === 'recommendation' && aiAnalysis.finalRecommendation && (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50/70 border-2 border-emerald-500 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                  <h4 className="text-sm font-bold text-emerald-950 uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'vi' ? 'Khuyến nghị quyết định cuối cùng có căn cứ' : 'Authoritative Final Recommendation'}</span>
                  </h4>
                  <div className="text-xs font-semibold text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                    {lang === 'vi' ? 'Độ tin cậy:' : 'Confidence:'} {aiAnalysis.finalRecommendation.confidenceLevel}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-900 leading-relaxed font-medium">
                  {aiAnalysis.finalRecommendation.recommendationText}
                </p>
              </div>

              {aiAnalysis.finalRecommendation.triggerConditionsToReconsider?.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'vi' ? 'Những điều kiện khiến khuyến nghị có thể thay đổi (Trigger Conditions):' : 'Conditions to Reconsider the Recommendation:'}</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {aiAnalysis.finalRecommendation.triggerConditionsToReconsider.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-amber-600 shrink-0">→</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 6: Phased Implementation Roadmap */}
          {activeSubTab === 'roadmap' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                {lang === 'vi' ? 'Kế hoạch Thực thi theo từng Giai đoạn' : 'Phased Implementation Roadmap'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {aiAnalysis.implementationRoadmap?.map((phase, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 uppercase">
                        {lang === 'vi' ? `Giai đoạn ${idx + 1}` : `Phase ${idx + 1}`}: {phase.phase}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {phase.timeframe}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{lang === 'vi' ? 'Công việc chính:' : 'Key Tasks:'}</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 mt-0.5">
                        {phase.tasks?.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{lang === 'vi' ? 'Nguồn lực cần thiết:' : 'Required Resources:'}</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {phase.requiredResources?.map((res, i) => (
                          <span key={i} className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-800">
                      <strong className="text-slate-900">{lang === 'vi' ? 'Kết quả kỳ vọng:' : 'Deliverable:'}</strong> {phase.expectedDeliverables}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Q&A Module */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {lang === 'vi' ? 'Trao đổi sâu hơn với Cố vấn AI về kết quả phân tích' : 'In-Depth Follow-Up Consultation with AI Advisor'}
              </h4>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {quickFollowUps.map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isFollowUpLoading}
                  onClick={() => handleSendFollowUp(undefined, promptText)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition-colors text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Conversation Thread */}
            {followUpMessages.length > 0 && (
              <div className="space-y-3 max-h-72 overflow-y-auto p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                {followUpMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))}
                {isFollowUpLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                    <Bot className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>{lang === 'vi' ? 'Cố vấn AI đang phân tích dữ liệu dự án để trả lời...' : 'AI Advisor is evaluating project context...'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Follow-up input form */}
            <form onSubmit={handleSendFollowUp} className="flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder={t.followUpQuestionPlaceholder}
                className="flex-1 text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isFollowUpLoading || !followUpInput.trim()}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendQuestion}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Empty State before triggering in-depth advisory */
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              {lang === 'vi' ? 'Chưa khởi tạo Báo cáo Tư vấn Chuyên sâu' : 'In-Depth Advisory Report Not Yet Generated'}
            </h4>
            <p className="text-slate-500 text-xs max-w-lg mx-auto mt-1 leading-relaxed">
              {lang === 'vi'
                ? 'Nhấn nút "Yêu cầu báo cáo tư vấn chuyên sâu" ở trên để AI phân tích 6 trụ cột: Đánh đổi từng phương án, Lý giải Quán quân, Góc nhìn đa chiều (Radar/Stacked/What-If), Quản trị rủi ro, Khuyến nghị & Điều kiện thay đổi, và Lộ trình thực thi.'
                : 'Click "Request In-Depth Advisory Report" to generate comprehensive trade-off analytics, multi-dimensional synthesis, risk mitigation, and implementation roadmap.'}
            </p>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleRequestAnalysis}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? (lang === 'vi' ? 'Đang phân tích...' : 'Analyzing...') : t.requestInDepthAdvisory}</span>
          </button>
        </div>
      )}
    </div>
  );
};

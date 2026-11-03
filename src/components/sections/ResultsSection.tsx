import React, { useState } from 'react';
import {
  Trophy,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  Printer,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Info,
  Scale,
  Swords,
  ShieldCheck,
  Layers,
  ArrowRight,
  Split,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, WSMOptionResult, AiDetailedAnalysis } from '../../types';
import {
  calculateWSM,
  validateWeights,
  calculateCrossoverThresholds,
  generateWhatIfScenarios,
} from '../../utils/wsm';
import { analyzeProjectResultsWithAi } from '../../services/ai';
import { RadarChart } from '../common/RadarChart';
import { HeadToHeadComparison } from '../common/HeadToHeadComparison';
import { ExecutiveReportModal } from '../common/ExecutiveReportModal';
import { AiAdvisorCard } from './AiAdvisorCard';
import { translations, Language } from '../../utils/i18n';

interface Props {
  project: Project;
  onNavigateMatrix: () => void;
  hasAiKey: boolean;
  lang?: Language;
}

export const ResultsSection: React.FC<Props> = ({
  project,
  onNavigateMatrix,
  hasAiKey,
  lang = 'vi',
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [aiDetailedAnalysis, setAiDetailedAnalysis] = useState<AiDetailedAnalysis | null>(null);
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState(false);

  // Active view tab in results: 'overview' | 'radar' | 'headtohead' | 'sensitivity' | 'whatif'
  const [activeAnalysisView, setActiveAnalysisView] = useState<
    'overview' | 'radar' | 'headtohead' | 'sensitivity' | 'whatif'
  >('overview');

  // Sensitivity Analysis interactive state
  const [sensitivityWeights, setSensitivityWeights] = useState<Record<string, number>>({});
  const isSensitivityActive = Object.keys(sensitivityWeights).length > 0;

  const weightValidation = validateWeights(project.criteria);
  const effectiveResults = calculateWSM(
    project,
    isSensitivityActive ? sensitivityWeights : undefined
  );

  const topOption = effectiveResults[0];
  const runnerUp = effectiveResults[1];

  // Victory margin
  const marginDiff =
    topOption && runnerUp
      ? Math.round((topOption.totalScore - runnerUp.totalScore) * 100) / 100
      : 0;
  const marginPercent =
    topOption && runnerUp && runnerUp.totalScore > 0
      ? Math.round((marginDiff / runnerUp.totalScore) * 1000) / 10
      : 0;

  // Crossover Thresholds
  const crossoverPoints = calculateCrossoverThresholds(
    project,
    isSensitivityActive ? sensitivityWeights : undefined
  );

  // What-If Scenarios
  const { scenarios, dominantWinnerName } = generateWhatIfScenarios(project);

  const handleWeightSliderChange = (criteriaId: string, val: number) => {
    setSensitivityWeights((prev) => ({
      ...prev,
      [criteriaId]: val,
    }));
  };

  const handleResetSensitivity = () => {
    setSensitivityWeights({});
  };

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  const handleCopyReport = () => {
    let report = `BÁO CÁO PHÂN TÍCH RA QUYẾT ĐỊNH WSM - SMARTDECISION AI\n`;
    report += `==============================================\n`;
    report += `Dự án: ${project.name}\n`;
    if (project.businessName) report += `Doanh nghiệp: ${project.businessName}\n`;
    report += `Lĩnh vực: ${project.domain}\n`;
    report += `Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}\n\n`;

    report += `BẢNG XẾP HẠNG PHƯƠNG ÁN:\n`;
    effectiveResults.forEach((res) => {
      report += `Hạng ${res.rank}: ${res.option.name} - Điểm WSM: ${res.totalScore.toFixed(2)}/5.0 (${res.percentageScore}%)\n`;
    });

    if (topOption && runnerUp) {
      report += `\nMức chênh lệch chiến thắng: +${marginDiff} điểm (+${marginPercent}% so với ${runnerUp.option.name})\n`;
    }

    if (dominantWinnerName) {
      report += `CHIẾN LƯỢC VƯỢT TRỘI TUYỆT ĐỐI (Dominant Strategy): "${dominantWinnerName}" dẫn đầu trong mọi kịch bản giả định (Cơ sở, Ngân sách, Chất lượng, Cân bằng)!\n`;
    }

    report += `\nCHI TIẾT TRỌNG SỐ TIÊU CHÍ:\n`;
    project.criteria.forEach((c) => {
      const w =
        isSensitivityActive && sensitivityWeights[c.id] !== undefined
          ? sensitivityWeights[c.id]
          : c.weight;
      report += `- ${c.name} (${c.type === 'cost' ? 'Chi phí' : 'Lợi ích'}): ${w}%\n`;
    });

    if (topOption) {
      report += `\nKẾT LUẬN: Phương án tối ưu khuyến nghị là "${topOption.option.name}".\n`;
    }

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Warning if weight is not 100% */}
      {!weightValidation.isValid && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">
                {lang === 'vi' ? 'Chú ý về tổng trọng số:' : 'Weight Notice:'}
              </strong>
              {lang === 'vi'
                ? `Tổng trọng số hiện tại là ${weightValidation.sum}% (cần đúng 100%). Bạn có thể quay lại mục Ma trận để cân bằng tự động.`
                : `Current weight sum is ${weightValidation.sum}% (should be 100%). You can return to Matrix to auto-balance.`}
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateMatrix}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
          >
            {lang === 'vi' ? 'Sửa ma trận' : 'Edit Matrix'}
          </button>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 font-mono">
            <span>{t.resultsTitle.toUpperCase()}</span>
            <span>·</span>
            <span>{project.domain}</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-0.5">{project.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'vi'
              ? `So sánh ${project.options.length} phương án qua ${project.criteria.length} tiêu chí trọng số WSM`
              : `Evaluating ${project.options.length} alternatives across ${project.criteria.length} weighted criteria`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title={lang === 'vi' ? 'Sao chép nhanh tóm tắt kết quả' : 'Copy quick summary'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">{lang === 'vi' ? 'Đã sao chép!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.copyReport}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExecutiveModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow cursor-pointer border border-blue-500/30"
            title={lang === 'vi' ? 'Xem trước và In/Xuất Báo cáo điều hành chuẩn A4 / PDF' : 'Preview & Print/Export Executive Report A4 / PDF'}
          >
            <FileText className="w-4 h-4 text-blue-100" />
            <span className="font-bold">{t.executiveReport}</span>
          </button>
        </div>
      </div>

      {/* Winner Spotlight Card with Margin & Dominant Strategy */}
      {topOption && (
        <div className="bg-linear-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
            <Trophy className="w-56 h-56" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                {t.winnerBadge}
              </span>

              {runnerUp && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30">
                  <TrendingUp className="w-3 h-3" />
                  {lang === 'vi'
                    ? `Cách biệt +${marginDiff} điểm (+${marginPercent}% so với ${runnerUp.option.name})`
                    : `Lead margin +${marginDiff} pts (+${marginPercent}% vs ${runnerUp.option.name})`}
                </span>
              )}

              {dominantWinnerName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/25 text-amber-200 text-xs font-bold border border-amber-300/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  {t.dominantStrategy}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 pt-1">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {topOption.option.name}
              </h3>
              <div className="text-blue-200 text-sm font-mono">
                {lang === 'vi' ? 'Tổng điểm: ' : 'Total Score: '}
                <strong className="text-white text-xl tabular-nums">
                  {topOption.totalScore.toFixed(2)}
                </strong>{' '}
                / 5.0 ({topOption.percentageScore}%)
              </div>
            </div>

            {topOption.option.description && (
              <p className="text-xs text-blue-100 leading-relaxed max-w-2xl">
                {topOption.option.description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerConfetti}
                className="px-3.5 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                🎉 {lang === 'vi' ? 'Ăn mừng chiến thắng tối ưu' : 'Celebrate Winner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Visual Analysis Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Sub-navigation tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveAnalysisView('overview')}
            className={`pb-3 text-xs font-semibold px-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeAnalysisView === 'overview'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.stackedChart}</span>
            {activeAnalysisView === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('radar')}
            className={`pb-3 text-xs font-semibold px-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeAnalysisView === 'radar'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.radarChart}</span>
            {activeAnalysisView === 'radar' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('headtohead')}
            className={`pb-3 text-xs font-semibold px-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeAnalysisView === 'headtohead'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{t.headToHead}</span>
            {activeAnalysisView === 'headtohead' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('sensitivity')}
            className={`pb-3 text-xs font-semibold px-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeAnalysisView === 'sensitivity'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.sensitivity}</span>
            {activeAnalysisView === 'sensitivity' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('whatif')}
            className={`pb-3 text-xs font-semibold px-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeAnalysisView === 'whatif'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{t.whatIfScenarios}</span>
            {activeAnalysisView === 'whatif' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Tab 1: Stacked Bar Chart Overview */}
        {activeAnalysisView === 'overview' && (
          <div className="p-5 space-y-4">
            <div className="space-y-4">
              {effectiveResults.map((res) => {
                const isWinner = res.rank === 1;
                const barWidthPercent = (res.totalScore / 5.0) * 100;

                return (
                  <div key={res.option.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            isWinner
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{res.rank}
                        </span>
                        <span className="font-semibold text-slate-900">{res.option.name}</span>
                      </div>
                      <div className="font-mono text-xs text-slate-700">
                        <strong className="text-blue-700">{res.totalScore.toFixed(2)}</strong> / 5.0
                        <span className="text-slate-400 ml-1.5">({res.percentageScore}%)</span>
                      </div>
                    </div>

                    {/* Progress bar with criteria stacked contributions */}
                    <div className="w-full bg-slate-100 rounded-lg h-7 p-1 flex items-center overflow-hidden border border-slate-200/80">
                      <div
                        style={{ width: `${Math.min(100, Math.max(5, barWidthPercent))}%` }}
                        className="h-full rounded-md flex overflow-hidden transition-all duration-300"
                      >
                        {res.criteriaScores.map((cScore, idx) => {
                          const shareOfTotal =
                            res.totalScore > 0 ? (cScore.weightedScore / res.totalScore) * 100 : 0;
                          return (
                            <div
                              key={cScore.criteriaId}
                              style={{ width: `${shareOfTotal}%` }}
                              className={`h-full ${
                                idx % 4 === 0
                                  ? 'bg-blue-600'
                                  : idx % 4 === 1
                                  ? 'bg-indigo-500'
                                  : idx % 4 === 2
                                  ? 'bg-sky-500'
                                  : 'bg-teal-500'
                              } transition-all`}
                              title={`${cScore.criteriaName}: ${cScore.weightedScore.toFixed(2)}đ (Điểm gốc: ${cScore.rawScore}/5)`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-0.5">
                      {res.criteriaScores.map((cs) => (
                        <span key={cs.criteriaId}>
                          {cs.criteriaName}:{' '}
                          <strong className="text-slate-700">{cs.rawScore}/5</strong> (
                          {cs.weightedScore.toFixed(2)}đ)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Criteria Color Legend */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                {lang === 'vi' ? 'Tiêu chí đánh giá:' : 'Criteria:'}
              </span>
              {project.criteria.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-sm ${
                      idx % 4 === 0
                        ? 'bg-blue-600'
                        : idx % 4 === 1
                        ? 'bg-indigo-500'
                        : idx % 4 === 2
                        ? 'bg-sky-500'
                        : 'bg-teal-500'
                    }`}
                  />
                  <span>
                    {c.name} ({c.weight}%{c.type === 'cost' ? ' · Chi phí' : ''})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Spider / Radar Chart */}
        {activeAnalysisView === 'radar' && (
          <div className="p-6">
            <RadarChart
              criteria={project.criteria}
              options={project.options}
              scores={project.scores}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 3: Head-to-Head 1-on-1 */}
        {activeAnalysisView === 'headtohead' && (
          <div className="p-6">
            <HeadToHeadComparison project={project} results={effectiveResults} lang={lang} />
          </div>
        )}

        {/* Tab 4: Dynamic Sensitivity & Crossover Thresholds */}
        {activeAnalysisView === 'sensitivity' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {lang === 'vi' ? 'Kéo thanh trượt kiểm thử độ nhạy' : 'Simulate Sensitivity Weights'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'vi'
                    ? 'Điều chỉnh trọng số để quan sát sự xáo trộn thứ hạng ngay lập tức.'
                    : 'Adjust weights dynamically to observe ranking changes in real time.'}
                </p>
              </div>

              {isSensitivityActive && (
                <button
                  type="button"
                  onClick={handleResetSensitivity}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Khôi phục trọng số ban đầu' : 'Reset Weights'}</span>
                </button>
              )}
            </div>

            {/* Crossover Threshold Automated Equation Solver */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>
                  {lang === 'vi'
                    ? 'Giải phương trình tìm Điểm giao cắt đảo chiều (Crossover Threshold)'
                    : 'Mathematical Crossover Inversion Points'}
                </span>
              </div>

              {crossoverPoints.length > 0 ? (
                <div className="space-y-2">
                  {crossoverPoints.map((cp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-blue-200/80 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-blue-950 font-semibold">{cp.criteriaName}</strong>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          Điểm đảo chiều: {cp.crossoverWeight}%
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {cp.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-800 leading-relaxed">
                  {lang === 'vi'
                    ? 'Không có điểm giao cắt trong dải trọng số 0-100%: Phương án dẫn đầu hoàn toàn áp đảo phương án thứ 2 ở mọi biến động trọng số hợp lý!'
                    : 'No crossover threshold within 0-100% range: The leader dominates the runner-up under all plausible weights!'}
                </p>
              )}
            </div>

            {/* Sliders grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.criteria.map((crit) => {
                const currentVal =
                  sensitivityWeights[crit.id] !== undefined
                    ? sensitivityWeights[crit.id]
                    : crit.weight;

                return (
                  <div
                    key={crit.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {crit.name}{' '}
                        {crit.type === 'cost' && (
                          <span className="text-[10px] text-amber-700 font-normal">
                            ({lang === 'vi' ? 'Chi phí' : 'Cost'})
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-bold text-blue-700">{currentVal}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentVal}
                      onChange={(e) =>
                        handleWeightSliderChange(crit.id, parseInt(e.target.value, 10))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0%</span>
                      <span>Trọng số gốc: {crit.weight}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Strategic What-If Scenarios */}
        {activeAnalysisView === 'whatif' && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {lang === 'vi'
                    ? 'Mô phỏng 4 Kịch bản Chiến lược Ra Quyết định'
                    : '4 Strategic What-If Simulation Scenarios'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'vi'
                    ? 'Đánh giá tính bền vững của quyết định qua các bối cảnh: Ngân sách eo hẹp, Đòi hỏi chất lượng cao và Phân bổ cào bằng.'
                    : 'Test the robustness of your decision across budget austerity, premium quality, and equal distribution.'}
                </p>
              </div>

              {dominantWinnerName && (
                <div className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>
                    {lang === 'vi'
                      ? `Chiến lược vượt trội: "${dominantWinnerName}"`
                      : `Dominant Strategy: "${dominantWinnerName}"`}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((sc) => {
                const winner = sc.rankings[0];
                return (
                  <div
                    key={sc.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{sc.name}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sc.description}</p>
                      </div>
                      {sc.isDominant && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                          {lang === 'vi' ? 'Vượt trội' : 'Dominant'}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {lang === 'vi' ? 'Phương án dẫn đầu:' : 'Leading Alternative:'}
                      </span>
                      <strong className="text-xs text-blue-700 font-bold font-mono">
                        {winner?.option.name} ({winner?.totalScore.toFixed(2)}/5.0)
                      </strong>
                    </div>

                    <div className="space-y-1 pt-1">
                      {sc.rankings.map((r) => (
                        <div
                          key={r.option.id}
                          className="flex items-center justify-between text-[11px] text-slate-600"
                        >
                          <span className="truncate">
                            #{r.rank} {r.option.name}
                          </span>
                          <span className="font-mono text-slate-800">
                            {r.totalScore.toFixed(2)}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upgraded In-Depth AI Advisor (Trade-offs, Risks, Multidimensional, Roadmap, Follow-Up) */}
      <AiAdvisorCard
        project={project}
        effectiveResults={effectiveResults}
        crossoverPoints={crossoverPoints}
        whatIfScenarios={{ scenarios, dominantWinnerName }}
        aiAnalysis={aiDetailedAnalysis}
        onAnalysisUpdate={(analysis) => setAiDetailedAnalysis(analysis)}
        hasAiKey={hasAiKey}
        lang={lang}
      />

      {/* Executive Report Modal Preview */}
      <ExecutiveReportModal
        isOpen={isExecutiveModalOpen}
        onClose={() => setIsExecutiveModalOpen(false)}
        project={project}
        effectiveResults={effectiveResults}
        crossoverPoints={crossoverPoints}
        whatIfScenarios={{ scenarios, dominantWinnerName }}
        aiAnalysis={aiDetailedAnalysis}
        onTriggerAiAnalysis={async () => {
          try {
            const res = await analyzeProjectResultsWithAi(
              project,
              effectiveResults,
              crossoverPoints,
              { scenarios, dominantWinnerName },
              lang
            );
            setAiDetailedAnalysis(res);
          } catch (e) {
            console.error(e);
          }
        }}
        lang={lang}
      />
    </div>
  );
};

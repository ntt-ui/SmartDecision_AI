import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  HelpCircle,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  FileText,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Project, ProjectCriteria, CriterionType } from '../../types';
import {
  validateWeights,
  autoBalanceWeights,
  calculateWSM,
  getHeatmapColor,
} from '../../utils/wsm';
import { ScoreScaleGuide } from '../common/ScoreScaleGuide';
import { CellNoteModal } from '../common/CellNoteModal';
import { translations, Language } from '../../utils/i18n';

interface Props {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateResults: () => void;
  lang?: Language;
}

export const MatrixSection: React.FC<Props> = ({
  project,
  onUpdateProject,
  onNavigateResults,
  lang = 'vi',
}) => {
  const t = translations[lang];
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeNoteCell, setActiveNoteCell] = useState<{
    optionId: string;
    optionName: string;
    criteriaId: string;
    criteriaName: string;
  } | null>(null);

  const { criteria, options, scores, notes = {} } = project;
  const weightStatus = validateWeights(criteria);
  const results = calculateWSM(project);

  // Criteria actions
  const handleAddCriteria = () => {
    const nextIdx = criteria.length + 1;
    const newCriteria: ProjectCriteria = {
      id: `crit-${Date.now()}-${nextIdx}`,
      name: `${lang === 'vi' ? 'Tiêu chí' : 'Criteria'} ${nextIdx}`,
      weight: 10,
      description: '',
      type: 'benefit',
    };
    const updated = {
      ...project,
      criteria: [...criteria, newCriteria],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
  };

  const handleUpdateCriteria = (id: string, field: keyof ProjectCriteria, value: any) => {
    const updated = {
      ...project,
      criteria: criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
  };

  const handleRemoveCriteria = (id: string) => {
    if (criteria.length <= 1) {
      alert(lang === 'vi' ? 'Ma trận cần tối thiểu 1 tiêu chí để đánh giá.' : 'Matrix requires at least 1 criterion.');
      return;
    }
    const updated = {
      ...project,
      criteria: criteria.filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
  };

  const handleAutoBalance = () => {
    const balanced = autoBalanceWeights(criteria);
    onUpdateProject({
      ...project,
      criteria: balanced,
      updatedAt: new Date().toISOString(),
    });
  };

  // Score editing
  const handleScoreChange = (optionId: string, criteriaId: string, newScore: number) => {
    const currentScores = project.scores || {};
    const optScores = { ...(currentScores[optionId] || {}) };
    optScores[criteriaId] = Math.min(5, Math.max(1, newScore));

    const updatedScores = {
      ...currentScores,
      [optionId]: optScores,
    };

    onUpdateProject({
      ...project,
      scores: updatedScores,
      status: weightStatus.isValid ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString(),
    });
  };

  // Note saving
  const handleSaveNote = (optionId: string, criteriaId: string, noteContent: string) => {
    const currentNotes = { ...(project.notes || {}) };
    const optNotes = { ...(currentNotes[optionId] || {}) };

    if (noteContent) {
      optNotes[criteriaId] = noteContent;
    } else {
      delete optNotes[criteriaId];
    }

    currentNotes[optionId] = optNotes;

    onUpdateProject({
      ...project,
      notes: currentNotes,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Project Banner & WSM Weight Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 font-mono uppercase tracking-wider">
                {t.matrixTitle}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{project.domain}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-0.5">{project.name}</h2>
            {project.businessName && (
              <p className="text-xs text-slate-500">
                {lang === 'vi' ? 'Doanh nghiệp: ' : 'Organization: '}
                {project.businessName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.scoreGuide}</span>
            </button>
            <button
              type="button"
              onClick={handleAutoBalance}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.autoBalance}</span>
            </button>
          </div>
        </div>

        {/* Weight Allocation Status Bar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>{t.totalWeight}:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  weightStatus.isValid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {weightStatus.sum}% / 100%
              </span>
            </div>

            <div className="text-[11px]">
              {weightStatus.isValid ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'vi' ? 'Đã đạt chuẩn 100%' : 'Balanced to 100%'}
                </span>
              ) : weightStatus.diff > 0 ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lang === 'vi' ? `Còn thiếu ${weightStatus.diff}%` : `Remaining: ${weightStatus.diff}%`}
                </span>
              ) : (
                <span className="text-red-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lang === 'vi' ? `Vượt quá ${Math.abs(weightStatus.diff)}%` : `Exceeded: ${Math.abs(weightStatus.diff)}%`}
                </span>
              )}
            </div>
          </div>

          {/* Visual progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
            {criteria.map((c, i) => (
              <div
                key={c.id}
                style={{ width: `${Math.min(100, Math.max(0, c.weight))}%` }}
                className={`h-full transition-all ${
                  i % 4 === 0
                    ? 'bg-blue-600'
                    : i % 4 === 1
                    ? 'bg-indigo-500'
                    : i % 4 === 2
                    ? 'bg-sky-500'
                    : 'bg-teal-500'
                }`}
                title={`${c.name}: ${c.weight}%`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs px-1 text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">{t.heatmapLegend}:</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            5 - {lang === 'vi' ? 'Tối ưu' : 'Optimal'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-800 font-bold border border-sky-300">
            4 - {lang === 'vi' ? 'Tốt' : 'Good'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-bold border border-slate-300">
            3 - {lang === 'vi' ? 'Trung bình' : 'Avg'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300">
            2 - {lang === 'vi' ? 'Kém' : 'Poor'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold border border-rose-300">
            1 - {lang === 'vi' ? 'Rất kém' : 'Very Poor'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 italic">
          {lang === 'vi'
            ? '(*) Tiêu chí Chi phí / Rủi ro được tự động đảo chiều để tính điểm chuẩn xác.'
            : '(*) Cost / Risk criteria are auto-inverted for mathematical accuracy.'}
        </span>
      </div>

      {/* WSM Interactive Evaluation Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t.matrixTitle}
            </h3>
            <p className="text-[11px] text-slate-500">
              {t.matrixSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCriteria}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addCriteria}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-4 font-semibold w-72 min-w-[220px]">
                  {t.criteriaName} & {t.typeLabel}
                </th>
                <th className="py-3 px-3 font-semibold text-center w-28 min-w-[100px]">
                  {t.weight} (%)
                </th>
                {options.map((opt) => (
                  <th key={opt.id} className="py-3 px-4 font-semibold min-w-[150px] text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color || '#2563eb' }}
                      />
                      <span className="truncate max-w-[130px]" title={opt.name}>
                        {opt.name}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-2 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criteria.map((crit) => {
                const isCost = crit.type === 'cost';

                return (
                  <tr key={crit.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Criteria Name, Description & Type Selector */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={crit.name}
                          onChange={(e) => handleUpdateCriteria(crit.id, 'name', e.target.value)}
                          className="w-full text-xs font-semibold text-slate-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-1 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder={lang === 'vi' ? 'Mô tả tiêu chí...' : 'Description...'}
                          value={crit.description || ''}
                          onChange={(e) =>
                            handleUpdateCriteria(crit.id, 'description', e.target.value)
                          }
                          className="w-full text-[11px] text-slate-500 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 focus:outline-none"
                        />

                        {/* Criterion Type Toggle: Benefit vs Cost */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCriteria(
                                crit.id,
                                'type',
                                isCost ? 'benefit' : 'cost'
                              )
                            }
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors flex items-center gap-1 ${
                              isCost
                                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            }`}
                            title={
                              isCost
                                ? t.costType
                                : t.benefitType
                            }
                          >
                            {isCost ? (
                              <>
                                <TrendingDown className="w-3 h-3 text-amber-600" />
                                <span>{t.cost}</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                <span>{t.benefit}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Weight Input */}
                    <td className="py-3 px-3 align-middle text-center">
                      <div className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={crit.weight}
                          onChange={(e) =>
                            handleUpdateCriteria(crit.id, 'weight', parseFloat(e.target.value) || 0)
                          }
                          className="w-12 text-center font-mono font-bold text-xs text-blue-700 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-mono">%</span>
                      </div>
                    </td>

                    {/* Option Scores with Heatmap & Notes */}
                    {options.map((opt) => {
                      const currentScore = scores?.[opt.id]?.[crit.id] || 3;
                      const effectiveScore = isCost ? Math.max(1, 6 - currentScore) : currentScore;
                      const heatmap = getHeatmapColor(effectiveScore);
                      const hasNote = Boolean(notes?.[opt.id]?.[crit.id]);

                      return (
                        <td
                          key={opt.id}
                          className={`py-3 px-3 align-middle text-center border-x border-slate-100/60 transition-colors ${heatmap.lightBg}`}
                        >
                          <div className="inline-flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <select
                                value={currentScore}
                                onChange={(e) =>
                                  handleScoreChange(opt.id, crit.id, parseInt(e.target.value, 10))
                                }
                                className={`text-xs font-bold font-mono rounded-lg border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs ${heatmap.border} bg-white ${heatmap.text}`}
                              >
                                <option value="1">1 - {lang === 'vi' ? 'Rất kém' : 'Very Poor'}</option>
                                <option value="2">2 - {lang === 'vi' ? 'Kém' : 'Poor'}</option>
                                <option value="3">3 - {lang === 'vi' ? 'Trung bình' : 'Avg'}</option>
                                <option value="4">4 - {lang === 'vi' ? 'Tốt' : 'Good'}</option>
                                <option value="5">5 - {lang === 'vi' ? 'Xuất sắc' : 'Optimal'}</option>
                              </select>

                              {/* Audit Note Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveNoteCell({
                                    optionId: opt.id,
                                    optionName: opt.name,
                                    criteriaId: crit.id,
                                    criteriaName: crit.name,
                                  })
                                }
                                className={`p-1 rounded-md transition-colors ${
                                  hasNote
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                                }`}
                                title={
                                  hasNote
                                    ? `${t.auditNotes}: ${notes?.[opt.id]?.[crit.id]}`
                                    : t.addNote
                                }
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono">
                              {isCost ? (
                                <span title="Đã đảo chiều vì là tiêu chí Chi phí">
                                  Quy đổi: <strong>{effectiveScore}</strong>đ ·{' '}
                                  {((crit.weight / 100) * effectiveScore).toFixed(2)}đ
                                </span>
                              ) : (
                                <span>{((crit.weight / 100) * effectiveScore).toFixed(2)}đ</span>
                              )}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Delete Criteria Button */}
                    <td className="py-3 px-2 text-center align-middle">
                      <button
                        type="button"
                        title={lang === 'vi' ? 'Xóa tiêu chí này' : 'Delete criteria'}
                        onClick={() => handleRemoveCriteria(crit.id)}
                        className="p-1.5 text-slate-300 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total WSM Score Summary Row */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300 font-semibold text-slate-900">
                <td className="py-3.5 px-4 font-bold text-xs uppercase text-slate-800">
                  {lang === 'vi' ? 'Tổng điểm WSM (Thang 5.0)' : 'Total WSM Score (Max 5.0)'}
                </td>
                <td className="py-3.5 px-3 text-center font-mono text-xs">
                  <span
                    className={`font-bold ${
                      weightStatus.isValid ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {weightStatus.sum}%
                  </span>
                </td>
                {options.map((opt) => {
                  const optRes = results.find((r) => r.option.id === opt.id);
                  const isTop = optRes?.rank === 1 && weightStatus.isValid;

                  return (
                    <td key={opt.id} className="py-3.5 px-3 text-center border-x border-slate-200">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            isTop ? 'text-emerald-700 text-base' : 'text-slate-800'
                          }`}
                        >
                          {optRes ? optRes.totalScore.toFixed(2) : '0.00'} / 5.0
                        </span>
                        {weightStatus.isValid && optRes && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              isTop ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {lang === 'vi' ? `Hạng #${optRes.rank}` : `Rank #${optRes.rank}`}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="py-3 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Matrix Footer Navigation */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {weightStatus.isValid ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'vi'
                  ? 'Tổng trọng số đạt 100%. Đã sẵn sàng xem phân tích và biểu đồ chi tiết!'
                  : 'Total weight is exactly 100%. Ready for analytics and breakdown!'}
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {lang === 'vi'
                  ? 'Vui lòng cân đối tổng trọng số bằng đúng 100% để hoàn thành đánh giá.'
                  : 'Please balance total weight to 100% to finalize evaluation.'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onNavigateResults}
            className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs ${
              weightStatus.isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>{t.viewResults}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ScoreScaleGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Cell Justification / Audit Note Modal */}
      {activeNoteCell && (
        <CellNoteModal
          isOpen={Boolean(activeNoteCell)}
          optionName={activeNoteCell.optionName}
          criteriaName={activeNoteCell.criteriaName}
          initialNote={notes?.[activeNoteCell.optionId]?.[activeNoteCell.criteriaId] || ''}
          onSave={(note) => {
            handleSaveNote(activeNoteCell.optionId, activeNoteCell.criteriaId, note);
            setActiveNoteCell(null);
          }}
          onClose={() => setActiveNoteCell(null)}
          lang={lang}
        />
      )}
    </div>
  );
};

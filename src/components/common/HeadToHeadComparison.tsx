import React, { useState } from 'react';
import { Project, WSMOptionResult } from '../../types';
import { calculateWSM } from '../../utils/wsm';
import { Swords, Check, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  project: Project;
  results: WSMOptionResult[];
  lang?: 'vi' | 'en';
}

export const HeadToHeadComparison: React.FC<Props> = ({ project, results, lang = 'vi' }) => {
  const { options, criteria, scores, notes } = project;

  const [opt1Id, setOpt1Id] = useState<string>(options[0]?.id || '');
  const [opt2Id, setOpt2Id] = useState<string>(options[1]?.id || options[0]?.id || '');

  if (options.length < 2) return null;

  const res1 = results.find((r) => r.option.id === opt1Id);
  const res2 = results.find((r) => r.option.id === opt2Id);

  const score1 = res1?.totalScore || 0;
  const score2 = res2?.totalScore || 0;
  const diff = Math.round((score1 - score2) * 100) / 100;
  const percentDiff = score2 > 0 ? Math.round(((score1 - score2) / score2) * 1000) / 10 : 0;

  return (
    <div className="space-y-4">
      {/* Selector Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'vi' ? 'Phương án A (Đối chiếu)' : 'Alternative A (Benchmark)'}
          </label>
          <select
            value={opt1Id}
            onChange={(e) => setOpt1Id(e.target.value)}
            className="w-full text-xs font-semibold rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'vi' ? 'Phương án B (Đối thủ cạnh tranh)' : 'Alternative B (Challenger)'}
          </label>
          <select
            value={opt2Id}
            onChange={(e) => setOpt2Id(e.target.value)}
            className="w-full text-xs font-semibold rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Head to Head Verdict */}
      {res1 && res2 && opt1Id !== opt2Id && (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            diff > 0
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : diff < 0
              ? 'bg-blue-50/80 border-blue-200 text-blue-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-blue-600 shrink-0">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-sm">
                {diff > 0
                  ? `${res1.option.name} ${lang === 'vi' ? 'chiếm ưu thế' : 'leads'} (+${diff} pts / +${percentDiff}%)`
                  : diff < 0
                  ? `${res2.option.name} ${lang === 'vi' ? 'chiếm ưu thế' : 'leads'} (+${Math.abs(diff)} pts)`
                  : lang === 'vi'
                  ? 'Hai phương án ngang điểm tuyệt đối'
                  : 'Both alternatives are perfectly tied'}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {res1.option.name}: <strong className="font-mono">{score1.toFixed(2)}</strong> vs{' '}
                {res2.option.name}: <strong className="font-mono">{score2.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Criteria by Criteria Breakdown Table */}
      {res1 && res2 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-4 font-semibold">{lang === 'vi' ? 'Tiêu chí' : 'Criteria'}</th>
                <th className="py-2.5 px-3 text-center font-semibold w-24">
                  {lang === 'vi' ? 'Trọng số' : 'Weight'}
                </th>
                <th className="py-2.5 px-4 text-center font-semibold">{res1.option.name}</th>
                <th className="py-2.5 px-4 text-center font-semibold">{res2.option.name}</th>
                <th className="py-2.5 px-4 text-center font-semibold w-28">
                  {lang === 'vi' ? 'Chênh lệch' : 'Difference'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criteria.map((c) => {
                const s1 = res1.criteriaScores.find((cs) => cs.criteriaId === c.id);
                const s2 = res2.criteriaScores.find((cs) => cs.criteriaId === c.id);

                const eff1 = s1?.effectiveScore || 0;
                const eff2 = s2?.effectiveScore || 0;
                const delta = Math.round((eff1 - eff2) * 10) / 10;
                const weightedDelta =
                  Math.round(((c.weight / 100) * (eff1 - eff2)) * 100) / 100;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.type === 'cost'
                          ? lang === 'vi'
                            ? 'Chi phí/Rủi ro (Đã đảo chiều)'
                            : 'Cost/Risk (Inverted)'
                          : lang === 'vi'
                          ? 'Lợi ích'
                          : 'Benefit'}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                      {c.weight}%
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {s1?.rawScore}/5
                      {c.type === 'cost' && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (Quy đổi: {eff1})
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {s2?.rawScore}/5
                      {c.type === 'cost' && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (Quy đổi: {eff2})
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono font-bold">
                      {delta > 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          +{weightedDelta} ({res1.option.name})
                        </span>
                      ) : delta < 0 ? (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          +{Math.abs(weightedDelta)} ({res2.option.name})
                        </span>
                      ) : (
                        <span className="text-slate-400">0.0 (Hòa)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

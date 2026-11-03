import React from 'react';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';
import { SCORE_DESCRIPTIONS } from '../../utils/wsm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreScaleGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Hướng dẫn thang điểm đánh giá (1 - 5)</h3>
              <p className="text-xs text-slate-500">Quy chuẩn định lượng chấm điểm trong mô hình WSM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
          {Object.entries(SCORE_DESCRIPTIONS).map(([score, info]) => (
            <div
              key={score}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${info.badgeColor}`}>
                  {info.title}
                </span>
                <span className="text-xs text-slate-400 font-mono">Điểm: {score}/5</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{info.desc}</p>
            </div>
          ))}

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-blue-900">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Công thức tính điểm WSM:
            </div>
            <p className="text-blue-700 leading-relaxed">
              <strong>Tổng điểm phương án</strong> = ∑ (Trọng số tiêu chí % × Điểm đánh giá 1-5). Thang điểm tối đa là 5.0 (tương đương 100%).
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};

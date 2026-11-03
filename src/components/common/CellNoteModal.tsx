import React, { useState } from 'react';
import { FileText, X, Check, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  optionName: string;
  criteriaName: string;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
  lang?: 'vi' | 'en';
}

export const CellNoteModal: React.FC<Props> = ({
  isOpen,
  optionName,
  criteriaName,
  initialNote,
  onSave,
  onClose,
  lang = 'vi',
}) => {
  const [note, setNote] = useState(initialNote);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-xs md:text-sm">
                {lang === 'vi' ? 'Căn cứ thẩm định & Ghi chú' : 'Audit Evidence & Justification'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {optionName} · {criteriaName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-800">
            {lang === 'vi'
              ? 'Tài liệu dẫn chứng / Lý do chấm điểm'
              : 'Documentation / Scoring Justification'}
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              lang === 'vi'
                ? 'Nhập căn cứ chứng thực (ví dụ: Báo giá hợp đồng số 42/2026, kết quả kiểm thử thực tế, cam kết SLA bảo hành...)'
                : 'Enter justification (e.g., Quotation Ref #42/2026, trial test results, SLA commitment...)'
            }
            className="w-full text-xs rounded-lg border border-slate-300 p-3 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {initialNote ? (
            <button
              type="button"
              onClick={() => {
                onSave('');
                onClose();
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Xóa ghi chú' : 'Delete note'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(note.trim());
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Lưu căn cứ' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

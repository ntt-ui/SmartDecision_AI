import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Project } from '../../types';
import { validateImportJson, ImportValidationResult } from '../../utils/storage';

interface Props {
  isOpen: boolean;
  existingProjects: Project[];
  onClose: () => void;
  onImportSuccess: (importedProjects: Project[], resolution: 'overwrite' | 'keep_both' | 'skip') => void;
}

export const JsonImportModal: React.FC<Props> = ({
  isOpen,
  existingProjects,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [conflictAction, setConflictAction] = useState<'keep_both' | 'overwrite' | 'skip'>('keep_both');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImportJson(content, existingProjects);
      setValidation(result);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setValidation({
        valid: false,
        projects: [],
        error: 'Không thể đọc tệp tin đã chọn.',
        duplicates: [],
      });
      setIsProcessing(false);
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = () => {
    if (!validation || !validation.valid || validation.projects.length === 0) return;
    onImportSuccess(validation.projects, conflictAction);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setValidation(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Nhập dữ liệu dự án từ tệp JSON</h3>
              <p className="text-xs text-slate-500">Khôi phục hoặc chuyển đổi dữ liệu WSM an toàn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-800">Nhấp để chọn tệp sao lưu .JSON</p>
              <p className="text-xs text-slate-500 mt-1">Định dạng tệp xuất chuẩn của SmartDecision AI</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-600 hover:text-red-600 font-medium px-2 py-1"
                >
                  Đổi tệp
                </button>
              </div>

              {isProcessing && (
                <div className="text-center py-4 text-xs text-slate-500">
                  Đang kiểm tra tính hợp lệ của cấu trúc dữ liệu...
                </div>
              )}

              {validation && !validation.valid && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Tệp không hợp lệ:</strong>
                    {validation.error}
                  </div>
                </div>
              )}

              {validation && validation.valid && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Đã xác thực thành công <strong>{validation.projects.length}</strong> dự án sẵn sàng nhập.
                    </span>
                  </div>

                  {validation.duplicates.length > 0 && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Phát hiện {validation.duplicates.length} dự án bị trùng tên hoặc mã ID:
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                        {validation.duplicates.map((d, i) => (
                          <li key={i} className="truncate">
                            "{d.incoming.name}"
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 border-t border-amber-200 space-y-1.5">
                        <p className="font-medium text-amber-950">Chọn hướng xử lý khi trùng lặp:</p>
                        <div className="space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="conflict"
                              value="keep_both"
                              checked={conflictAction === 'keep_both'}
                              onChange={() => setConflictAction('keep_both')}
                              className="text-blue-600"
                            />
                            <span>Giữ cả hai (Tự động đổi tên bản sao mới kèm hậu tố "_Imported")</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="conflict"
                              value="overwrite"
                              checked={conflictAction === 'overwrite'}
                              onChange={() => setConflictAction('overwrite')}
                              className="text-blue-600"
                            />
                            <span className="text-red-700 font-medium">Ghi đè dự án cũ bằng dự án mới</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="conflict"
                              value="skip"
                              checked={conflictAction === 'skip'}
                              onChange={() => setConflictAction('skip')}
                              className="text-blue-600"
                            />
                            <span>Bỏ qua các dự án bị trùng, chỉ thêm dự án mới</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!validation || !validation.valid || validation.projects.length === 0}
            onClick={handleConfirmImport}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Tiến hành nhập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

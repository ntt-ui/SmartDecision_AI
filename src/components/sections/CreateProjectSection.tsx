import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  FolderPlus,
  Check,
  Building2,
  HelpCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Project, ProjectOption } from '../../types';
import { INDUSTRY_DOMAINS } from '../../utils/sampleData';
import { generateWsmFromProblem } from '../../services/ai';
import { translations, Language } from '../../utils/i18n';

interface Props {
  editingProject: Project | null;
  onSaveProject: (project: Project) => void;
  onCancelEdit?: () => void;
  hasAiKey: boolean;
  lang?: Language;
}

const DEFAULT_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777'];

export const CreateProjectSection: React.FC<Props> = ({
  editingProject,
  onSaveProject,
  onCancelEdit,
  hasAiKey,
  lang = 'vi',
}) => {
  const t = translations[lang];
  const [name, setName] = useState(editingProject?.name || '');
  const [businessName, setBusinessName] = useState(editingProject?.businessName || '');
  const [domain, setDomain] = useState(editingProject?.domain || INDUSTRY_DOMAINS[0]);
  const [customDomain, setCustomDomain] = useState('');
  const [problemDescription, setProblemDescription] = useState(editingProject?.problemDescription || '');
  
  const [options, setOptions] = useState<ProjectOption[]>(
    editingProject?.options || [
      { id: 'opt-1', name: 'Phương án A', description: '', color: DEFAULT_COLORS[0] },
      { id: 'opt-2', name: 'Phương án B', description: '', color: DEFAULT_COLORS[1] },
      { id: 'opt-3', name: 'Phương án C', description: '', color: DEFAULT_COLORS[2] },
    ]
  );

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setBusinessName(editingProject.businessName || '');
      if (INDUSTRY_DOMAINS.includes(editingProject.domain)) {
        setDomain(editingProject.domain);
        setCustomDomain('');
      } else {
        setDomain('Lĩnh vực khác');
        setCustomDomain(editingProject.domain);
      }
      setProblemDescription(editingProject.problemDescription);
      setOptions(editingProject.options);
    }
  }, [editingProject]);

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    const newOpt: ProjectOption = {
      id: `opt-${Date.now()}-${nextIdx}`,
      name: `Phương án ${String.fromCharCode(64 + nextIdx)}`,
      description: '',
      color: DEFAULT_COLORS[(nextIdx - 1) % DEFAULT_COLORS.length],
    };
    setOptions([...options, newOpt]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      setValidationError('Cần ít nhất 2 phương án để so sánh và ra quyết định.');
      return;
    }
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleUpdateOption = (id: string, field: 'name' | 'description', value: string) => {
    setOptions(
      options.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const handleAiAutoFill = async () => {
    if (!problemDescription.trim()) {
      setAiError('Vui lòng nhập mô tả vấn đề/tình huống để AI có dữ liệu phân tích.');
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const activeDomain = domain === 'Lĩnh vực khác' ? customDomain : domain;
      const proposal = await generateWsmFromProblem({
        problemDescription,
        domain: activeDomain,
        businessName,
      });

      if (proposal.projectTitle && !name) {
        setName(proposal.projectTitle);
      }

      if (proposal.options && proposal.options.length > 0) {
        const newOptions: ProjectOption[] = proposal.options.map((optName, idx) => ({
          id: `opt-ai-${idx + 1}`,
          name: optName,
          description: `Đề xuất bởi AI cho bài toán ${activeDomain}`,
          color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        }));
        setOptions(newOptions);
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi khi yêu cầu AI tạo cấu trúc.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Vui lòng nhập Tên dự án.');
      return;
    }

    const finalDomain = domain === 'Lĩnh vực khác' ? customDomain.trim() || 'Lĩnh vực khác' : domain;

    if (options.length < 2) {
      setValidationError('Mô hình WSM cần tối thiểu 2 phương án để so sánh.');
      return;
    }

    for (const opt of options) {
      if (!opt.name.trim()) {
        setValidationError('Tên các phương án không được để trống.');
        return;
      }
    }

    // Default criteria if brand new project
    const initialCriteria = editingProject?.criteria?.length
      ? editingProject.criteria
      : [
          { id: 'crit-1', name: 'Chi phí đầu tư & vận hành (TCO)', weight: 25, description: 'Ngân sách ban đầu và định kỳ' },
          { id: 'crit-2', name: 'Hiệu quả đáp ứng mục tiêu', weight: 35, description: 'Mức độ giải quyết vấn đề cốt lõi' },
          { id: 'crit-3', name: 'Thời gian & Độ phức tạp triển khai', weight: 20, description: 'Tiến độ đưa vào vận hành' },
          { id: 'crit-4', name: 'Mức độ rủi ro & Bảo mật', weight: 20, description: 'An toàn dữ liệu và rủi ro gián đoạn' },
        ];

    const project: Project = {
      id: editingProject?.id || `proj-${Date.now()}`,
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      domain: finalDomain,
      problemDescription: problemDescription.trim(),
      options,
      criteria: initialCriteria,
      scores: editingProject?.scores || {},
      status: editingProject?.status || 'in_progress',
      createdAt: editingProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSample: false,
    };

    onSaveProject(project);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              {editingProject ? t.editTitle : t.createTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.createSubtitle}
            </p>
          </div>

          {editingProject && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              {t.cancelEdit}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tên dự án ra quyết định <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Lựa chọn phần mềm CRM cho chuỗi bán lẻ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tên doanh nghiệp (Không bắt buộc)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: Công ty TNHH Bán lẻ Toàn Cầu..."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Domain Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Lĩnh vực hoạt động <span className="text-red-500">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {INDUSTRY_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {domain === 'Lĩnh vực khác' && (
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nhập lĩnh vực tùy chỉnh
                </label>
                <input
                  type="text"
                  placeholder="VD: Năng lượng tái tạo, Y tế, Giáo dục..."
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Problem Description with AI Support Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Mô tả vấn đề cần giải quyết & Mục tiêu
              </label>
              <button
                type="button"
                disabled={isAiGenerating}
                onClick={handleAiAutoFill}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 hover:underline disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI đề xuất phương án từ mô tả</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Mô tả bối cảnh hiện tại, mục tiêu cần đạt được, các giới hạn về ngân sách hoặc thời gian..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {aiError && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {aiError}
              </p>
            )}
          </div>

          {/* Options Manager */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Các phương án cần so sánh ({options.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Thêm ít nhất 2 giải pháp, phần mềm hoặc phương án thay thế để đưa vào ma trận WSM
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phương án</span>
              </button>
            </div>

            <div className="space-y-3">
              {options.map((opt, index) => (
                <div
                  key={opt.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3"
                >
                  <div
                    className="w-3 h-10 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: opt.color || '#2563eb' }}
                    title={`Màu đại diện: ${opt.name}`}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                        Tên phương án #{index + 1}
                      </label>
                      <input
                        type="text"
                        required
                        value={opt.name}
                        onChange={(e) => handleUpdateOption(opt.id, 'name', e.target.value)}
                        placeholder={`VD: Phương án ${index + 1}`}
                        className="w-full text-xs font-medium rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                        Mô tả ngắn gọn đặc điểm
                      </label>
                      <input
                        type="text"
                        value={opt.description || ''}
                        onChange={(e) => handleUpdateOption(opt.id, 'description', e.target.value)}
                        placeholder="VD: Chi phí thấp nhưng cần tự cài đặt, hoặc giải pháp SaaS trọn gói..."
                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Xóa phương án này"
                    onClick={() => handleRemoveOption(opt.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>{editingProject ? 'Lưu thay đổi & Chuyển sang Ma trận' : 'Tạo dự án & Thiết lập Ma trận WSM'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

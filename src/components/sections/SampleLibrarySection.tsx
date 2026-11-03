import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ArrowRight,
  Copy,
  Eye,
  X,
  Trophy,
  CheckCircle2,
  BarChart3,
  Scale,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  TableProperties,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { SampleProject } from '../../types';
import { SAMPLE_PROJECTS_LIBRARY } from '../../utils/sampleData';
import { calculateWSM } from '../../utils/wsm';

interface Props {
  onUseSample: (sample: SampleProject) => void;
}

const CATEGORIES = ['Tất cả', 'Kinh doanh', 'Quản trị', 'Công nghệ', 'Marketing', 'Đầu tư', 'Vận hành'];

const CATEGORY_STYLES: Record<string, React.CSSProperties> = {
  'Tất cả': { fontWeight: 'bold' },
  'Kinh doanh': { backgroundColor: '#f8fbf1', fontWeight: 'bold' },
  'Quản trị': { backgroundColor: '#fbf4d2', fontWeight: 'bold' },
  'Công nghệ': { backgroundColor: '#cef9d6', fontWeight: 'bold' },
  'Marketing': { backgroundColor: '#b5ffeb', fontWeight: 'bold' },
  'Đầu tư': { backgroundColor: '#b9e0fe', fontWeight: 'bold' },
  'Vận hành': { backgroundColor: '#e8ddfc', fontWeight: 'bold' },
};

const CARD_STYLES: Record<number, { card?: React.CSSProperties; badge?: React.CSSProperties }> = {
  0: { card: { backgroundColor: '#f8fbf1' } },
  1: { card: { backgroundColor: '#e8ddfc' }, badge: { backgroundColor: '#e9d5f8', color: '#19096c' } },
  2: { card: { backgroundColor: '#cef9d6' }, badge: { backgroundColor: '#c8f4d8', color: '#1f600e' } },
  3: { card: { backgroundColor: '#cef9d6' }, badge: { backgroundColor: '#c8f4d8', color: '#0a5129' } },
  4: { card: { backgroundColor: '#b9e0fe' }, badge: { backgroundColor: '#dff4fb', color: '#044662' } },
  5: { card: { backgroundColor: '#f8fbf1' } },
  6: { card: { backgroundColor: '#b5ffeb' }, badge: { backgroundColor: '#d3fdf9', color: '#0e634e' } },
  7: { card: { backgroundColor: '#fbf4d2' } },
};

export const SampleLibrarySection: React.FC<Props> = ({ onUseSample }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewingProject, setPreviewingProject] = useState<SampleProject | null>(null);

  // Filter projects by category and search term
  const filteredProjects = SAMPLE_PROJECTS_LIBRARY.filter((p) => {
    const matchesCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.businessName && p.businessName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div
        className="border border-slate-200 rounded-xl p-6 shadow-xs"
        style={{ backgroundColor: '#fadede' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <BookOpen
                className="w-4 h-4"
                style={{ backgroundColor: '#fadede', color: '#cb2411' }}
              />
              <span style={{ color: '#940404', backgroundColor: '#fadede' }}>
                Thư viện tri thức WSM thực tiễn
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Thư viện dự án mẫu ra quyết định
            </h1>
            <p
              className="text-xs md:text-sm leading-relaxed"
              style={{ fontFamily: 'Arial', color: '#280214' }}
            >
              Tổng hợp các tình huống ra quyết định điển hình trong doanh nghiệp (chọn phần mềm, nhà cung cấp, công nghệ, mặt bằng, tiếp thị...).
              Bạn có thể xem chi tiết cách tính điểm ma trận WSM hoặc sao chép mẫu vào danh mục dự án cá nhân để tùy biến.
            </p>
          </div>

          <div
            className="px-3.5 py-2 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2.5 shrink-0"
            style={{ backgroundColor: '#e7eef8' }}
          >
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>{SAMPLE_PROJECTS_LIBRARY.length}</strong> bài toán mẫu chuẩn hóa sẵn sàng
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: '#f8fafc' }}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const customCatStyle = CATEGORY_STYLES[cat] || {};
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                style={customCatStyle}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm kiếm dự án mẫu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3.5 py-1.5 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ fontWeight: 'bold' }}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredProjects.map((item, index) => {
          const results = calculateWSM(item);
          const topOption = results[0];
          const cardCustom = CARD_STYLES[index] || {};

          return (
            <div
              key={item.id}
              className="border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              style={{ backgroundColor: '#ffffff', ...cardCustom.card }}
            >
              <div className="space-y-3">
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-blue-200"
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        ...cardCustom.badge,
                      }}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 truncate">{item.domain}</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                    Dữ liệu mẫu
                  </span>
                </div>

                {/* Title & Business */}
                <div>
                  <h3
                    onClick={() => setPreviewingProject(item)}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {item.name}
                  </h3>
                  {item.businessName && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.businessName}</span>
                    </p>
                  )}
                </div>

                {/* Problem snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.problemDescription}
                </p>

                {/* Winner spotlight badge */}
                {topOption && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        Phương án đề xuất:
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        {topOption.totalScore.toFixed(2)} / 5.0
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">
                      {item.analysisRationale?.recommendedOptionName || topOption.option.name}
                    </p>
                  </div>
                )}

                {/* Quantitative structure */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{item.options.length}</strong> phương án so sánh
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{item.criteria.length}</strong> tiêu chí (100%)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewingProject(item)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xem chi tiết</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUseSample(item)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sử dụng mẫu này</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">
            Không tìm thấy dự án mẫu nào phù hợp với từ khóa "{searchTerm}".
          </p>
        </div>
      )}

      {/* Comprehensive Detail Preview Modal */}
      {previewingProject && (
        <SampleDetailModal
          project={previewingProject}
          onClose={() => setPreviewingProject(null)}
          onUseSample={() => {
            const p = previewingProject;
            setPreviewingProject(null);
            onUseSample(p);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Detail Preview Modal for Sample Project
interface DetailModalProps {
  project: SampleProject;
  onClose: () => void;
  onUseSample: () => void;
}

const SampleDetailModal: React.FC<DetailModalProps> = ({
  project,
  onClose,
  onUseSample,
}) => {
  const results = calculateWSM(project);
  const topOption = results[0];
  const rationale = project.analysisRationale;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  {project.category}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{project.domain}</span>
              </div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 mt-0.5 truncate max-w-lg">
                {project.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Context & Problem statement */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Bối cảnh doanh nghiệp & Mục tiêu ra quyết định
            </h4>
            {project.businessName && (
              <p className="text-xs text-slate-500 font-medium">
                Doanh nghiệp khảo sát: <strong className="text-slate-800">{project.businessName}</strong>
              </p>
            )}
            <p className="text-xs text-slate-700 leading-relaxed">
              {project.problemDescription}
            </p>
          </div>

          {/* Winner spotlight analysis card */}
          {topOption && rationale && (
            <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-semibold">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  Phương án được khuyến nghị lựa chọn
                </span>
                <span className="font-mono text-xs text-blue-200">
                  Điểm WSM: <strong className="text-white text-sm">{topOption.totalScore.toFixed(2)}/5.0</strong> ({topOption.percentageScore}%)
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {rationale.recommendedOptionName}
                </h3>
                <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
                  {rationale.whyRecommended}
                </p>
              </div>

              {/* Key strengths */}
              {rationale.keyStrengths && rationale.keyStrengths.length > 0 && (
                <div className="pt-2 border-t border-blue-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-blue-200">
                    Điểm mạnh cốt lõi:
                  </span>
                  <ul className="space-y-1 text-xs text-blue-50">
                    {rationale.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trade-offs & Implementation advice */}
              <div className="pt-2 border-t border-blue-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-100">
                <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/40">
                  <span className="font-semibold text-amber-300 block mb-1">
                    Đánh đổi cần lưu ý (Trade-offs):
                  </span>
                  <p className="text-[11px] leading-relaxed text-blue-100">{rationale.tradeOffs}</p>
                </div>
                <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/40">
                  <span className="font-semibold text-sky-300 block mb-1">
                    Lời khuyên triển khai:
                  </span>
                  <p className="text-[11px] leading-relaxed text-blue-100">{rationale.implementationAdvice}</p>
                </div>
              </div>
            </div>
          )}

          {/* WSM Matrix Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                Bảng Ma Trận Điểm Trọng Số (WSM Matrix)
              </h4>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Tổng trọng số: 100%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                    <th className="py-2.5 px-4 font-semibold">Tiêu chí đánh giá</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-28">Trọng số</th>
                    {project.options.map((opt) => (
                      <th key={opt.id} className="py-2.5 px-4 font-semibold text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: opt.color || '#2563eb' }}
                          />
                          <span className="truncate max-w-[120px]">{opt.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.criteria.map((crit) => (
                    <tr key={crit.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-900">{crit.name}</div>
                        {crit.description && (
                          <div className="text-[11px] text-slate-500">{crit.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-700">
                        {crit.weight}%
                      </td>
                      {project.options.map((opt) => {
                        const score = project.scores?.[opt.id]?.[crit.id] || 0;
                        const weightedScore = (crit.weight / 100) * score;
                        return (
                          <td key={opt.id} className="py-2.5 px-4 text-center">
                            <span className="font-mono font-bold text-slate-800">{score}/5</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              ({weightedScore.toFixed(2)}đ)
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td className="py-3 px-4 uppercase text-xs">Tổng điểm WSM (Thang 5.0)</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-700">100%</td>
                    {project.options.map((opt) => {
                      const res = results.find((r) => r.option.id === opt.id);
                      const isTop = res?.rank === 1;
                      return (
                        <td key={opt.id} className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              isTop ? 'text-emerald-700' : 'text-slate-800'
                            }`}
                          >
                            {res ? res.totalScore.toFixed(2) : '0.00'}
                          </span>
                          <span
                            className={`text-[10px] font-bold block px-1.5 py-0.2 rounded mt-0.5 ${
                              isTop ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            Hạng #{res?.rank}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Comparative Stacked Bar Chart */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Biểu đồ phân tích cấu trúc điểm số
            </h4>

            <div className="space-y-3">
              {results.map((res) => (
                <div key={res.option.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono flex items-center justify-center font-bold">
                        #{res.rank}
                      </span>
                      {res.option.name}
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {res.totalScore.toFixed(2)}/5.0 ({res.percentageScore}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-lg h-5 p-0.5 flex overflow-hidden border border-slate-200">
                    <div
                      style={{ width: `${(res.totalScore / 5.0) * 100}%` }}
                      className="h-full rounded flex overflow-hidden"
                    >
                      {res.criteriaScores.map((cs, idx) => {
                        const pct = res.totalScore > 0 ? (cs.weightedScore / res.totalScore) * 100 : 0;
                        return (
                          <div
                            key={cs.criteriaId}
                            style={{ width: `${pct}%` }}
                            className={`h-full ${
                              idx % 4 === 0
                                ? 'bg-blue-600'
                                : idx % 4 === 1
                                ? 'bg-indigo-500'
                                : idx % 4 === 2
                                ? 'bg-sky-500'
                                : 'bg-teal-500'
                            }`}
                            title={`${cs.criteriaName}: ${cs.weightedScore.toFixed(2)}đ`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dữ liệu gốc trong thư viện mẫu được bảo toàn không bị thay đổi.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Đóng lại
            </button>
            <button
              type="button"
              onClick={onUseSample}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sử dụng mẫu này để tạo dự án của tôi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

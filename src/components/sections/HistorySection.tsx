import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Copy,
  TableProperties,
  BarChart3,
  Calendar,
  Building2,
  ArrowRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Project } from '../../types';
import { calculateWSM } from '../../utils/wsm';
import { INDUSTRY_DOMAINS } from '../../utils/sampleData';
import { ConfirmModal } from '../common/ConfirmModal';

interface Props {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string, tab?: 'matrix' | 'results') => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
  onNewProject: () => void;
  onExportJson: () => void;
}

export const HistorySection: React.FC<Props> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onNewProject,
  onExportJson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.businessName && p.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.problemDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain = selectedDomain === 'all' || p.domain === selectedDomain;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesDomain && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Mục 6: Lịch sử và Quản lý dự án
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp toàn bộ các dự án ra quyết định đã tạo, lọc theo trạng thái và lĩnh vực hoạt động
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onExportJson}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sao lưu tất cả (JSON)</span>
          </button>
          <button
            type="button"
            onClick={onNewProject}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên dự án, doanh nghiệp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả lĩnh vực ({projects.length})</option>
            {INDUSTRY_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="in_progress">Đang thực hiện</option>
          </select>
        </div>
      </div>

      {/* Projects Table / Cards List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Kết quả: <strong className="text-blue-700">{filtered.length}</strong> dự án phù hợp
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Không tìm thấy dự án nào khớp với điều kiện lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((p) => {
              const results = calculateWSM(p);
              const bestOption = results[0];
              const isSelected = p.id === activeProjectId;

              return (
                <div
                  key={p.id}
                  className={`p-4 md:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className="text-xs md:text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => onSelectProject(p.id)}
                      >
                        {p.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Đang kích hoạt
                        </span>
                      )}
                      {p.isSample && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          Mẫu minh họa
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          p.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status === 'completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {p.businessName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {p.businessName}
                        </span>
                      )}
                      <span>Lĩnh vực: <strong className="text-slate-700 font-medium">{p.domain}</strong></span>
                      <span>{p.options.length} phương án</span>
                      <span>{p.criteria.length} tiêu chí</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {bestOption && p.status === 'completed' && (
                      <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Phương án dẫn đầu: <strong>{bestOption.option.name}</strong> ({bestOption.totalScore.toFixed(2)}/5.0)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      title="Mở ma trận đánh giá"
                      onClick={() => onSelectProject(p.id, 'matrix')}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <TableProperties className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Xem kết quả phân tích"
                      onClick={() => onSelectProject(p.id, 'results')}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Chỉnh sửa thông tin dự án"
                      onClick={() => onEditProject(p)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Nhân bản dự án này"
                      onClick={() => onDuplicateProject(p)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Xóa dự án"
                      onClick={() => setProjectToDelete(p)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title="Xác nhận xóa dự án ra quyết định"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn dự án "${projectToDelete?.name}" không? Thao tác này sẽ xóa toàn bộ ma trận tiêu chí, phương án và bảng điểm chấm liên quan.`}
        confirmLabel="Xóa dự án"
        isDestructive={true}
        onConfirm={() => {
          if (projectToDelete) {
            onDeleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Bot,
  PlusCircle,
  TableProperties,
  BarChart3,
  History,
  Scale,
  Sparkles,
  ChevronRight,
  FolderGit2,
  BookOpen,
} from 'lucide-react';
import { Project } from '../../types';
import { translations, Language } from '../../utils/i18n';

export type NavItem =
  | 'overview'
  | 'sample-library'
  | 'ai-assistant'
  | 'create-project'
  | 'matrix'
  | 'results'
  | 'history';

interface Props {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  activeProject: Project | null;
  totalProjects: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  hasAiKey: boolean;
  lang?: Language;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  activeProject,
  totalProjects,
  isOpenMobile,
  setIsOpenMobile,
  hasAiKey,
  lang = 'vi',
}) => {
  const t = translations[lang];

  const menuItems = [
    {
      id: 'overview' as NavItem,
      label: t.overview,
      icon: LayoutDashboard,
      desc: lang === 'vi' ? 'Thống kê & dự án gần đây' : 'Stats & recent decisions',
    },
    {
      id: 'sample-library' as NavItem,
      label: t.sampleLibrary,
      icon: BookOpen,
      desc: lang === 'vi' ? 'Ví dụ WSM thực tiễn' : 'Real-world WSM cases',
      badge: lang === 'vi' ? '8 mẫu' : '8 cases',
    },
    {
      id: 'ai-assistant' as NavItem,
      label: t.aiAssistant,
      icon: Bot,
      desc: lang === 'vi' ? 'Cố vấn WSM thông minh' : 'Smart decision advisor',
      badge: hasAiKey ? 'Gemini 3.8' : lang === 'vi' ? 'Cần Key' : 'Need Key',
    },
    {
      id: 'create-project' as NavItem,
      label: t.createProject,
      icon: PlusCircle,
      desc: lang === 'vi' ? 'Thiết lập bài toán & phương án' : 'Problem & alternatives',
    },
    {
      id: 'matrix' as NavItem,
      label: t.matrix,
      icon: TableProperties,
      desc: lang === 'vi' ? 'Trọng số, Đảo chiều & 1-5' : 'Weights, Cost & 1-5',
      disabled: !activeProject,
    },
    {
      id: 'results' as NavItem,
      label: t.results,
      icon: BarChart3,
      desc: lang === 'vi' ? 'Radar, What-If & Độ nhạy' : 'Radar, What-If & Sensitivity',
      disabled: !activeProject,
    },
    {
      id: 'history' as NavItem,
      label: t.history,
      icon: History,
      desc: lang === 'vi' ? 'Quản lý & Tra cứu' : 'Manage & Lookup',
      count: totalProjects,
    },
  ];

  const handleSelect = (tab: NavItem, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">SmartDecision</span>
                <span className="font-bold text-blue-600 text-base">AI</span>
              </div>
              <p
                className="text-[10px] text-slate-500 tracking-wide"
                style={{ fontWeight: 'bold' }}
              >
                {lang === 'vi' ? 'Mô hình Ma trận Trọng số (WSM)' : 'Weighted Scoring Model (WSM)'}
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Project Banner */}
        <div className="p-3.5 mx-3 mt-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
              {t.activeProject}:
            </span>
            {activeProject?.isSample && (
              <span className="text-[10px] text-amber-700 font-medium">{t.sampleBadge}</span>
            )}
          </div>
          {activeProject ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900 truncate" title={activeProject.name}>
                {activeProject.name}
              </p>
              <div className="text-[11px] text-slate-500 truncate">
                {activeProject.domain} · {activeProject.options.length} {lang === 'vi' ? 'phương án' : 'options'} · {activeProject.criteria.length} {lang === 'vi' ? 'tiêu chí' : 'criteria'}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              {t.noActiveProject}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t.menuTitle}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => handleSelect(item.id, item.disabled)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : item.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : item.disabled ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <div className="truncate">
                    <span className="block truncate">{item.label}</span>
                    <span
                      className={`block text-[10px] font-normal truncate ${
                        isActive ? 'text-blue-100' : item.disabled ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : hasAiKey
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {!isActive && !item.disabled && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              WSM v2.2 Enterprise
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {lang === 'vi' ? 'Tiếng Việt / English' : 'English / Tiếng Việt'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

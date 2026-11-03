import React, { useState } from 'react';
import {
  Menu,
  Download,
  Upload,
  User,
  FolderGit2,
  ChevronDown,
  Cloud,
  Check,
  Plus,
  Globe,
} from 'lucide-react';
import { Project, UserAccount } from '../../types';
import { NavItem } from './Sidebar';
import { translations, Language } from '../../utils/i18n';

interface Props {
  activeTab: NavItem;
  activeProject: Project | null;
  projects: Project[];
  currentUser: UserAccount | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onExportJson: () => void;
  onOpenImport: () => void;
  onOpenAuth: () => void;
  onToggleMobileMenu: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  activeProject,
  projects,
  currentUser,
  onSelectProject,
  onNewProject,
  onExportJson,
  onOpenImport,
  onOpenAuth,
  onToggleMobileMenu,
  lang,
  onToggleLang,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const t = translations[lang];

  const sectionTitles: Record<NavItem, string> = {
    overview: t.overview,
    'sample-library': t.sampleLibrary,
    'ai-assistant': t.aiAssistant,
    'create-project': t.createProject,
    matrix: t.matrix,
    results: t.results,
    history: t.history,
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg md:hidden hover:bg-slate-100"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
          <span className="font-semibold text-slate-900 whitespace-nowrap">
            {sectionTitles[activeTab]}
          </span>
          {activeProject && (
            <>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="text-slate-600 truncate max-w-[160px] md:max-w-xs" title={activeProject.name}>
                {activeProject.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right zone: Actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onToggleLang('vi')}
            className={`px-2 py-1 rounded-md transition-colors ${
              lang === 'vi'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            VI
          </button>
          <button
            type="button"
            onClick={() => onToggleLang('en')}
            className={`px-2 py-1 rounded-md transition-colors ${
              lang === 'en'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
        </div>

        {/* Project Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {activeProject ? activeProject.name : t.selectProject}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isProjectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProjectDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-64 md:w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  {lang === 'vi' ? 'Danh sách dự án' : 'Projects List'} ({projects.length})
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {projects.length === 0 ? (
                    <div className="px-3 py-3 text-center text-slate-400 italic">
                      {lang === 'vi' ? 'Chưa có dự án nào' : 'No projects yet'}
                    </div>
                  ) : (
                    projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          activeProject?.id === p.id ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate text-xs">{p.name}</p>
                          <span className="text-[10px] text-slate-400 block truncate">{p.domain}</span>
                        </div>
                        {activeProject?.id === p.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      onNewProject();
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.newProject}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* JSON Export */}
        <button
          type="button"
          onClick={onExportJson}
          title={t.exportJson}
          className="p-2 md:px-3 md:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">{t.exportJson}</span>
        </button>

        {/* JSON Import */}
        <button
          type="button"
          onClick={onOpenImport}
          title={t.importJson}
          className="p-2 md:px-3 md:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">{t.importJson}</span>
        </button>

        {/* User Account / Mode */}
        <button
          type="button"
          onClick={onOpenAuth}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            currentUser
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {currentUser ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[90px]">{currentUser.name}</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{t.login}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

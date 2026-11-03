import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewSection } from './components/sections/OverviewSection';
import { SampleLibrarySection } from './components/sections/SampleLibrarySection';
import { AiAssistantSection } from './components/sections/AiAssistantSection';
import { CreateProjectSection } from './components/sections/CreateProjectSection';
import { MatrixSection } from './components/sections/MatrixSection';
import { ResultsSection } from './components/sections/ResultsSection';
import { HistorySection } from './components/sections/HistorySection';
import { AuthModal } from './components/common/AuthModal';
import { JsonImportModal } from './components/common/JsonImportModal';
import { Project, UserAccount, WsmProposalData, SampleProject } from './types';
import {
  loadStoredProjects,
  saveStoredProjects,
  loadActiveProjectId,
  saveActiveProjectId,
  loadCurrentUser,
  saveCurrentUser,
  exportProjectsToJson,
} from './utils/storage';
import { SAMPLE_PROJECT } from './utils/sampleData';
import { checkAiHealth } from './services/ai';
import { getInitialLanguage, saveLanguage, Language } from './utils/i18n';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => getInitialLanguage());
  const [projects, setProjects] = useState<Project[]>(() => loadStoredProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const saved = loadActiveProjectId();
    const stored = loadStoredProjects();
    if (saved && stored.some((p) => p.id === saved)) return saved;
    return stored.length > 0 ? stored[0].id : null;
  });

  const [activeTab, setActiveTab] = useState<NavItem>('overview');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadCurrentUser());

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [hasAiKey, setHasAiKey] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

  // Sync projects to LocalStorage
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Sync active project id
  useEffect(() => {
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Check backend and Gemini API status on mount
  useEffect(() => {
    checkAiHealth().then((res) => {
      setHasAiKey(res.hasGeminiKey);
    });
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Handlers
  const handleSelectProject = (id: string, tab?: 'matrix' | 'results') => {
    setActiveProjectId(id);
    if (tab) {
      setActiveTab(tab);
    }
  };

  const handleStartNewProject = () => {
    setEditingProject(null);
    setActiveTab('create-project');
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setActiveTab('create-project');
  };

  const handleSaveProject = (savedProject: Project) => {
    const exists = projects.some((p) => p.id === savedProject.id);
    let nextProjects: Project[];

    if (exists) {
      nextProjects = projects.map((p) => (p.id === savedProject.id ? savedProject : p));
      showToast('Đã cập nhật dự án thành công!', 'success');
    } else {
      nextProjects = [savedProject, ...projects];
      showToast('Đã tạo dự án mới thành công!', 'success');
    }

    setProjects(nextProjects);
    setActiveProjectId(savedProject.id);
    setEditingProject(null);
    setActiveTab('matrix');
  };

  const handleDeleteProject = (id: string) => {
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    if (activeProjectId === id) {
      setActiveProjectId(next.length > 0 ? next[0].id : null);
    }
    showToast('Đã xóa dự án thành công.', 'info');
  };

  const handleDuplicateProject = (source: Project) => {
    const cloned: Project = {
      ...source,
      id: `proj-${Date.now()}`,
      name: `${source.name} (Bản sao)`,
      isSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([cloned, ...projects]);
    setActiveProjectId(cloned.id);
    showToast(`Đã nhân bản dự án "${cloned.name}" thành công!`, 'success');
  };

  const handleLoadSample = () => {
    const exists = projects.some((p) => p.id === SAMPLE_PROJECT.id);
    if (!exists) {
      const updated = [SAMPLE_PROJECT, ...projects];
      setProjects(updated);
      setActiveProjectId(SAMPLE_PROJECT.id);
    } else {
      setActiveProjectId(SAMPLE_PROJECT.id);
    }
    setActiveTab('overview');
    showToast('Đã tải dự án mẫu CRM cho bán lẻ thành công!', 'success');
  };

  const handleUseSample = (sample: SampleProject) => {
    // Clone sample to personal projects with a unique id
    const cloned: Project = {
      id: `proj-sample-${Date.now()}`,
      name: `${sample.name} (Bản sao tùy chỉnh)`,
      businessName: sample.businessName,
      domain: sample.domain,
      problemDescription: sample.problemDescription,
      options: sample.options.map((o) => ({ ...o })),
      criteria: sample.criteria.map((c) => ({ ...c })),
      scores: JSON.parse(JSON.stringify(sample.scores)),
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSample: false, // Now user's personal editable project!
    };

    setProjects([cloned, ...projects]);
    setActiveProjectId(cloned.id);
    setActiveTab('matrix');
    showToast(`Đã thêm mẫu "${sample.name}" vào danh sách dự án của bạn! Bạn có thể chỉnh sửa mọi thông số.`, 'success');
  };

  const handleApplyAiProposal = (proposal: WsmProposalData) => {
    const defaultColors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

    const newProject: Project = {
      id: `proj-ai-${Date.now()}`,
      name: proposal.projectTitle || 'Dự án đề xuất bởi AI',
      domain: proposal.domain || 'Lựa chọn phần mềm & giải pháp công nghệ',
      problemDescription: proposal.problemDescription || '',
      options: proposal.options.map((optName, idx) => ({
        id: `opt-${idx + 1}`,
        name: optName,
        description: 'Đề xuất bởi AI Cố vấn',
        color: defaultColors[idx % defaultColors.length],
      })),
      criteria: proposal.criteria.map((c, idx) => ({
        id: `crit-${idx + 1}`,
        name: c.name,
        weight: c.weight,
        description: c.description || '',
      })),
      scores: {},
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSample: false,
    };

    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setActiveTab('matrix');
    showToast('Đã tạo dự án WSM từ đề xuất của AI thành công! Hãy bắt đầu chấm điểm.', 'success');
  };

  const handleExportJson = () => {
    if (projects.length === 0) {
      showToast('Hiện chưa có dự án nào để xuất sao lưu.', 'info');
      return;
    }
    exportProjectsToJson(projects);
    showToast(`Đã xuất thành công ${projects.length} dự án ra tệp JSON!`, 'success');
  };

  const handleImportSuccess = (
    incomingProjects: Project[],
    resolution: 'overwrite' | 'keep_both' | 'skip'
  ) => {
    let nextList = [...projects];

    incomingProjects.forEach((incoming) => {
      const matchIndex = nextList.findIndex(
        (p) => p.id === incoming.id || p.name.trim().toLowerCase() === incoming.name.trim().toLowerCase()
      );

      if (matchIndex >= 0) {
        if (resolution === 'overwrite') {
          nextList[matchIndex] = incoming;
        } else if (resolution === 'keep_both') {
          nextList.unshift({
            ...incoming,
            id: `proj-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: `${incoming.name} (Nhập mới)`,
          });
        }
        // If 'skip', do nothing
      } else {
        nextList.unshift(incoming);
      }
    });

    setProjects(nextList);
    if (incomingProjects.length > 0) {
      setActiveProjectId(incomingProjects[0].id);
    }
    showToast(`Đã xử lý nhập thành công ${incomingProjects.length} dự án!`, 'success');
  };

  const handleLogin = (user: UserAccount, transferLocalData: boolean) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    showToast(`Đăng nhập thành công với tài khoản ${user.email}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
    showToast('Đã đăng xuất tài khoản. Quay về chế độ máy cục bộ.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium bg-slate-900 text-white animate-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProject={activeProject}
        totalProjects={projects.length}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
        hasAiKey={hasAiKey}
        lang={lang}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          activeProject={activeProject}
          projects={projects}
          currentUser={currentUser}
          onSelectProject={(id) => handleSelectProject(id)}
          onNewProject={handleStartNewProject}
          onExportJson={handleExportJson}
          onOpenImport={() => setIsImportModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          lang={lang}
          onToggleLang={handleToggleLang}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewSection
              projects={projects}
              onNewProject={handleStartNewProject}
              onSelectProject={(id, tab) => handleSelectProject(id, tab)}
              onLoadSample={handleLoadSample}
              onNavigateAi={() => setActiveTab('ai-assistant')}
              onNavigateSampleLibrary={() => setActiveTab('sample-library')}
              lang={lang}
            />
          )}

          {activeTab === 'sample-library' && (
            <SampleLibrarySection onUseSample={handleUseSample} />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistantSection
              projects={projects}
              activeProject={activeProject}
              hasAiKey={hasAiKey}
              onApplyAiProposal={handleApplyAiProposal}
            />
          )}

          {activeTab === 'create-project' && (
            <CreateProjectSection
              editingProject={editingProject}
              onSaveProject={handleSaveProject}
              onCancelEdit={() => {
                setEditingProject(null);
                setActiveTab(activeProject ? 'matrix' : 'overview');
              }}
              hasAiKey={hasAiKey}
              lang={lang}
            />
          )}

          {activeTab === 'matrix' && (
            activeProject ? (
              <MatrixSection
                project={activeProject}
                onUpdateProject={(updated) => {
                  setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                }}
                onNavigateResults={() => setActiveTab('results')}
                lang={lang}
              />
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl max-w-lg mx-auto">
                <p className="text-xs text-slate-500 mb-4">
                  Chưa chọn dự án nào để xem ma trận đánh giá.
                </p>
                <button
                  onClick={handleStartNewProject}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Tạo dự án mới
                </button>
              </div>
            )
          )}

          {activeTab === 'results' && (
            activeProject ? (
              <ResultsSection
                project={activeProject}
                onNavigateMatrix={() => setActiveTab('matrix')}
                hasAiKey={hasAiKey}
                lang={lang}
              />
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl max-w-lg mx-auto">
                <p className="text-xs text-slate-500 mb-4">
                  Chưa chọn dự án nào để xem kết quả phân tích.
                </p>
                <button
                  onClick={handleStartNewProject}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Tạo dự án mới
                </button>
              </div>
            )
          )}

          {activeTab === 'history' && (
            <HistorySection
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id, tab) => handleSelectProject(id, tab)}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onDuplicateProject={handleDuplicateProject}
              onNewProject={handleStartNewProject}
              onExportJson={handleExportJson}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        localProjectsCount={projects.length}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <JsonImportModal
        isOpen={isImportModalOpen}
        existingProjects={projects}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

import React from 'react';
import {
  FolderPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Bot,
  Scale,
  Building2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { Project } from '../../types';
import { calculateWSM } from '../../utils/wsm';
import { translations, Language } from '../../utils/i18n';

interface Props {
  projects: Project[];
  onNewProject: () => void;
  onSelectProject: (id: string, tab?: 'matrix' | 'results') => void;
  onLoadSample: () => void;
  onNavigateAi: () => void;
  onNavigateSampleLibrary: () => void;
  lang?: Language;
}

export const OverviewSection: React.FC<Props> = ({
  projects,
  onNewProject,
  onSelectProject,
  onLoadSample,
  onNavigateAi,
  onNavigateSampleLibrary,
  lang = 'vi',
}) => {
  const t = translations[lang];
  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Intro Banner */}
      <div
        className="border border-slate-200 rounded-xl p-6 shadow-xs"
        style={{ backgroundColor: '#f2e7fe' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <Scale style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '14px', lineHeight: '15px', color: '#0e4fdf' }}>
                {t.scientificPlatform}
              </span>
            </div>
            <h1
              className="font-bold tracking-tight"
              style={{
                color: '#15254f',
                fontFamily: 'system-ui',
                fontSize: '27px',
                lineHeight: '25px',
              }}
            >
              {t.welcomeTitle}
            </h1>
            <p
              className="leading-relaxed"
              style={{
                width: '505.875px',
                height: '67.25px',
                color: '#2b5493',
                fontWeight: 'normal',
                fontFamily: 'Arial',
                textAlign: 'justify',
              }}
            >
              {t.wsmDescription}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNavigateSampleLibrary}
              className="px-3.5 py-2.5 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-2"
              style={{
                width: '220.65px',
                height: '40.6px',
                fontSize: '14px',
                lineHeight: '15px',
                borderStyle: 'groove',
                borderWidth: '2.8px',
              }}
            >
              <BookOpen className="text-blue-600 shrink-0" style={{ width: '24.65px', height: '25px' }} />
              <span>{t.exploreLibrary}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateAi}
              className="px-3.5 py-2.5 font-semibold rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: '#e3fef6',
                height: '40.6px',
                fontSize: '14px',
                lineHeight: '15px',
                borderStyle: 'groove',
                borderWidth: '2.8px',
                color: '#144b8f',
              }}
            >
              <Bot className="shrink-0" style={{ width: '24px', height: '19px', color: '#144b8f' }} />
              <span>{t.askAi}</span>
            </button>
            <button
              type="button"
              onClick={onNewProject}
              className="px-4 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              style={{
                height: '40px',
                fontSize: '14px',
                lineHeight: '15px',
                borderStyle: 'ridge',
                borderWidth: '2px',
              }}
            >
              <FolderPlus className="shrink-0" style={{ width: '20px', height: '17px' }} />
              <span>{t.newProject}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between"
          style={{ backgroundColor: '#cff9fd' }}
        >
          <div>
            <p
              className="text-slate-500"
              style={{ fontWeight: 'bold', fontSize: '17px', lineHeight: '15px' }}
            >
              {t.totalProjects}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {totalCount}
            </h3>
            <span
              className="text-slate-400 mt-0.5 block"
              style={{ fontWeight: 'bold', fontSize: '12px' }}
            >
              {t.managedSubtitle}
            </span>
          </div>
          <div
            className="rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0"
            style={{ width: '47px', height: '47px' }}
          >
            <FileSpreadsheet style={{ width: '24px', height: '24px' }} />
          </div>
        </div>

        <div
          className="border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between"
          style={{ backgroundColor: '#fbf2e0' }}
        >
          <div>
            <p
              className="text-slate-500"
              style={{ fontSize: '17px', lineHeight: '15px', fontWeight: 'bold' }}
            >
              {t.inProgress}
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
              {inProgressCount}
            </h3>
            <span
              className="text-slate-400 mt-0.5 block"
              style={{ fontSize: '12px', fontWeight: 'bold' }}
            >
              {t.inProgressSubtitle}
            </span>
          </div>
          <div
            className="rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center shrink-0"
            style={{ width: '47px', height: '47px' }}
          >
            <Clock style={{ width: '23px', height: '23px' }} />
          </div>
        </div>

        <div
          className="border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between"
          style={{ backgroundColor: '#d0fdd2' }}
        >
          <div>
            <p
              className="text-slate-500"
              style={{ fontSize: '17px', lineHeight: '15px', fontWeight: 'bold' }}
            >
              {t.completed}
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
              {completedCount}
            </h3>
            <span
              className="text-slate-400 mt-0.5 block"
              style={{ fontSize: '12px', textAlign: 'left', fontWeight: 'bold' }}
            >
              {t.completedSubtitle}
            </span>
          </div>
          <div
            className="rounded-lg bg-emerald-50/80 text-emerald-600 flex items-center justify-center shrink-0"
            style={{ width: '47px', height: '47px' }}
          >
            <CheckCircle2 style={{ width: '23px', height: '23px' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {totalCount === 0 ? (
        /* Friendly Empty State with Guided Workflow */
        <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
            <Scale className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {t.emptyTitle}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            {t.emptyDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={onNewProject}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{t.createFirstProject}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateSampleLibrary}
              className="px-5 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{t.exploreLibrary}</span>
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.quickSampleCrm}</span>
            </button>
          </div>

          {/* 4-Step WSM Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-100 text-left">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs font-bold text-blue-600 font-mono">01</span>
              <h4 className="text-xs font-semibold text-slate-900 mt-1">{t.step1Title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs font-bold text-blue-600 font-mono">02</span>
              <h4 className="text-xs font-semibold text-slate-900 mt-1">{t.step2Title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs font-bold text-blue-600 font-mono">03</span>
              <h4 className="text-xs font-semibold text-slate-900 mt-1">{t.step3Title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs font-bold text-blue-600 font-mono">04</span>
              <h4 className="text-xs font-semibold text-slate-900 mt-1">{t.step4Title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {t.step4Desc}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Recent Projects List */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div
            className="px-5 py-4 border-b border-slate-200 flex items-center justify-between"
            style={{ backgroundColor: '#f8fafc' }}
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t.recentProjects}</h3>
              <p className="text-xs text-slate-500">{t.recentProjectsSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectProject(recentProjects[0].id)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentProjects.map((p) => {
              const results = calculateWSM(p);
              const bestOption = results[0];

              return (
                <div
                  key={p.id}
                  className="p-4 md:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onSelectProject(p.id)}>
                        {p.name}
                      </span>
                      {p.isSample && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          {t.sampleBadge}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          p.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status === 'completed' ? t.completed : t.inProgress}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {p.businessName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {p.businessName}
                        </span>
                      )}
                      <span>{p.domain}</span>
                      <span>{p.options.length} {t.optionsCount}</span>
                      <span>{p.criteria.length} {t.criteriaCount}</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.updatedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>

                    {bestOption && p.status === 'completed' && (
                      <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t.optimalAlternative}: <strong>{bestOption.option.name}</strong> ({t.wsmScore}: <span className="font-mono">{bestOption.totalScore.toFixed(2)}/5.0</span>)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectProject(p.id, 'matrix')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      {t.openMatrix}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProject(p.id, 'results')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>{t.results}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

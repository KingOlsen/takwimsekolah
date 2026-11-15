import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { LandingView } from './components/LandingView';
import { WorkspaceShell } from './components/WorkspaceShell';
import { DashboardView } from './components/DashboardView';
import { TeachersView } from './components/TeachersView';
import { DivisionView } from './components/DivisionView';
import { AnalysisView } from './components/AnalysisView';
import { SummaryView } from './components/SummaryView';
import { ReportView } from './components/ReportView';
import { BookView } from './components/BookView';
import { LettersView } from './components/LettersView';
import { SettingsView } from './components/SettingsView';
import { SearchModal } from './components/SearchModal';
import { TeacherDetailModal } from './components/TeacherDetailModal';
import { QuickInsertModal } from './components/QuickInsertModal';

const AppRouter: React.FC = () => {
  const { route, toasts } = useStore();

  const renderWorkspaceContent = () => {
    switch (route.page) {
      case 'pemuka':
        return <DashboardView />;
      case 'guru':
        return <TeachersView />;
      case 'bahagian':
        return <DivisionView bahagianId={route.bahagianId} />;
      case 'analisis':
        return <AnalysisView />;
      case 'rumusan':
        return <SummaryView />;
      case 'laporan':
        return <ReportView />;
      case 'buku':
        return <BookView />;
      case 'surat':
        return <LettersView />;
      case 'tetapan':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      {route.page === 'utama' ? (
        <LandingView />
      ) : (
        <WorkspaceShell>{renderWorkspaceContent()}</WorkspaceShell>
      )}

      <SearchModal />
      <TeacherDetailModal />
      <QuickInsertModal />

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="no-print pointer-events-none fixed right-4 bottom-4 z-[90] flex flex-col items-end gap-2"
        >
          {toasts.map((toast) => {
            const isErr = toast.tone === 'err';
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-lg transition-all ${
                  isErr
                    ? 'border-[var(--berat)]/30 bg-[var(--berat-soft)] text-[var(--berat-ink)]'
                    : 'border-[var(--brand)] bg-[var(--brand)] text-white'
                }`}
              >
                {isErr ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                )}
                <span>{toast.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}

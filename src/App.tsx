import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MissionChat } from './components/MissionChat';
import { ValidationScreen } from './components/ValidationScreen';
import { ProspectsView } from './components/ProspectsView';
import { FilesWorkspaceView } from './components/FilesWorkspaceView';
import { ActionLogsView } from './components/ActionLogsView';
import { SchedulesView } from './components/SchedulesView';
import { SentEmailsView, SentEmail } from './components/SentEmailsView';
import { ProspectFinderModal } from './components/ProspectFinderModal';
import { SettingsModal } from './components/SettingsModal';
import { DesktopPortabilityModal } from './components/DesktopPortabilityModal';
import { AuthModal } from './components/AuthModal';
import { AdminView } from './components/AdminView';
import { 
  Mission, 
  ValidationRequest, 
  Prospect, 
  WorkspaceFile, 
  ScheduleItem, 
  AgentSettings, 
  PermissionMode,
  User 
} from './types/agent';

export default function App() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [validations, setValidations] = useState<ValidationRequest[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [currentMode, setCurrentMode] = useState<PermissionMode>('assistance');
  const [currentView, setCurrentView] = useState<'chat' | 'validations' | 'prospects' | 'files' | 'logs' | 'schedules' | 'sent_emails' | 'admin'>(
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? 'admin' : 'chat'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isProspectFinderOpen, setIsProspectFinderOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [settings, setSettings] = useState<AgentSettings>({
    ai_provider: 'gemini',
    ollama_url: 'http://localhost:11434',
    ollama_model: 'llama3:latest',
    openai_url: 'https://api.openai.com/v1',
    openai_model: 'gpt-4o-mini',
    openai_key_configured: false,
    gemini_model: 'gemini-2.5-flash',
    default_mode: 'assistance',
    authorized_dir: 'workspace_cadran',
    smtp_configured: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_from: '',
    desktop_control_enabled: false
  });

  // Chargement initial des données
  const fetchAllData = async () => {
    try {
      const [mRes, vRes, pRes, fRes, sRes, eRes] = await Promise.all([
        fetch('/api/missions').then(r => r.json()),
        fetch('/api/validations').then(r => r.json()),
        fetch('/api/prospects').then(r => r.json()),
        fetch('/api/workspace/files').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/sent-emails').then(r => r.json())
      ]);

      setMissions(mRes || []);
      setValidations(vRes || []);
      setProspects(Array.isArray(pRes) ? pRes : (pRes.all_prospects || pRes.prospects || []));
      setFiles(fRes || []);
      if (sRes) setSettings(sRes);
      setSentEmails(eRes || []);

      // Si aucune mission n'est active et qu'il y en a, sélectionne la première
      if (mRes && mRes.length > 0 && !activeMissionId) {
        setActiveMissionId(mRes[0].id);
      }
    } catch (e) {
      console.error('Erreur chargement données:', e);
    }
  };

  // Vérification de la session utilisateur réelle au démarrage
  const checkAuth = async () => {
    const token = localStorage.getItem('cadran_auth_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('cadran_auth_token');
        setCurrentUser(null);
      }
    } catch {
      // Erreur réseau ou non connecté
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('cadran_auth_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('cadran_auth_token');
    setCurrentUser(null);
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('cadran_auth_token');
    if (token) {
      await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('cadran_auth_token');
    setCurrentUser(null);
  };

  // Chargement de la mission active détaillée
  const fetchActiveMission = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveMission(data);
      }
    } catch (e) {
      console.error('Erreur chargement mission détaillée:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeMissionId) {
      fetchActiveMission(activeMissionId);
    } else {
      setActiveMission(null);
    }
  }, [activeMissionId]);

  // Actions Missions
  const handleExecuteAllSteps = async (missionId: string) => {
    try {
      const res = await fetch(`/api/missions/${missionId}`);
      if (!res.ok) return;
      const m = await res.json();
      if (!m.steps) return;

      for (const step of m.steps) {
        if (step.status === 'pending') {
          const stepRes = await fetch(`/api/missions/${missionId}/step/${step.id}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_approved: false })
          });
          const stepData = await stepRes.json();
          await fetchActiveMission(missionId);
          await fetchAllData();
          if (stepData.status === 'waiting_validation') {
            setCurrentView('validations');
            break;
          }
        }
      }
    } catch (e) {
      console.error('Erreur exécution plan:', e);
    }
  };

  const handleCreateNewMission = async (prompt: string, mode: PermissionMode) => {
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: prompt, permission_mode: mode })
      });
      const data = await res.json();
      await fetchAllData();
      if (data.id) {
        setActiveMissionId(data.id);
        setCurrentView('chat');
        // Démarre l'exécution automatique pas à pas du plan
        setTimeout(() => {
          handleExecuteAllSteps(data.id);
        }, 400);
      }
    } catch (e) {
      console.error('Erreur création mission:', e);
    }
  };

  const handleLaunchProspecting = async ({ activity, city, count, focus }: any) => {
    try {
      const res = await fetch('/api/prospects/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, city, count, focus })
      });
      const data = await res.json();
      await fetchAllData();
      if (data.id) {
        setActiveMissionId(data.id);
        setCurrentView('chat');
        setTimeout(() => {
          handleExecuteAllSteps(data.id);
        }, 400);
      }
    } catch (e) {
      console.error('Erreur prospection ciblée:', e);
    }
  };

  const handleExecuteStep = async (missionId: string, stepId: string) => {
    try {
      const res = await fetch(`/api/missions/${missionId}/step/${stepId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: false })
      });
      const data = await res.json();
      if (data.status === 'waiting_validation') {
        setCurrentView('validations');
      }
      await fetchActiveMission(missionId);
      await fetchAllData();
    } catch (e) {
      console.error('Erreur exécution étape:', e);
    }
  };

  const handlePauseMission = async (missionId: string) => {
    try {
      await fetch(`/api/missions/${missionId}/pause`, { method: 'POST' });
      await fetchActiveMission(missionId);
      await fetchAllData();
    } catch (e) {
      console.error('Erreur pause mission:', e);
    }
  };

  const handleCancelMission = async (missionId: string) => {
    try {
      await fetch(`/api/missions/${missionId}/cancel`, { method: 'POST' });
      await fetchActiveMission(missionId);
      await fetchAllData();
    } catch (e) {
      console.error('Erreur arrêt immédiat mission:', e);
    }
  };

  const handleDeleteMission = async (id: string) => {
    try {
      await fetch(`/api/missions/${id}`, { method: 'DELETE' });
      if (activeMissionId === id) {
        setActiveMissionId(null);
      }
      await fetchAllData();
    } catch (e) {
      console.error('Erreur suppression mission:', e);
    }
  };

  const handleResetDatabase = async () => {
    try {
      await fetch('/api/reset-database', { method: 'POST' });
      setActiveMissionId(null);
      setActiveMission(null);
      await fetchAllData();
      setCurrentView('chat');
    } catch (e) {
      console.error('Erreur réinitialisation:', e);
    }
  };

  // Actions Validations Humaines
  const handleApproveValidation = async (id: string) => {
    try {
      await fetch(`/api/validations/${id}/approve`, { method: 'POST' });
      await fetchAllData();
      if (activeMissionId) await fetchActiveMission(activeMissionId);
    } catch (e) {
      console.error('Erreur validation approbation:', e);
    }
  };

  const handleRejectValidation = async (id: string, reason: string) => {
    try {
      await fetch(`/api/validations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      await fetchAllData();
      if (activeMissionId) await fetchActiveMission(activeMissionId);
    } catch (e) {
      console.error('Erreur validation rejet:', e);
    }
  };

  // Actions Prospects
  const handleExcludeProspect = async (id: string) => {
    try {
      await fetch(`/api/prospects/${id}/exclude`, { method: 'POST' });
      await fetchAllData();
      if (activeMissionId) await fetchActiveMission(activeMissionId);
    } catch (e) {
      console.error('Erreur exclusion prospect:', e);
    }
  };

  // Actions Paramètres
  const handleSaveSettings = async (newSettings: AgentSettings) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      setSettings(newSettings);
      setCurrentMode(newSettings.default_mode);
    } catch (e) {
      console.error('Erreur enregistrement paramètres:', e);
    }
  };

  // Actions Planification
  const handleCreateSchedule = async (title: string, prompt: string, frequency: 'daily' | 'weekly' | 'hourly', timeOfDay: string) => {
    const newSch: ScheduleItem = {
      id: 'sch_' + Date.now(),
      title,
      prompt,
      frequency,
      time_of_day: timeOfDay,
      is_active: true,
      last_run_at: new Date().toISOString()
    };
    setSchedules([...schedules, newSch]);
  };

  const handleToggleSchedule = async (id: string, active: boolean) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, is_active: active } : s));
  };

  const pendingValidationsCount = validations.filter(v => v.status === 'pending').length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <TopBar
        currentMode={currentMode}
        onModeChange={(mode) => {
          setCurrentMode(mode);
          setSettings({ ...settings, default_mode: mode });
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDesktopPortability={() => setIsDesktopModalOpen(true)}
        pendingValidationsCount={pendingValidationsCount}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      {/* Corps principal : Sidebar gauche + Vue active */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          missions={missions}
          activeMissionId={activeMissionId}
          onSelectMission={(id) => setActiveMissionId(id)}
          onNewMission={() => {
            setActiveMissionId(null);
            setCurrentView('chat');
          }}
          onOpenProspectFinder={() => setIsProspectFinderOpen(true)}
          onDeleteMission={handleDeleteMission}
          onResetDatabase={handleResetDatabase}
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
          pendingValidationsCount={pendingValidationsCount}
          prospectsCount={prospects.length}
          sentEmailsCount={sentEmails.length}
        />

        {/* Vue principale dynamique */}
        <main className="flex-1 flex overflow-hidden">
          {currentView === 'chat' && (
            <MissionChat
              mission={activeMission}
              onExecuteStep={handleExecuteStep}
              onExecuteAllSteps={handleExecuteAllSteps}
              onPauseMission={handlePauseMission}
              onCancelMission={handleCancelMission}
              onDeleteMission={handleDeleteMission}
              onCreateNewMission={handleCreateNewMission}
              currentMode={currentMode}
            />
          )}

          {currentView === 'validations' && (
            <ValidationScreen
              validations={validations}
              onApprove={handleApproveValidation}
              onReject={handleRejectValidation}
              smtpConfigured={settings.smtp_configured}
            />
          )}

          {currentView === 'sent_emails' && (
            <SentEmailsView
              sentEmails={sentEmails}
            />
          )}

          {currentView === 'admin' && (
            <AdminView
              onBackToMissions={() => setCurrentView('chat')}
            />
          )}

          {currentView === 'prospects' && (
            <ProspectsView
              prospects={prospects}
              onExcludeProspect={handleExcludeProspect}
            />
          )}

          {currentView === 'files' && (
            <FilesWorkspaceView
              files={files}
              onRefreshFiles={async () => {
                const res = await fetch('/api/workspace/files');
                const data = await res.json();
                setFiles(data || []);
              }}
            />
          )}

          {currentView === 'logs' && (
            <ActionLogsView
              logs={activeMission?.logs || []}
            />
          )}

          {currentView === 'schedules' && (
            <SchedulesView
              schedules={schedules}
              onCreateSchedule={handleCreateSchedule}
              onToggleSchedule={handleToggleSchedule}
            />
          )}
        </main>
      </div>

      {/* Modales de configuration, authentification, prospection et portabilité desktop */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        smtpConfigured={settings.smtp_configured}
      />

      <ProspectFinderModal
        isOpen={isProspectFinderOpen}
        onClose={() => setIsProspectFinderOpen(false)}
        onLaunchProspecting={handleLaunchProspecting}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <DesktopPortabilityModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
}

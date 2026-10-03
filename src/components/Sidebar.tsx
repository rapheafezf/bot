import React from 'react';
import { 
  PlusCircle, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  FolderGit2, 
  Activity, 
  CalendarClock, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ChevronRight,
  Trash2,
  RotateCcw,
  MailCheck,
  Lock
} from 'lucide-react';
import { Mission, MissionStatus } from '../types/agent';

interface SidebarProps {
  missions: Mission[];
  activeMissionId: string | null;
  onSelectMission: (id: string) => void;
  onNewMission: () => void;
  onOpenProspectFinder?: () => void;
  onDeleteMission?: (id: string) => void;
  onResetDatabase?: () => void;
  currentView: 'chat' | 'validations' | 'prospects' | 'files' | 'logs' | 'schedules' | 'sent_emails' | 'admin';
  onViewChange: (view: 'chat' | 'validations' | 'prospects' | 'files' | 'logs' | 'schedules' | 'sent_emails' | 'admin') => void;
  pendingValidationsCount: number;
  prospectsCount: number;
  sentEmailsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  missions,
  activeMissionId,
  onSelectMission,
  onNewMission,
  onOpenProspectFinder,
  onDeleteMission,
  onResetDatabase,
  currentView,
  onViewChange,
  pendingValidationsCount,
  prospectsCount,
  sentEmailsCount = 0,
}) => {
  const getStatusBadge = (status: MissionStatus) => {
    switch (status) {
      case 'running':
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En cours</span>;
      case 'waiting_validation':
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium"><AlertCircle className="w-3 h-3" /> Validation</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 font-medium"><PauseCircle className="w-3 h-3" /> Pause</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Terminée</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-400"><XCircle className="w-3 h-3" /> Annulée</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-400"><AlertCircle className="w-3 h-3" /> Échouée</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><Clock className="w-3 h-3" /> Préparation</span>;
    }
  };

  return (
    <aside className="w-72 border-r border-slate-800/80 bg-slate-900/40 flex flex-col shrink-0 select-none">
      {/* Boutons d'actions rapides */}
      <div className="p-3 border-b border-slate-800/70 space-y-1.5">
        <button
          onClick={onNewMission}
          className="w-full py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvelle mission</span>
        </button>

        {onOpenProspectFinder && (
          <button
            onClick={onOpenProspectFinder}
            className="w-full py-2 px-3.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span>🎯 Trouver des clients</span>
          </button>
        )}
      </div>

      {/* Navigation principale par vue */}
      <nav className="p-2 border-b border-slate-800/70 space-y-0.5 text-xs">
        <button
          onClick={() => onViewChange('chat')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'chat'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Missions & Plan</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('validations')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'validations'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Validations</span>
          </div>
          {pendingValidationsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 tabular-nums">
              {pendingValidationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onViewChange('sent_emails')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'sent_emails'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MailCheck className="w-4 h-4 text-emerald-400" />
            <span>Emails envoyés</span>
          </div>
          {sentEmailsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 tabular-nums font-mono">
              {sentEmailsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onViewChange('prospects')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'prospects'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Fiches Prospects</span>
          </div>
          {prospectsCount > 0 && (
            <span className="text-[11px] text-slate-500 tabular-nums font-mono">
              {prospectsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onViewChange('files')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'files'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>Fichiers & Rapports</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('logs')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'logs'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Journal d'actions</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('schedules')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'schedules'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-4 h-4 text-rose-400" />
            <span>Planification</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('admin')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'admin'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Espace Admin 🔒</span>
          </div>
        </button>
      </nav>

      {/* Liste des missions dans SQLite */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Missions ({missions.length})</span>
          {missions.length > 0 && onResetDatabase && (
            <button
              onClick={() => {
                if (window.confirm("Voulez-vous réinitialiser toutes les missions et repartir de zéro ?")) {
                  onResetDatabase();
                }
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              title="Tout effacer et repartir à zéro"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Purger</span>
            </button>
          )}
        </div>

        {missions.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-slate-500 space-y-1">
            <div className="text-slate-400 font-medium">Aucun projet en cours</div>
            <p className="text-[11px] text-slate-500">
              Prêt à démarrer. Entrez votre première mission dans le chat.
            </p>
          </div>
        ) : (
          <div className="space-y-1 mt-1">
            {missions.map((m) => {
              const isActive = m.id === activeMissionId;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMission(m.id);
                    onViewChange('chat');
                  }}
                  className={`group relative p-2.5 rounded-lg cursor-pointer transition-all border text-left ${
                    isActive
                      ? 'bg-slate-800/90 border-slate-700 shadow-sm'
                      : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-medium text-slate-200 truncate pr-6" title={m.title}>
                      {m.title}
                    </span>
                    {onDeleteMission && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMission(m.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                        title="Supprimer cette mission"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    {getStatusBadge(m.status)}
                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pied de sidebar */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-950/30 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="text-slate-400">Dossier :</span>
        <span className="font-mono text-slate-300 text-[11px]" title="workspace_cadran/">
          workspace_cadran/
        </span>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  Info, 
  Wrench,
  Filter
} from 'lucide-react';
import { ActionLog, LogLevel } from '../types/agent';

interface ActionLogsViewProps {
  logs: ActionLog[];
}

export const ActionLogsView: React.FC<ActionLogsViewProps> = ({ logs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  });

  const getLogBadge = (level: LogLevel) => {
    switch (level) {
      case 'tool_result':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" /> Preuve
          </span>
        );
      case 'security_alert':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            <ShieldAlert className="w-3 h-3" /> Sécurité
          </span>
        );
      case 'approval_request':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
            <ShieldAlert className="w-3 h-3" /> Validation
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
            <AlertOctagon className="w-3 h-3" /> Arrêt
          </span>
        );
      case 'tool_call':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            <Wrench className="w-3 h-3" /> Outil
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Info className="w-3 h-3" /> Info
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* En-tête */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Journal d'Audit et Actions ({filteredLogs.length} événements)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique persistant des appels d'outils, validations et vérifications de sécurité dans SQLite.
          </p>
        </div>

        {/* Filtres de niveau */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterLevel === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterLevel('tool_result')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterLevel === 'tool_result' ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preuves
          </button>
          <button
            onClick={() => setFilterLevel('security_alert')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterLevel === 'security_alert' ? 'bg-amber-950/80 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sécurité
          </button>
          <button
            onClick={() => setFilterLevel('error')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterLevel === 'error' ? 'bg-rose-950/80 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Arrêts
          </button>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="flex-1 overflow-auto p-4 space-y-2 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-sans">
            Aucun événement enregistré pour ce filtre.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 transition-colors flex items-start gap-3"
            >
              <span className="text-slate-500 tabular-nums shrink-0 mt-0.5 text-[11px]">
                {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>

              <div className="shrink-0">
                {getLogBadge(log.level)}
              </div>

              <div className="flex-1 text-slate-200 font-sans leading-relaxed break-words text-xs">
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

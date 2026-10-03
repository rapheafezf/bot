import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Settings as SettingsIcon, 
  FolderLock, 
  User as UserIcon, 
  Lock,
  CheckCircle2
} from 'lucide-react';
import { PermissionMode, User } from '../types/agent';

interface TopBarProps {
  currentMode: PermissionMode;
  onModeChange: (mode: PermissionMode) => void;
  onOpenSettings: () => void;
  onOpenDesktopPortability: () => void;
  pendingValidationsCount: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  onModeChange,
  onOpenSettings,
  onOpenDesktopPortability,
  pendingValidationsCount,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-5 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold tracking-tight text-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <span>Cadran Agent</span>
        </div>
        <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
          Debian 12 · Python 3.10 · SQLite
        </span>
      </div>

      {/* Zone 2: Contrôles de Mode de Permission */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
        <button
          onClick={() => onModeChange('observation')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            currentMode === 'observation'
              ? 'bg-slate-800 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Mode Observation : Lecture uniquement. Aucune modification de fichier, aucun envoi."
        >
          <FolderLock className="w-3.5 h-3.5" />
          <span>Observation</span>
        </button>

        <button
          onClick={() => onModeChange('assistance')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            currentMode === 'assistance'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Mode Assistance : Prépare les actions et demande systématiquement validation avant écriture ou envoi."
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Assistance</span>
        </button>

        <button
          onClick={() => onModeChange('strict_automation')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            currentMode === 'strict_automation'
              ? 'bg-amber-600/90 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Automatisation encadrée : Exécute les actions sûres préautorisées. Les envois d'emails exigent toujours validation."
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Auto. encadrée</span>
          <span className="md:hidden">Auto.</span>
        </button>
      </div>

      {/* Zone 3: Authentification, Admin, Actions système */}
      <div className="flex items-center gap-2">
        {/* Alerte Validations en attente */}
        {pendingValidationsCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-md animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-semibold">{pendingValidationsCount}</span>
            <span className="hidden sm:inline">validation(s)</span>
          </div>
        )}

        {/* Bouton Espace Administrateur (Code 3105) */}
        <button
          onClick={onOpenAdmin}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-indigo-900/60 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition-colors flex items-center gap-1.5"
          title="Espace Administrateur sécurisé (Code 3105)"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Admin 🔒</span>
        </button>

        {/* Bouton Utilisateur / Connexion réelle */}
        <button
          onClick={onOpenAuth}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
            currentUser
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
          }`}
          title={currentUser ? `Connecté : ${currentUser.email}` : "Se connecter ou s'inscrire par email"}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">
            {currentUser ? (currentUser.name || currentUser.email) : "Connexion"}
          </span>
          {currentUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={onOpenDesktopPortability}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
          title="Portabilité Desktop, code PySide6 et tests de sécurité"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Code Desktop</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          title="Paramètres IA, SMTP et Sécurité"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

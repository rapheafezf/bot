import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  OctagonAlert, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Search,
  Building,
  Mail,
  FolderSync,
  Trash2
} from 'lucide-react';
import { Mission, MissionStep, PermissionMode } from '../types/agent';

interface MissionChatProps {
  mission: Mission | null;
  onExecuteStep: (missionId: string, stepId: string) => Promise<void>;
  onExecuteAllSteps: (missionId: string) => Promise<void>;
  onPauseMission: (missionId: string) => Promise<void>;
  onCancelMission: (missionId: string) => Promise<void>;
  onDeleteMission?: (missionId: string) => Promise<void>;
  onCreateNewMission: (prompt: string, mode: PermissionMode) => Promise<void>;
  currentMode: PermissionMode;
}

export const MissionChat: React.FC<MissionChatProps> = ({
  mission,
  onExecuteStep,
  onExecuteAllSteps,
  onPauseMission,
  onCancelMission,
  onDeleteMission,
  onCreateNewMission,
  currentMode,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mission && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mission]);

  const starterCards = [
    {
      category: "Prospection & Audit",
      icon: <Building className="w-4 h-4 text-cyan-400" />,
      title: "Hôtels en Occitanie",
      prompt: "Trouve 20 hôtels en Occitanie dont le site pourrait être amélioré et prépare un tableau de prospects."
    },
    {
      category: "Messagerie encadrée",
      icon: <Mail className="w-4 h-4 text-indigo-400" />,
      title: "Emails personnalisés avec validation",
      prompt: "Prépare un email personnalisé pour chaque prospect et fais-moi valider les envois."
    },
    {
      category: "Veille & Synthèse",
      icon: <Search className="w-4 h-4 text-emerald-400" />,
      title: "Recherche Web & Rapport",
      prompt: "Recherche ces informations sur Internet et crée un rapport."
    },
    {
      category: "Fichiers & Organisation",
      icon: <FolderSync className="w-4 h-4 text-amber-400" />,
      title: "Rangement sécurisé",
      prompt: "Range ces fichiers dans le dossier que je t’autorise à utiliser."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const text = promptInput;
    setPromptInput('');
    await onCreateNewMission(text, currentMode);
  };

  const handleRunAll = async () => {
    if (!mission) return;
    setIsExecuting(true);
    try {
      await onExecuteAllSteps(mission.id);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-text">
      {/* En-tête de la mission active */}
      {mission ? (
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-slate-100 truncate" title={mission.title}>
                {mission.title}
              </h2>
              <span className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border ${
                mission.status === 'running' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                mission.status === 'waiting_validation' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse' :
                mission.status === 'paused' ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' :
                mission.status === 'completed' ? 'bg-slate-800 text-emerald-400 border-slate-700' :
                'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                {mission.status === 'running' ? 'En cours' :
                 mission.status === 'waiting_validation' ? 'Validation requise' :
                 mission.status === 'paused' ? 'En pause' :
                 mission.status === 'completed' ? 'Terminée' :
                 mission.status === 'cancelled' ? 'Annulée' : 'Échouée'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {mission.user_prompt}
            </p>
          </div>

          {/* Boutons d'action : Pause, Reprendre, Arrêt immédiat */}
          <div className="flex items-center gap-2">
            {mission.status !== 'completed' && mission.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => onPauseMission(mission.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {mission.status === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reprendre</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onCancelMission(mission.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 flex items-center gap-1.5 transition-colors"
                  title="Arrêt immédiat : stoppe les opérations"
                >
                  <OctagonAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Arrêt immédiat</span>
                </button>
              </>
            )}

            {mission.steps && mission.steps.some(s => s.status === 'pending') && (
              <button
                onClick={handleRunAll}
                disabled={isExecuting || mission.status === 'paused' || mission.status === 'waiting_validation'}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Exécution...' : 'Exécuter le plan'}</span>
              </button>
            )}

            {onDeleteMission && (
              <button
                onClick={() => onDeleteMission(mission.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-md transition-colors"
                title="Supprimer la mission"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Contenu principal : Plan d'exécution ou Écran zéro */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {mission ? (
          <>
            {/* Boîte d'instruction initiale */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="font-semibold text-indigo-400">Mission utilisateur :</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(mission.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
              <p className="text-slate-200 font-medium text-sm whitespace-pre-wrap leading-relaxed">
                « {mission.user_prompt} »
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-4 text-xs text-slate-400">
                <span>Mode : <strong className="text-slate-300 font-medium capitalize">{mission.permission_mode}</strong></span>
                <span>·</span>
                <span>Étapes : <strong className="text-slate-300 font-mono">{mission.steps?.length || 0}</strong></span>
              </div>
            </div>

            {/* Plan d'action détaillé */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Plan d'action de l'agent ({mission.steps?.length || 0} étapes)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Exécution séquentielle avec contrôle des invariants
                </span>
              </div>

              <div className="space-y-2">
                {(mission.steps || []).map((step) => {
                  const isExpanded = expandedStepId === step.id;
                  const isWaitingApproval = step.status === 'waiting_approval';
                  const isCompleted = step.status === 'completed';
                  const isFailed = step.status === 'failed';

                  return (
                    <div
                      key={step.id}
                      className={`rounded-xl border transition-all ${
                        isWaitingApproval
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : isCompleted
                          ? 'border-slate-800/80 bg-slate-900/30'
                          : isFailed
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : 'border-slate-800/60 bg-slate-900/10'
                      }`}
                    >
                      <div className="p-3.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 font-mono ${
                            isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            isWaitingApproval ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            isFailed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {step.step_order}
                          </span>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-200">
                                {step.description}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/80">
                                {step.tool_name}
                              </span>
                            </div>

                            {/* Preuve d'action */}
                            {step.proof && (
                              <div className="mt-2 text-xs text-emerald-300/90 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 flex items-start gap-2 font-sans">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-emerald-200">Preuve : </span>
                                  <span>{step.proof}</span>
                                </div>
                              </div>
                            )}

                            {/* Alerte si attente de validation */}
                            {isWaitingApproval && (
                              <div className="mt-2 text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Action sensible en attente de votre accord dans l'onglet « Validations ».</span>
                              </div>
                            )}

                            {/* Message d'arrêt / Erreur */}
                            {step.error && (
                              <div className="mt-2 text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/30">
                                <strong>Arrêt sécurisé : </strong> {step.error}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions par étape */}
                        <div className="flex items-center gap-2 shrink-0">
                          {step.status === 'pending' && (
                            <button
                              onClick={() => onExecuteStep(mission.id, step.id)}
                              className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            >
                              Exécuter
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Inspecter les paramètres de l'outil"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Détails techniques dépliés */}
                      {isExpanded && (
                        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs font-mono">
                          <div className="text-slate-400 mb-1 text-[11px]">Paramètres structurés :</div>
                          <pre className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300 overflow-x-auto text-[11px]">
                            {JSON.stringify(step.parameters, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Résumé de fin de mission */}
            {mission.result_summary && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs">
                <div className="font-semibold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mission terminée</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {mission.result_summary}
                </p>
              </div>
            )}
          </>
        ) : (
          /* ==========================================
             ÉCRAN D'ACCUEIL ZÉRO : PROPRE, ÉPURÉ, CLAIR
             ========================================== */
          <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Moteur d'automatisation prêt · Base propre</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Cadran Agent
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Assistant personnel local. Donnez votre mission en français : recherche web, prospection, manipulation de fichiers ou rédaction d'emails avec validation obligatoire.
              </p>
            </div>

            {/* Boîte de lancement immédiat au centre */}
            <form onSubmit={handleSubmit} className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl focus-within:border-indigo-500 transition-colors">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Que souhaitez-vous accomplir ? (ex : Trouve 20 hôtels en Occitanie...)"
                  className="flex-1 bg-transparent px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!promptInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Démarrer</span>
                </button>
              </div>
            </form>

            {/* Cartes de démarrage rapide */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Suggestions de missions prêtes à l'emploi :
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {starterCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(card.prompt);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-900/80 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-2 font-medium">
                          {card.icon}
                          <span>{card.category}</span>
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {card.title}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        « {card.prompt} »
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de saisie inférieure (uniquement quand une mission est ouverte) */}
      {mission && (
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Donner une nouvelle consigne ou démarrer une autre mission..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

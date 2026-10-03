import React, { useState } from 'react';
import { 
  CalendarClock, 
  Clock, 
  Plus, 
  Power, 
  PowerOff, 
  AlertCircle, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { ScheduleItem } from '../types/agent';

interface SchedulesViewProps {
  schedules: ScheduleItem[];
  onCreateSchedule: (title: string, prompt: string, frequency: 'daily' | 'weekly' | 'hourly', timeOfDay: string) => Promise<void>;
  onToggleSchedule: (id: string, active: boolean) => Promise<void>;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  schedules,
  onCreateSchedule,
  onToggleSchedule,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('Vérifie chaque matin mes tâches et prépare un résumé.');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'hourly'>('daily');
  const [timeOfDay, setTimeOfDay] = useState('08:00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !prompt) return;
    await onCreateSchedule(title, prompt, frequency, timeOfDay);
    setTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-y-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-rose-400" />
            <span>Missions Récurrentes et Planification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Programmez des routines régulières (ex : résumé matinal des tâches, surveillance de prospects).
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle planification</span>
        </button>
      </div>

      {/* Avertissement clair d'exécution locale */}
      <div className="mb-6 p-3.5 rounded-xl border border-sky-800/40 bg-sky-950/20 text-xs text-sky-200 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-sky-300">Fonctionnement en environnement local :</strong> Comme tout assistant desktop autonome, les missions planifiées s'exécutent lorsque votre ordinateur et le service Cadran Agent sont allumés. Si l'ordinateur est éteint, la tâche sera exécutée dès sa reprise.
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 text-xs max-w-2xl">
          <div className="font-semibold text-slate-200">Programmer une mission récurrente</div>
          
          <div>
            <label className="text-slate-400 block mb-1">Nom de la routine :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Synthèse quotidienne du matin"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Instruction / Mission :</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Fréquence :</label>
              <select
                value={frequency}
                onChange={(e: any) => setFrequency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              >
                <option value="daily">Chaque jour</option>
                <option value="weekly">Chaque semaine</option>
                <option value="hourly">Toutes les heures</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Heure d'exécution :</label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white rounded font-medium"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Liste des programmations */}
      <div className="space-y-3 max-w-3xl">
        {schedules.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/80">
            Aucune tâche récurrente active pour l'instant. Cliquez sur « Nouvelle planification » pour programmer votre premier rendez-vous automatique.
          </div>
        ) : (
          schedules.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-200 text-sm">{s.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                    s.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {s.is_active ? 'Actif' : 'Désactivé'}
                  </span>
                </div>
                <p className="text-slate-400">{s.prompt}</p>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{s.frequency === 'daily' ? `Tous les jours à ${s.time_of_day || '08:00'}` : s.frequency}</span>
                  </span>
                  {s.last_run_at && <span>Dernière exécution : {new Date(s.last_run_at).toLocaleString('fr-FR')}</span>}
                </div>
              </div>

              <button
                onClick={() => onToggleSchedule(s.id, !s.is_active)}
                className={`p-2 rounded-lg transition-colors border ${
                  s.is_active
                    ? 'border-emerald-700 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={s.is_active ? 'Désactiver' : 'Activer'}
              >
                {s.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

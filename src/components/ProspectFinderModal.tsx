import React, { useState } from 'react';
import { 
  X, 
  Target, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  Hash, 
  Wrench, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ProspectFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchProspecting: (params: { activity: string; city: string; count: number; focus: string }) => Promise<void>;
}

export const ProspectFinderModal: React.FC<ProspectFinderModalProps> = ({
  isOpen,
  onClose,
  onLaunchProspecting,
}) => {
  const [activity, setActivity] = useState('Hôtels & Hébergements de charme');
  const [city, setCity] = useState('Occitanie (Toulouse, Montpellier, Nîmes)');
  const [count, setCount] = useState(10);
  const [focus, setFocus] = useState('Site web dégradé sur mobile et absence de réservation directe');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const popularSectors = [
    { label: "Hôtels de charme", activity: "Hôtels & Auberges de charme", focus: "Absence de réservation directe sur mobile" },
    { label: "Artisans & BTP", activity: "Plombiers, Électriciens et Artisans", focus: "Site web vieillissant sans appel direct d'urgence" },
    { label: "Restaurants", activity: "Restaurants & Brasseries", focus: "Carte au format PDF non responsive et pas de résa en ligne" },
    { label: "Agences & PME", activity: "Agences de communication & PME", focus: "Lenteur de chargement et formulaires non sécurisés" }
  ];

  const handleAutonomous = () => {
    setActivity('PME & Commerces locaux indépendants');
    setCity('Grandes agglomérations de France');
    setCount(15);
    setFocus('Modernisation du site web et captation de prospects en direct');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLaunchProspecting({ activity, city, count, focus });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* En-tête */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Générateur de Prospection Ciblée</h3>
              <p className="text-[11px] text-slate-400">Trouvez des clients sur vos critères ou laissez l'agent chercher</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-5 text-xs space-y-4">
          {/* Raccourcis secteurs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-medium">Secteurs recommandés :</span>
              <button
                type="button"
                onClick={handleAutonomous}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mode autonome (Laisse l'agent choisir)</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularSectors.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActivity(s.activity);
                    setFocus(s.focus);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all text-[11px] ${
                    activity === s.activity
                      ? 'border-indigo-500 bg-indigo-950/30 text-white font-semibold'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Champ Activité */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>Secteur d'activité ou métier recherché :</span>
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Ex : Hôtels indépendants, Plombiers, Garages..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Champ Ville / Région */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Zone géographique (Ville, Département ou Région) :</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex : Occitanie, Lyon, Paris, Bordeaux..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Grille Nombre & Problématique */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Nombre :</span>
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
              >
                <option value={5}>5 prospects</option>
                <option value={10}>10 prospects</option>
                <option value={15}>15 prospects</option>
                <option value={20}>20 prospects</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span>Angle d'audit / Point d'amélioration :</span>
              </label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Ex : Ergonomie mobile, Réservation en ligne..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              L'agent lancera automatiquement le plan : recherche des acteurs, relevé des faiblesses techniques, génération du tableau CSV et rédaction des emails personnalisés.
            </span>
          </div>

          {/* Boutons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>{isSubmitting ? 'Lancement en cours...' : 'Lancer la prospection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

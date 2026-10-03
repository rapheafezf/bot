import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Download, 
  FileCode,
  FolderGit2
} from 'lucide-react';

interface DesktopPortabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopPortabilityModal: React.FC<DesktopPortabilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [runningTests, setRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setRunningTests(true);
    setTestOutput(null);
    try {
      const res = await fetch('/api/run-tests', { method: 'POST' });
      const data = await res.json();
      setTestOutput(data);
    } catch (e: any) {
      setTestOutput({ passed: false, output: e.message });
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Portabilité Desktop & Tests de Sécurité Python</h3>
              <p className="text-[11px] text-slate-400">Architecture native PySide6 + Python 3.10 + SQLite autonome</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-6">
          {/* Section 1 : Bouton d'exécution des tests Python en direct */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validation des Invariants de Sécurité (Suite Python unittest)</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Vérifie la protection anti-traversée de chemin (<code>../../etc/passwd</code>), le blocage des envois d'emails non validés, la détection des boucles répétitives et la persistance SQLite.
                </p>
              </div>

              <button
                onClick={handleRunTests}
                disabled={runningTests}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{runningTests ? 'Exécution des tests...' : 'Lancer les 8 tests Python'}</span>
              </button>
            </div>

            {testOutput && (
              <div className={`p-3 rounded-lg border font-mono text-[11px] mt-3 ${
                testOutput.passed ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Résultat d'exécution : {testOutput.passed ? 'Tous les tests ont réussi avec succès (OK)' : 'Échec détecté'}</span>
                </div>
                <pre className="p-2 bg-slate-950 rounded border border-slate-900 overflow-x-auto text-slate-200">
                  {testOutput.output}
                </pre>
              </div>
            )}
          </div>

          {/* Section 2 : Arborescence et code desktop */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Arborescence du logiciel desktop autonome (/desktop_app)</span>
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 space-y-1">
              <div>📁 <strong>desktop_app/</strong></div>
              <div className="pl-4">├── 📄 <strong>cadran_desktop.py</strong> <span className="text-slate-500">— Interface graphique native PySide6 (QThread worker, chat, plan, logs)</span></div>
              <div className="pl-4">├── 📁 <strong>engine/</strong></div>
              <div className="pl-8">├── 📄 <strong>database.py</strong> <span className="text-slate-500">— Schéma SQLite et gestionnaire de persistance</span></div>
              <div className="pl-8">├── 📄 <strong>permissions.py</strong> <span className="text-slate-500">— Bac à sable strict et 3 modes de permission</span></div>
              <div className="pl-8">├── 📄 <strong>tools.py</strong> <span className="text-slate-500">— Définition des outils (recherche, crawl, csv, emails)</span></div>
              <div className="pl-8">└── 📄 <strong>db_bridge.py</strong> <span className="text-slate-500">— Pont d'accès SQLite haute performance</span></div>
              <div className="pl-4">├── 📁 <strong>tests/</strong></div>
              <div className="pl-8">└── 📄 <strong>test_cadran.py</strong> <span className="text-slate-500">— 8 tests unitaires de sécurité et de conformité</span></div>
              <div className="pl-4">├── 📄 <strong>requirements.txt</strong> <span className="text-slate-500">— Dépendances Python (PySide6, requests, bs4)</span></div>
              <div className="pl-4">├── 📄 <strong>build_executable.sh</strong> <span className="text-slate-500">— Script de compilation PyInstaller (.exe / app)</span></div>
              <div className="pl-4">└── 📄 <strong>INSTALLATION.md</strong> <span className="text-slate-500">— Guide d'installation et de lancement pas à pas</span></div>
            </div>
          </div>

          {/* Section 3 : Commandes exactes de lancement */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Commandes de lancement sur votre système local (Linux / Windows / macOS)</span>
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-indigo-300 space-y-1.5">
              <div className="text-slate-500"># 1. Accéder au dossier desktop_app</div>
              <div>cd desktop_app</div>
              <div className="text-slate-500"># 2. Installer les dépendances dans un environnement virtuel</div>
              <div>pip install -r requirements.txt</div>
              <div className="text-slate-500"># 3. Lancer l'application desktop PySide6</div>
              <div>python cadran_desktop.py</div>
              <div className="text-slate-500"># 4. Compiler un exécutable autonome (sans Python requis sur la machine cible)</div>
              <div>./build_executable.sh</div>
            </div>
          </div>

          {/* Section 4 : Capacités prises en charge & limites claires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-slate-300 space-y-1">
              <div className="font-semibold text-emerald-400">✓ Fonctionnalités disponibles et validées</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                <li>Prospection réelle d'Occitanie & extraction de fiches</li>
                <li>Génération de fichiers CSV et Markdown dans le workspace</li>
                <li>Validation humaine stricte avant tout envoi d'email</li>
                <li>3 modes de permission (Observation / Assistance / Auto)</li>
                <li>Détection et blocage de boucles répétitives</li>
                <li>Base de données locale persistante SQLite</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-300 space-y-1">
              <div className="font-semibold text-amber-400">⚠ Non configuré ou Limites strictes</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
                <li>SMTP : « Non configuré » sans identifiants réels (zéro simulation)</li>
                <li>Contrôle Desktop : Désactivé par défaut par sécurité</li>
                <li>Accès fichiers : Strictement limité au dossier autorisé</li>
                <li>Emails de contact : Uniquement si publiés sur le site public</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pied */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

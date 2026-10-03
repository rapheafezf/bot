import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Cpu, 
  Mail, 
  FolderLock, 
  Monitor, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Key,
  ShieldAlert
} from 'lucide-react';
import { AgentSettings } from '../types/agent';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentSettings;
  onSaveSettings: (settings: AgentSettings) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AgentSettings>(settings);
  const [activeTab, setActiveTab] = useState<'ai' | 'smtp' | 'workspace' | 'desktop'>('ai');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestAi = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.ai_provider,
          url: formData.ollama_url,
          model: formData.ai_provider === 'ollama' ? formData.ollama_model : formData.gemini_model
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleTestSmtp = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: formData.smtp_host,
          port: formData.smtp_port,
          user: formData.smtp_user,
          pass: ''
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* En-tête */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Paramètres et Connexions de Cadran Agent</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre d'onglets */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs px-4">
          <button
            onClick={() => { setActiveTab('ai'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Moteurs d'IA (Local / Cloud)</span>
          </button>

          <button
            onClick={() => { setActiveTab('smtp'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'smtp'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Messagerie SMTP / IMAP</span>
          </button>

          <button
            onClick={() => { setActiveTab('workspace'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'workspace'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Dossier de travail</span>
          </button>

          <button
            onClick={() => { setActiveTab('desktop'); setTestResult(null); }}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'desktop'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Contrôle Desktop</span>
          </button>
        </div>

        {/* Corps des onglets */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Fournisseur d'IA actif :</label>
                <select
                  value={formData.ai_provider}
                  onChange={(e: any) => setFormData({ ...formData, ai_provider: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                >
                  <option value="gemini">Google Gemini API (Intégrée nativement)</option>
                  <option value="ollama">IA Locale Ollama (Gratuite, 100% sur votre machine)</option>
                  <option value="openai">API Compatible OpenAI (Clé personnalisée)</option>
                </select>
              </div>

              {formData.ai_provider === 'ollama' && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mode Local 100% Gratuit — Aucun abonnement ni envoi de données à des tiers</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">URL du serveur Ollama :</label>
                    <input
                      type="text"
                      value={formData.ollama_url}
                      onChange={(e) => setFormData({ ...formData, ollama_url: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Modèle installé :</label>
                    <input
                      type="text"
                      value={formData.ollama_model}
                      onChange={(e) => setFormData({ ...formData, ollama_model: e.target.value })}
                      placeholder="llama3:latest ou mistral"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.ai_provider === 'openai' && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Service externe payant selon la tarification du fournisseur</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">URL de base de l'API :</label>
                    <input
                      type="text"
                      value={formData.openai_url}
                      onChange={(e) => setFormData({ ...formData, openai_url: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nom du modèle :</label>
                    <input
                      type="text"
                      value={formData.openai_model}
                      onChange={(e) => setFormData({ ...formData, openai_model: e.target.value })}
                      placeholder="gpt-4o-mini"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.ai_provider === 'gemini' && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                  <div className="text-indigo-300 font-semibold">Fournisseur Gemini Server-Side</div>
                  <p className="text-slate-400">
                    Modèle recommandé : <code className="text-indigo-300 font-mono">gemini-2.5-flash</code>. Rapide, optimisé pour les tool calls structurés et les extractions.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestAi}
                  disabled={testing}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 disabled:opacity-50"
                >
                  {testing ? 'Test en cours...' : 'Tester la connexion IA'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 leading-relaxed">
                Règle formelle : Sans configuration réelle d'un serveur SMTP, le logiciel affiche <strong>« Non configuré »</strong> et ne simulera <strong>jamais</strong> un envoi réussi.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Serveur SMTP hôte :</label>
                  <input
                    type="text"
                    value={formData.smtp_host || ''}
                    onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                    placeholder="smtp.example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Port (587 / 465) :</label>
                  <input
                    type="number"
                    value={formData.smtp_port || 587}
                    onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) || 587 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Adresse d'expédition / Nom :</label>
                <input
                  type="text"
                  value={formData.smtp_from || ''}
                  onChange={(e) => setFormData({ ...formData, smtp_from: e.target.value })}
                  placeholder="Cadran Agent <contact@mon-domaine.fr>"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testing}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 disabled:opacity-50"
                >
                  {testing ? 'Vérification...' : 'Tester le serveur SMTP'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Dossier de travail autorisé :</label>
                <input
                  type="text"
                  value={formData.authorized_dir}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-400 font-mono opacity-80"
                />
              </div>
              <p className="text-slate-400 leading-relaxed">
                Toutes les opérations sur les fichiers sont strictement confinées à ce répertoire. Toute tentative de sortie (comme <code>../</code>) est interceptée et bloquée par le gestionnaire de permissions.
              </p>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-amber-800/40 bg-amber-950/20 text-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-300">Module de contrôle du bureau (Desktop)</div>
                  <p className="text-slate-300 leading-relaxed">
                    Conformément au cahier des charges, ce module est <strong>désactivé par défaut</strong>. Il ne s'exécute jamais en tâche cachée et exige une confirmation visuelle à chaque étape.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.desktop_control_enabled}
                  onChange={(e) => setFormData({ ...formData, desktop_control_enabled: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="font-medium text-slate-200">
                  Activer explicitement le module de contrôle des fenêtres desktop autorisées
                </span>
              </label>
            </div>
          )}

          {/* Affichage des résultats de test */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xs ${
              testResult.success || testResult.configured
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="font-semibold mb-1">
                {testResult.success || testResult.configured ? '✓ Test réussi :' : '✗ Échec du test :'}
              </div>
              <p className="font-mono text-[11px] whitespace-pre-wrap">
                {testResult.response || testResult.message || testResult.error || JSON.stringify(testResult)}
              </p>
              {testResult.latency_ms && (
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  Temps de réponse : {testResult.latency_ms} ms
                </div>
              )}
            </div>
          )}

          {/* Boutons d'enregistrement */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

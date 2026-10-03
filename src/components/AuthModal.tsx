import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  User as UserIcon, 
  Building,
  CheckCircle2,
  Clock,
  Settings
} from 'lucide-react';
import { User } from '../types/agent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  onOpenSettings: () => void;
  smtpConfigured: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onDeleteAccount,
  onOpenSettings,
  smtpConfigured,
}) => {
  const [step, setStep] = useState<'email' | 'code' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Envoi du code OTP par email réel
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible d'envoyer le code de vérification.");
      }

      setMessage(data.message);
      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Vérification du code OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Code invalide.");
      }

      localStorage.setItem('cadran_auth_token', data.token);
      onLoginSuccess(data.user, data.token);

      setName(data.user.name || '');
      setCompany(data.user.company || '');
      setStep('profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarde des champs optionnels du profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const token = localStorage.getItem('cadran_auth_token');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, company })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de mise à jour du profil.");
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* En-tête */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {currentUser ? "Mon Compte Utilisateur" : "Connexion & Inscription par Email"}
              </h3>
              <p className="text-[11px] text-slate-400">Authentification sécurisée par code à usage unique</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-5 text-xs space-y-4">
          {/* Si déjà connecté : affichage de la fiche et actions */}
          {currentUser && step !== 'profile' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Identifiant :</span>
                  <span className="font-mono text-slate-300 text-[11px]">{currentUser.id}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Email vérifié :</span>
                  <span className="font-medium text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{currentUser.email}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Nom complet :</span>
                  <span className="text-slate-200">{currentUser.name || "Non renseigné"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Entreprise :</span>
                  <span className="text-slate-200">{currentUser.company || "Non renseigné"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Dernière connexion :</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {currentUser.last_login_at ? new Date(currentUser.last_login_at).toLocaleString('fr-FR') : "Non renseigné"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setName(currentUser.name || '');
                    setCompany(currentUser.company || '');
                    setStep('profile');
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 text-center"
                >
                  Modifier mon profil
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700"
                >
                  Se déconnecter
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={async () => {
                    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte et vos sessions ? Cette action est irréversible.")) {
                      await onDeleteAccount();
                      onClose();
                    }
                  }}
                  className="w-full py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg text-center transition-colors text-[11px]"
                >
                  Supprimer définitivement mon compte
                </button>
              </div>
            </div>
          ) : step === 'email' ? (
            /* Étape 1 : Saisie de l'adresse email */
            <form onSubmit={handleSendCode} className="space-y-4">
              {!smtpConfigured && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-amber-300">Serveur SMTP non configuré</div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      L'envoi réel de code par email nécessite la configuration d'un serveur SMTP dans les Réglages. Aucune simulation n'est effectuée.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSettings();
                      }}
                      className="mt-1 text-[11px] underline font-semibold text-amber-300 hover:text-white flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Ouvrir les Réglages SMTP</span>
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Votre adresse email :</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.fr"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Information RGPD et données personnelles */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Utilisation de vos données :</span>
                <p className="leading-relaxed">
                  Votre adresse email est enregistrée dans la base de données SQLite locale pour sécuriser votre accès et vos missions. Aucune donnée n'est cédée à des tiers.
                </p>
              </div>

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
                  disabled={loading || !email.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>{loading ? "Envoi en cours..." : "Recevoir mon code de connexion"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : step === 'code' ? (
            /* Étape 2 : Saisie du code reçu */
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Code de vérification transmis</div>
                  <p className="text-[11px] text-emerald-200/80">
                    {message || `Un code à 6 chiffres a été envoyé à ${email}. Il expire dans 15 minutes.`}
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Saisissez le code à 6 chiffres :</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-xl font-mono tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-400 hover:text-white"
                >
                  Modifier l'email
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>{loading ? "Vérification..." : "Vérifier et se connecter"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Étape 3 : Compléter son profil (optionnel) */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs">
                <span className="font-semibold text-emerald-400">✓ Email vérifié avec succès !</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Vous pouvez renseigner votre nom et votre entreprise (facultatif) pour personnaliser vos missions.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Votre nom ou prénom (facultatif) :</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Raphaël B."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Votre entreprise ou activité (facultatif) :</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex : Agence Conseil Occitanie"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  Passer cette étape
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>{loading ? "Enregistrement..." : "Enregistrer mon profil"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Mail, 
  FileText, 
  ShieldAlert, 
  Send, 
  CheckSquare, 
  UserCheck, 
  Paperclip,
  Clock
} from 'lucide-react';
import { ValidationRequest } from '../types/agent';

interface ValidationScreenProps {
  validations: ValidationRequest[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  smtpConfigured: boolean;
}

export const ValidationScreen: React.FC<ValidationScreenProps> = ({
  validations,
  onApprove,
  onReject,
  smtpConfigured,
}) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'pending' | 'resolved'>('pending');

  const pendingList = validations.filter(v => v.status === 'pending');
  const resolvedList = validations.filter(v => v.status !== 'pending');
  const currentList = filter === 'pending' ? pendingList : resolvedList;

  const handleConfirmReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    await onReject(id, rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-y-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Validations Humaines Obligatoires</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Par principe de sécurité, aucune communication, écriture sensible ou action critique n'est exécutée sans votre accord explicite.
          </p>
        </div>

        {/* Filtres segmented controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            En attente ({pendingList.length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              filter === 'resolved'
                ? 'bg-slate-800 text-slate-200 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historique ({resolvedList.length})
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {currentList.length === 0 ? (
        <div className="max-w-md mx-auto my-auto text-center py-12 text-slate-500 text-xs">
          <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
          <p className="font-medium text-slate-400">
            {filter === 'pending' ? "Aucune validation en attente d'approbation." : "Aucune validation archivée."}
          </p>
          <p className="mt-1">
            Les actions critiques préparées par l'agent apparaîtront ici avant toute exécution.
          </p>
        </div>
      ) : (
        <div className="space-y-5 max-w-4xl mx-auto w-full">
          {currentList.map((val) => {
            const isPending = val.status === 'pending';
            const isEmail = val.type === 'email_send';

            return (
              <div
                key={val.id}
                className={`rounded-xl border p-5 transition-all ${
                  isPending
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-black/40'
                    : val.status === 'approved'
                    ? 'border-slate-800 bg-slate-900/40 opacity-80'
                    : 'border-rose-900/40 bg-slate-900/40 opacity-80'
                }`}
              >
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isEmail ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {isEmail ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{val.title}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Créé le {new Date(val.created_at).toLocaleString('fr-FR')}</span>
                        {val.status !== 'pending' && (
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            val.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {val.status === 'approved' ? 'Validé' : 'Refusé'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* État de la connexion SMTP si email */}
                  {isEmail && isPending && (
                    <div className="text-right">
                      <span className={`text-[11px] px-2.5 py-1 rounded font-medium border ${
                        smtpConfigured
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      }`}>
                        {smtpConfigured ? 'SMTP Connecté' : 'SMTP Non configuré'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Détails stricts de l'envoi (Compte, Destinataire, Objet, Texte, Pièces) */}
                {isEmail && val.payload && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Compte utilisé :</span>
                        <span className="text-slate-200 font-mono">{val.payload.account || 'contact@cadran-agent.local'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Destinataire unique :</span>
                        <span className="text-indigo-300 font-mono font-medium">{val.payload.to_email || 'Non spécifié'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">Objet du message :</span>
                      <span className="text-slate-100 font-semibold">{val.payload.subject || 'Sans objet'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">Texte intégral du message :</span>
                      <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {val.payload.body}
                      </div>
                    </div>

                    {val.payload.attachments && val.payload.attachments.length > 0 && (
                      <div className="pt-2 flex items-center gap-2 text-slate-400">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Pièce(s) jointe(s) autorisée(s) :</span>
                        {val.payload.attachments.map((att: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                            {att}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Justification de refus si refusé */}
                {val.status === 'rejected' && val.justification && (
                  <div className="mt-3 p-3 rounded bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300">
                    <strong>Motif du refus : </strong> {val.justification}
                  </div>
                )}

                {/* Avertissement de sécurité et boutons d'action */}
                {isPending && (
                  <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 max-w-lg">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Votre validation autorise <strong>uniquement</strong> le contenu affiché ci-dessus. Aucune modification ultérieure n'est permise sans nouvelle validation.</span>
                    </p>

                    <div className="flex items-center gap-2">
                      {rejectingId === val.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Motif du refus..."
                            className="bg-slate-950 border border-rose-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                          />
                          <button
                            onClick={() => handleConfirmReject(val.id)}
                            className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-semibold"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRejectingId(val.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:border-rose-800/80 hover:bg-rose-950/20 text-slate-300 hover:text-rose-300 transition-colors"
                        >
                          Refuser l'action
                        </button>
                      )}

                      <button
                        onClick={() => onApprove(val.id)}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Valider et autoriser</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

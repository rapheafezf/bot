import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  MailCheck, 
  Eye, 
  ShieldCheck, 
  Search,
  ExternalLink
} from 'lucide-react';

export interface SentEmail {
  id: string;
  mission_id: string;
  validation_id: string;
  recipient: string;
  subject: string;
  body: string;
  delivery_mode: string;
  status: string;
  delivery_proof: string;
  sent_at: string;
}

interface SentEmailsViewProps {
  sentEmails: SentEmail[];
}

export const SentEmailsView: React.FC<SentEmailsViewProps> = ({ sentEmails }) => {
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(
    sentEmails.length > 0 ? sentEmails[0] : null
  );
  const [search, setSearch] = useState('');

  const filtered = sentEmails.filter(e => 
    e.recipient.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* En-tête */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-emerald-400" />
            <span>Boîte d'Envoi Certifiée ({sentEmails.length} messages délivrés)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique inaltérable des communications validées et transmises aux destinataires avec horodatage certifié.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par destinataire ou objet..."
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des emails envoyés */}
        <div className="w-96 border-r border-slate-800 bg-slate-900/20 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {sentEmails.length === 0 
                ? "Aucun email envoyé pour l'instant. Lancez une mission, approuvez le message dans l'onglet Validations et il apparaîtra ici."
                : "Aucun email ne correspond à votre recherche."}
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedEmail?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEmail(item)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-slate-800/90 border-slate-700 shadow-sm'
                      : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-emerald-400 font-semibold truncate max-w-[180px]">
                      {item.recipient}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(item.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {item.subject}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {item.body}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Détail du message envoyé */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-6 flex flex-col">
          {selectedEmail ? (
            <div className="max-w-3xl space-y-4 text-xs">
              {/* Badge de délivrance */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300">Preuve de transmission : </span>
                  <span className="text-emerald-200/90">{selectedEmail.delivery_proof}</span>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Destinataire certifié :</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedEmail.recipient}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Date et heure d'envoi :</span>
                  <span className="font-mono text-slate-300">{new Date(selectedEmail.sent_at).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Canal de transmission :</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-indigo-300 text-[11px]">
                    {selectedEmail.delivery_mode === 'smtp' ? 'Serveur SMTP externe' : 'Répartiteur direct Cadran Agent'}
                  </span>
                </div>
              </div>

              {/* Objet et Corps du message */}
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-100">
                  Objet : {selectedEmail.subject}
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {selectedEmail.body}
                </div>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center text-slate-500 text-xs py-8">
              Sélectionnez un message envoyé pour consulter les détails d'acheminement et le texte complet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

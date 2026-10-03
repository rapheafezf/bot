import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Users, 
  UserCheck, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Ban, 
  RotateCcw,
  Clock
} from 'lucide-react';
import { AdminUser } from '../types/agent';

interface AdminViewProps {
  onBackToMissions: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToMissions }) => {
  const [pinCode, setPinCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Données administrateur réelles
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [totalConnected, setTotalConnected] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [connectedOnly, setConnectedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fiche détaillée
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Vérification de déverrouillage préalable en session
  useEffect(() => {
    const savedToken = sessionStorage.getItem('cadran_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsUnlocked(true);
    }
  }, []);

  // Chargement des vrais utilisateurs depuis SQLite
  const fetchUsers = async () => {
    if (!isUnlocked) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8',
        status: statusFilter,
        connected_only: connectedOnly ? 'true' : 'false',
        search: searchTerm
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'x-admin-code': '3105',
          'Authorization': adminToken || ''
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setIsUnlocked(false);
          sessionStorage.removeItem('cadran_admin_token');
          throw new Error("Session administrateur expirée ou code 3105 requis.");
        }
        throw new Error("Erreur de chargement des utilisateurs.");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotalRegistered(data.total_registered || 0);
      setTotalConnected(data.total_connected || 0);
      setTotalFiltered(data.total_filtered || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchUsers();
    }
  }, [isUnlocked, currentPage, connectedOnly, statusFilter, searchTerm]);

  // Déverrouillage avec le code 3105
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    try {
      const res = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pinCode.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Code d'accès incorrect.");
      }

      sessionStorage.setItem('cadran_admin_token', data.adminToken);
      setAdminToken(data.adminToken);
      setIsUnlocked(true);
      setPinCode('');
    } catch (err: any) {
      setUnlockError(err.message);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('cadran_admin_token');
    setAdminToken(null);
    setIsUnlocked(false);
  };

  // Basculer l'état Actif / Désactivé
  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'x-admin-code': '3105',
          'Authorization': adminToken || ''
        }
      });
      if (res.ok) {
        await fetchUsers();
        if (selectedUser?.id === userId) {
          const updatedRes = await res.json();
          setSelectedUser({ ...selectedUser, status: updatedRes.status });
        }
      }
    } catch (err) {
      console.error("Erreur statut:", err);
    }
  };

  // Suppression définitive d'un compte utilisateur
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive du compte ${email} ?\nToutes ses sessions seront révoquées.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-code': '3105',
          'Authorization': adminToken || ''
        }
      });
      if (res.ok) {
        if (selectedUser?.id === userId) setSelectedUser(null);
        await fetchUsers();
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // ==========================================
  // ÉCRAN DE DÉVERROUILLAGE (CODE 3105)
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-950 p-6 select-none">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-100">Espace Administrateur</h2>
            <p className="text-xs text-slate-400 mt-1">
              Saisissez le code d'accès de sécurité pour déverrouiller l'affichage des comptes enregistrés.
            </p>
          </div>

          {unlockError && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
              {unlockError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Code à 4 chiffres (3105)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xl font-mono tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!pinCode.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>Déverrouiller l'accès</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={onBackToMissions}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ← Retour à l'application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ÉCRAN ADMINISTRATEUR DÉVERROUILLÉ
  // ==========================================
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-text">
      {/* En-tête avec indicateurs réels */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Administration des Comptes Utilisateurs</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              Déverrouillé (Code 3105)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Données persistées dans SQLite local. Aucun compte fictif n'est généré.
          </p>
        </div>

        {/* Compteurs réels certifiés */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs">
            <Users className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-slate-400 text-[10px] block leading-tight">Total inscrits</span>
              <strong className="text-slate-100 font-mono text-sm">{totalRegistered}</strong>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-400 text-[10px] block leading-tight" title="Ayant déjà réussi au moins une connexion (ne signifie pas qu'ils sont en ligne actuellement)">
                Déjà connectés
              </span>
              <strong className="text-emerald-400 font-mono text-sm">{totalConnected}</strong>
            </div>
          </div>

          <button
            onClick={handleLock}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres combinables */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Recherche par email, nom, entreprise, id..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="disabled">Suspendus</option>
          </select>

          {/* Filtre "Seulement ceux qui se sont déjà connectés" */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={connectedOnly}
              onChange={(e) => {
                setConnectedOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
            />
            <span>Déjà connectés uniquement</span>
          </label>
        </div>

        <button
          onClick={fetchUsers}
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Corps principal : Tableau et Fiche détaillée */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Chargement des comptes en cours...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-slate-300 font-semibold text-sm">
                  {totalRegistered === 0 
                    ? "Aucun utilisateur inscrit pour le moment." 
                    : "Aucun utilisateur ne correspond à ces critères."}
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  {totalRegistered === 0
                    ? "Les nouveaux utilisateurs créés via la connexion email s'afficheront directement ici."
                    : "Modifiez votre recherche ou décochez les filtres pour afficher l'ensemble des comptes."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Identifiant & Email</th>
                    <th className="py-2.5 px-3">Nom & Entreprise</th>
                    <th className="py-2.5 px-3">Inscription</th>
                    <th className="py-2.5 px-3">Dernière Connexion</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const hasConnected = u.last_login_at && !u.last_login_at.includes('jamais');

                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-slate-800/80 text-white'
                            : 'hover:bg-slate-900/50 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span>{u.email}</span>
                            {u.email_verified && (
                              <span title="Email vérifié par code à usage unique">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {u.id}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-200 font-medium">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.company}</div>
                        </td>

                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>

                        <td className="py-3 px-3">
                          {hasConnected ? (
                            <div className="text-slate-200 font-mono text-[11px]">
                              {new Date(u.last_login_at).toLocaleString('fr-FR')}
                              <span className="block text-[10px] text-slate-500">
                                ({u.login_count} connexion{u.login_count > 1 ? 's' : ''})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">Non renseigné (jamais connecté)</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          }`}>
                            {u.status === 'active' ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(u.id);
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                u.status === 'active'
                                  ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                                  : 'text-amber-400 hover:text-emerald-400 hover:bg-slate-800'
                              }`}
                              title={u.status === 'active' ? "Suspendre le compte" : "Réactiver le compte"}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(u.id, u.email);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Supprimer définitivement l'utilisateur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>
                Page <strong className="text-slate-200">{currentPage}</strong> sur <strong className="text-slate-200">{totalPages}</strong> ({totalFiltered} résultats)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Précédent</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center gap-1"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Volet latéral : Fiche détaillée du compte */}
        <div className="w-96 bg-slate-950 p-4 overflow-y-auto shrink-0 flex flex-col justify-between text-xs space-y-4">
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-slate-100 text-sm">Fiche Utilisateur Réelle</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Identifiant unique :</span>
                  <span className="font-mono text-slate-200 text-xs">{selectedUser.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Adresse Email :</span>
                  <span className="font-medium text-slate-100 text-xs">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Nom complet :</span>
                  <span className="text-slate-200">{selectedUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Entreprise / Organisation :</span>
                  <span className="text-slate-200">{selectedUser.company}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Date d'inscription :</span>
                  <span className="font-mono text-slate-300">{new Date(selectedUser.created_at).toLocaleString('fr-FR')}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Dernière connexion réussie :</span>
                  <span className="font-mono text-slate-300">
                    {selectedUser.last_login_at.includes('jamais')
                      ? "Non renseigné (jamais connecté)"
                      : new Date(selectedUser.last_login_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Vérification email :</span>
                  <span className="text-emerald-400 font-semibold">✓ Vérifié par code à usage unique</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Statut du compte :</span>
                  <span className={`font-semibold ${selectedUser.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedUser.status === 'active' ? 'Compte Actif' : 'Compte Suspendu'}
                  </span>
                </div>
              </div>

              {/* Avertissement de sécurité et anti-fuite */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                🔒 <strong>Sécurité renforcée :</strong> Les jetons de session, codes de vérification OTP et secrets d'authentification ne sont jamais affichés ni retournés par l'API.
              </div>

              {/* Actions d'administration */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleToggleStatus(selectedUser.id)}
                  className={`w-full py-2 rounded-lg font-medium text-xs border transition-colors ${
                    selectedUser.status === 'active'
                      ? 'border-amber-900/60 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40'
                      : 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40'
                  }`}
                >
                  {selectedUser.status === 'active' ? 'Suspendre ce compte' : 'Réactiver ce compte'}
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}
                  className="w-full py-2 rounded-lg font-medium text-xs border border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer définitivement</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center text-slate-500 text-xs py-8">
              Sélectionnez un utilisateur dans le tableau pour afficher sa fiche complète.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

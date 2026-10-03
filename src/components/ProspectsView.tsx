import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Download, 
  Search, 
  ExternalLink, 
  Ban, 
  Mail, 
  AlertCircle, 
  Check, 
  Filter, 
  Eye, 
  FileSpreadsheet,
  Building2,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  RotateCcw,
  Calendar,
  Globe
} from 'lucide-react';
import { Prospect } from '../types/agent';

interface ProspectsViewProps {
  prospects: Prospect[];
  onExcludeProspect: (id: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Fonction de normalisation locale des accents, casse et espaces
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export const ProspectsView: React.FC<ProspectsViewProps> = ({
  prospects,
  onExcludeProspect,
  isLoading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'collected_at' | 'company_name' | 'city' | 'activity'>('collected_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Déduplication stricte des prospects par (nom normalisé + ville)
  const deduplicatedProspects = useMemo(() => {
    const seen = new Set<string>();
    const list: Prospect[] = [];
    for (const p of prospects) {
      const key = `${normalizeText(p.company_name)}|${normalizeText(p.city || '')}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }, [prospects]);

  // Liste des villes et activités uniques
  const availableCities = useMemo(() => {
    const cities = deduplicatedProspects.map(p => p.city).filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set(cities)).sort();
  }, [deduplicatedProspects]);

  const availableActivities = useMemo(() => {
    const acts = deduplicatedProspects.map(p => p.activity).filter((a): a is string => Boolean(a && a.trim()));
    return Array.from(new Set(acts)).sort();
  }, [deduplicatedProspects]);

  // Filtrage combinable insensible aux accents, casse et espaces inutiles
  const filtered = useMemo(() => {
    return deduplicatedProspects.filter(p => {
      // Filtre statut
      if (selectedStatus === 'excluded' && !p.is_excluded) return false;
      if (selectedStatus === 'active' && p.is_excluded) return false;
      if (selectedStatus !== 'all' && selectedStatus !== 'excluded' && selectedStatus !== 'active' && p.status !== selectedStatus) {
        return false;
      }

      // Filtre ville
      if (selectedCity !== 'all' && normalizeText(p.city || '') !== normalizeText(selectedCity)) {
        return false;
      }

      // Filtre activité
      if (selectedActivity !== 'all' && normalizeText(p.activity || '') !== normalizeText(selectedActivity)) {
        return false;
      }

      // Recherche multi-champs
      if (searchTerm.trim() !== '') {
        const q = normalizeText(searchTerm);
        const matchName = normalizeText(p.company_name).includes(q);
        const matchCity = normalizeText(p.city || '').includes(q);
        const matchActivity = normalizeText(p.activity || '').includes(q);
        const matchWebsite = normalizeText(p.website || '').includes(q);
        const matchObs = normalizeText(p.observations || '').includes(q);
        if (!matchName && !matchCity && !matchActivity && !matchWebsite && !matchObs) {
          return false;
        }
      }

      return true;
    });
  }, [deduplicatedProspects, searchTerm, selectedCity, selectedActivity, selectedStatus]);

  // Tri dynamique
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = normalizeText(valA);
      if (typeof valB === 'string') valB = normalizeText(valB);

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedActivity('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleDownloadCsv = () => {
    if (filtered.length === 0) return;
    const headers = [
      "Nom Entreprise",
      "Ville",
      "Activité",
      "Site Web",
      "Email Public",
      "Téléphone",
      "Date Collecte",
      "Source",
      "Observations",
      "Hypothèses",
      "Informations Manquantes"
    ];
    const rows = filtered.map(p => [
      `"${p.company_name.replace(/"/g, '""')}"`,
      `"${(p.city || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${(p.activity || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${(p.website || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${(p.email || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${(p.phone || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${new Date(p.collected_at).toLocaleDateString('fr-FR')}"`,
      `"${(p.source_url || 'Source publique').replace(/"/g, '""')}"`,
      `"${(p.observations || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${(p.hypotheses || 'Non renseigné').replace(/"/g, '""')}"`,
      `"${(p.missing_info || 'Non renseigné').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prospects_cadran_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Barre d'outils supérieure */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Fiches Prospects Réelles ({filtered.length} affichée{filtered.length > 1 ? 's' : ''} sur {deduplicatedProspects.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sources publiques accessibles et registres vérifiés. Aucune donnée fictive inventée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={handleDownloadCsv}
            disabled={filtered.length === 0}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exporter CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Barre de filtres avancés */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Champ de recherche principal */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher par nom, ville, activité, site web ou observation..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filtre Ville */}
        {availableCities.length > 0 && (
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Toutes les villes</option>
            {availableCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Filtre Activité */}
        {availableActivities.length > 0 && (
          <select
            value={selectedActivity}
            onChange={(e) => {
              setSelectedActivity(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Toutes activités</option>
            {availableActivities.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}

        {/* Filtre Statut */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs uniquement</option>
          <option value="excluded">Exclus uniquement</option>
          <option value="new">Nouveaux</option>
          <option value="contacted">Contactés</option>
        </select>

        {/* Tri */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-300 text-xs px-2 py-1 focus:outline-none"
          >
            <option value="collected_at">Date de collecte</option>
            <option value="company_name">Nom entreprise</option>
            <option value="city">Ville</option>
            <option value="activity">Activité</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-slate-400 hover:text-white"
            title={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bouton Réinitialiser filtres si actifs */}
        {(searchTerm || selectedCity !== 'all' || selectedActivity !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* État de chargement ou d'erreur */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-slate-400">
          Chargement des fiches prospects en cours...
        </div>
      )}

      {error && (
        <div className="m-4 p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* Grille principale : Tableau et Fiche détaillée */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tableau des prospects */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
          <div className="flex-1 overflow-y-auto">
            {paginated.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-slate-300 font-semibold text-sm">
                  {prospects.length === 0
                    ? "Aucun prospect en base pour le moment."
                    : "Aucun résultat ne correspond à vos filtres de recherche."}
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  {prospects.length === 0
                    ? "Lancez une mission de prospection ou utilisez le bouton « Trouver des clients » pour peupler la base."
                    : "Modifiez vos critères ou réinitialisez les filtres pour afficher l'ensemble des données."}
                </p>
                {prospects.length > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Entreprise</th>
                    <th className="py-2.5 px-3">Activité & Ville</th>
                    <th className="py-2.5 px-3">Contact & Site</th>
                    <th className="py-2.5 px-3">Date Collecte</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginated.map((p) => {
                    const isSelected = selectedProspect?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProspect(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-slate-800/80 text-white'
                            : 'hover:bg-slate-900/50 text-slate-300'
                        } ${p.is_excluded ? 'opacity-50' : ''}`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span>{p.company_name}</span>
                            {p.is_excluded && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                Exclu
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={p.observations || ''}>
                            {p.observations || "Non renseigné"}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-300 font-medium">{p.activity || "Non renseigné"}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{p.city || "Non renseigné"}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {p.website ? (
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">{p.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Non renseigné</span>
                          )}
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px]">
                            {p.email || "Non renseigné"}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">
                          {p.collected_at ? new Date(p.collected_at).toLocaleDateString('fr-FR') : "Non renseigné"}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProspect(p);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Inspecter la fiche"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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
                Page <strong className="text-slate-200">{currentPage}</strong> sur <strong className="text-slate-200">{totalPages}</strong> ({filtered.length} résultats)
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

        {/* Volet latéral : Fiche détaillée du prospect */}
        <div className="w-96 bg-slate-950 p-4 overflow-y-auto shrink-0 flex flex-col justify-between text-xs space-y-4">
          {selectedProspect ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>Fiche ID : {selectedProspect.id}</span>
                  <span className="font-mono text-slate-500">
                    {new Date(selectedProspect.collected_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{selectedProspect.company_name}</h3>
                <p className="text-xs text-cyan-400 mt-0.5">{selectedProspect.activity || "Non renseigné"}</p>
              </div>

              {/* Coordonnées */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Coordonnées publiques :</div>
                <div className="space-y-1 text-xs">
                  <div>Ville : <strong className="text-slate-200 font-medium">{selectedProspect.city || "Non renseigné"}</strong></div>
                  <div>Site Web : {selectedProspect.website ? (
                    <a href={selectedProspect.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                      {selectedProspect.website}
                    </a>
                  ) : <span className="text-slate-500">Non renseigné</span>}</div>
                  <div>Email public : <strong className="text-slate-200 font-mono">{selectedProspect.email || "Non renseigné"}</strong></div>
                  <div>Téléphone : <strong className="text-slate-200 font-mono">{selectedProspect.phone || "Non renseigné"}</strong></div>
                  <div>Source : <span className="text-slate-400">{selectedProspect.source_url || "Source publique certifiée"}</span></div>
                </div>
              </div>

              {/* Fait vérifié / Observation */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Observation constatée sur le site :</div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {selectedProspect.observations || "Non renseigné"}
                </p>
              </div>

              {/* Hypothèse d'amélioration */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-indigo-400 uppercase">Hypothèse d'amélioration :</div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedProspect.hypotheses || "Non renseigné"}
                </p>
              </div>

              {/* Données manquantes */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-amber-400 uppercase">Informations manquantes / à vérifier :</div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {selectedProspect.missing_info || "Non renseigné"}
                </p>
              </div>

              {/* Action d'exclusion */}
              {!selectedProspect.is_excluded ? (
                <button
                  onClick={() => onExcludeProspect(selectedProspect.id)}
                  className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/60 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Exclure définitivement ce prospect</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-center text-rose-400 text-[11px]">
                  Prospect marqué comme exclu des futures approches.
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center text-slate-500 text-xs py-8">
              Sélectionnez une entreprise dans le tableau pour afficher sa fiche complète d'audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

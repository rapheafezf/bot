import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  FileText, 
  FileSpreadsheet, 
  History, 
  Download, 
  Eye, 
  ShieldCheck, 
  RefreshCw,
  FileCode,
  FileArchive
} from 'lucide-react';
import { WorkspaceFile } from '../types/agent';

interface FilesWorkspaceViewProps {
  files: WorkspaceFile[];
  onRefreshFiles: () => Promise<void>;
}

export const FilesWorkspaceView: React.FC<FilesWorkspaceViewProps> = ({
  files,
  onRefreshFiles,
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      handleOpenFile(files[0].name);
    }
  }, [files]);

  const handleOpenFile = async (filename: string) => {
    setSelectedFile(filename);
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/workspace/files/${encodeURIComponent(filename)}`);
      const data = await res.json();
      setFileContent(data.content || '');
    } catch (e) {
      setFileContent('Erreur lors de la lecture du fichier.');
    } finally {
      setLoadingContent(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.csv')) return <FileSpreadsheet className="w-4 h-4 text-cyan-400" />;
    if (filename.endsWith('.md')) return <FileText className="w-4 h-4 text-indigo-400" />;
    if (filename.includes('.bak')) return <History className="w-4 h-4 text-amber-400" />;
    return <FileCode className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* En-tête */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-emerald-400" />
            <span>Dossier de Travail Sécurisé (workspace_cadran/)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zone isolée. Sauvegarde automatique (.bak) avant chaque écriture. Bloque tout accès aux dossiers système.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshFiles}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Rafraîchir les fichiers"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Explorateur et visualiseur */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des fichiers */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/20 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
            Fichiers autorisés ({files.length})
          </div>

          {files.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              Aucun fichier dans le dossier pour le moment. Exécutez une mission pour générer un rapport ou un export CSV.
            </div>
          ) : (
            files.map((f) => {
              const isSelected = selectedFile === f.name;
              return (
                <div
                  key={f.name}
                  onClick={() => handleOpenFile(f.name)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getFileIcon(f.name)}
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums shrink-0">
                    {f.size_bytes > 1024 ? `${(f.size_bytes / 1024).toFixed(1)} Ko` : `${f.size_bytes} o`}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Visionneuse de contenu */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="p-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile)}
                  <span className="font-semibold text-slate-200">{selectedFile}</span>
                  {selectedFile.includes('.bak') && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                      Copie de sauvegarde
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>Lecture sécurisée</span>
                </div>
              </div>

              <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/80">
                {loadingContent ? (
                  <div className="text-slate-500">Chargement du contenu...</div>
                ) : (
                  <pre className="whitespace-pre-wrap">{fileContent || '(Fichier vide)'}</pre>
                )}
              </div>
            </>
          ) : (
            <div className="my-auto text-center text-slate-500 text-xs py-12">
              Sélectionnez un fichier pour prévisualiser son contenu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

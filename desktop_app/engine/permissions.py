"""
Cadran Agent - Gestionnaire de permissions et de sécurité.
Enforce les 3 modes:
1. 'observation' : lecture seule, aucune écriture, aucun envoi, aucune modification.
2. 'assistance' : propose des actions, planifie, demande validation systématique pour les opérations d'écriture et d'envoi.
3. 'strict_automation' (Automatisation encadrée) : exécute automatiquement les outils de niveau 'safe', demande validation humaine obligatoire pour les outils 'critical' (envoi d'email, suppression de fichier, modifications système).
"""

import os
from typing import Tuple, Optional

# Niveaux de risque
RISK_SAFE = "safe"              # Lecture, recherche, scan, brouillon
RISK_MODERATE = "moderate"      # Écriture de fichier, création de rapports
RISK_CRITICAL = "critical"      # Envoi d'email, suppression, requête externe sensible

TOOL_RISKS = {
    "browser_search": RISK_SAFE,
    "browser_fetch_page": RISK_SAFE,
    "prospect_collect": RISK_SAFE,
    "file_list": RISK_SAFE,
    "file_read": RISK_SAFE,
    "file_write": RISK_MODERATE,
    "file_export_csv": RISK_SAFE,
    "file_export_markdown": RISK_SAFE,
    "email_draft_create": RISK_SAFE,
    "email_send": RISK_CRITICAL,
    "file_delete": RISK_CRITICAL,
    "desktop_action": RISK_CRITICAL,
}

class SecurityError(Exception):
    pass

class PermissionManager:
    def __init__(self, mode: str = "assistance", authorized_dir: Optional[str] = None):
        self.mode = mode if mode in ["observation", "assistance", "strict_automation"] else "assistance"
        if authorized_dir:
            self.authorized_dir = os.path.abspath(authorized_dir)
        else:
            base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.authorized_dir = os.path.join(base, "workspace_cadran")
        
        # S'assure que le dossier autorisé existe
        os.makedirs(self.authorized_dir, exist_ok=True)

    def validate_file_path(self, target_path: str) -> str:
        """
        Vérifie qu'un chemin cible est strictement contenu dans le dossier de travail autorisé.
        Bloque toute tentative de traversée de chemin (../, symlinks dangereux, accès racine ou /etc).
        """
        if not target_path:
            raise SecurityError("Chemin de fichier non spécifié.")
        
        # Résout le chemin absolu
        if os.path.isabs(target_path):
            norm_target = os.path.abspath(target_path)
        else:
            norm_target = os.path.abspath(os.path.join(self.authorized_dir, target_path))

        # Vérification anti-traversée
        common = os.path.commonpath([self.authorized_dir, norm_target])
        if common != self.authorized_dir:
            raise SecurityError(
                f"Accès refusé : Le chemin '{target_path}' est situé hors du dossier autorisé ('{self.authorized_dir}')."
            )

        # Bloque spécifiquement les fichiers secrets sensibles
        basename = os.path.basename(norm_target).lower()
        if basename in [".env", "id_rsa", "credentials.json", "token.json", "shadow", "passwd"]:
            raise SecurityError(f"Accès interdit aux fichiers système ou de secrets : '{basename}'.")

        return norm_target

    def check_tool_permission(self, tool_name: str, parameters: dict) -> Tuple[bool, bool, str]:
        """
        Retourne (is_allowed, requires_human_approval, reason)
        - is_allowed: False si l'action est formellement interdite par le mode actuel.
        - requires_human_approval: True si l'action nécessite une confirmation explicite de l'utilisateur.
        """
        risk = TOOL_RISKS.get(tool_name, RISK_CRITICAL)

        # 1. Mode Observation : Lecture seule stricte
        if self.mode == "observation":
            if risk != RISK_SAFE:
                return False, False, f"Mode Observation actif : l'outil '{tool_name}' modifie des données et est interdit."
            return True, False, "Autorisé en lecture (Mode Observation)."

        # 2. Mode Assistance : Demande systématiquement validation pour tout ce qui n'est pas purement passif
        if self.mode == "assistance":
            if risk in [RISK_MODERATE, RISK_CRITICAL]:
                return True, True, f"Mode Assistance : l'outil '{tool_name}' requiert votre validation préalable."
            return True, False, "Autorisé (action sécurisée)."

        # 3. Mode Automatisation Encadrée :
        # Exécute automatiquement les outils 'safe' et 'moderate',
        # MAIS exige toujours la validation humaine pour les outils 'critical' (envois d'emails, suppressions).
        if self.mode == "strict_automation":
            if risk == RISK_CRITICAL:
                return True, True, f"Opération critique '{tool_name}' : validation humaine obligatoire par principe de précaution."
            return True, False, "Autorisé automatiquement sous encadrement."

        return False, False, "Mode de permission non reconnu."

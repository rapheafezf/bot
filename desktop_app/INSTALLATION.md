# Cadran Agent — Guide d'Installation et Exécution Locale

Cadran Agent est un assistant personnel desktop conçu pour exécuter des missions concrètes en toute transparence, avec un contrôle strict des accès et une validation humaine obligatoire pour les actions sensibles.

---

## 1. Prérequis Système

- **Système d'exploitation** : Linux (Ubuntu, Debian, Fedora), Windows 10/11, macOS (Intel ou Apple Silicon)
- **Python** : Python 3.10 ou supérieur (avec `sqlite3` intégré)
- **Optionnel** : Navigateur Chromium / Google Chrome ou instance locale Ollama (`http://localhost:11434`)

---

## 2. Installation Rapide en 3 Étapes

### Étape 1 : Créer l'environnement virtuel Python
```bash
# Dans le dossier desktop_app
cd desktop_app
python3 -m venv venv

# Activation sous Linux / macOS :
source venv/bin/activate

# Activation sous Windows (PowerShell) :
.\venv\Scripts\Activate.ps1
```

### Étape 2 : Installer les dépendances
```bash
pip install -r requirements.txt
```

### Étape 3 : Lancer l'application Desktop (PySide6)
```bash
python cadran_desktop.py
```

---

## 3. Création d'un Exécutable Autonome (Sans Python Préinstallé)

Pour distribuer le logiciel sous forme d'application autonome :

```bash
chmod +x build_executable.sh
./build_executable.sh
```

L'exécutable généré se trouvera dans :
- **Linux** : `dist/CadranAgent/CadranAgent`
- **Windows** : `dist/CadranAgent/CadranAgent.exe`
- **macOS** : `dist/CadranAgent.app`

---

## 4. Architecture et Principes de Sécurité

1. **Bac à sable strict (`workspace_cadran/`)** :
   - L'agent ne peut lire, créer ou modifier des fichiers qu'à l'intérieur du dossier autorisé.
   - Toute traversée de répertoire (`../`) ou tentative d'accès à des fichiers sensibles (`.env`, `/etc/passwd`, clés privées) est interceptée et bloquée immédiatement.
2. **Trois Modes de Permissions** :
   - **Observation** : Lecture seule, recherche passive, aucun fichier modifié, aucun email envoyé.
   - **Assistance** : L'agent planifie et prépare tout, mais demande votre validation explicite avant toute écriture ou envoi.
   - **Automatisation encadrée** : Les lectures et créations de rapports sont automatisées ; **l'envoi d'emails et suppressions exigent toujours votre confirmation**.
3. **Zéro Simulation pour les Emails** :
   - Si les paramètres SMTP/IMAP ne sont pas renseignés, l'application affiche clairement « Non configuré » et n'invente jamais un envoi réussi.
4. **Vérification des Données** :
   - Dans les missions de prospection, l'agent ne fabrique aucun email de contact. Il sépare les observations avérées, les hypothèses et les informations manquantes.

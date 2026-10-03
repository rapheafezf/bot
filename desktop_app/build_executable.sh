#!/usr/bin/env bash
# Script de compilation de Cadran Agent en exécutable autonome sans dépendance Python externe
set -e

echo "=== Compilation de Cadran Agent via PyInstaller ==="

if ! command -v pyinstaller &> /dev/null; then
    echo "PyInstaller n'est pas installé. Installation..."
    pip install pyinstaller
fi

pyinstaller --noconfirm --onedir --windowed \
    --name "CadranAgent" \
    --add-data "engine:engine" \
    --hidden-import "sqlite3" \
    --hidden-import "PySide6" \
    cadran_desktop.py

echo "=== Compilation terminée avec succès dans le dossier 'dist/CadranAgent' ==="

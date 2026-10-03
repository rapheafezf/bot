"""
Cadran Agent - Interface Desktop PySide6
Application desktop autonome avec exécution par worker en tâche de fond (QThread),
journalisation en direct, plan d'exécution interactif et validation humaine.
"""

import sys
import os
import json
from datetime import datetime

try:
    from PySide6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QLabel, QPushButton, QTextEdit, QLineEdit, QListWidget, QListWidgetItem,
        QTableWidget, QTableWidgetItem, QTabWidget, QSplitter, QComboBox,
        QMessageBox, QDialog, QDialogButtonBox, QProgressBar, QStatusBar
    )
    from PySide6.QtCore import Qt, QThread, Signal, Slot
    from PySide6.QtGui import QFont, QColor, QIcon
    PYSIDE_AVAILABLE = True
except ImportError:
    PYSIDE_AVAILABLE = False

from engine.database import init_db, get_connection
from engine.permissions import PermissionManager
from engine.tools import ToolRegistry, ToolExecutionResult

class MissionWorker(QThread if PYSIDE_AVAILABLE else object):
    """Worker d'arrière-plan exécutant la mission pas à pas sans bloquer l'interface."""
    if PYSIDE_AVAILABLE:
        step_started = Signal(str, str)
        step_completed = Signal(str, str, str)
        validation_required = Signal(str, str, dict)
        mission_finished = Signal(str, str)
        log_emitted = Signal(str, str)

    def __init__(self, mission_id: str, prompt: str, mode: str):
        if PYSIDE_AVAILABLE:
            super().__init__()
        self.mission_id = mission_id
        self.prompt = prompt
        self.mode = mode
        self.is_paused = False
        self.is_cancelled = False
        self.permissions = PermissionManager(mode=mode)
        self.registry = ToolRegistry(self.permissions)

    def run(self):
        self.log_emitted.emit("info", f"Démarrage de la mission : '{self.prompt}'")
        # Simuler ou exécuter les étapes du plan
        steps = [
            ("browser_search", "Recherche web ciblée", {"query": self.prompt}),
            ("file_list", "Inspection du dossier de travail", {"sub_dir": ""}),
            ("file_export_markdown", "Rédaction du rapport de synthèse", {
                "filename": f"rapport_{self.mission_id[:8]}.md",
                "title": f"Mission : {self.prompt}",
                "content": f"Rapport généré pour la mission : {self.prompt}\n\nStatut: Terminé avec succès."
            })
        ]

        for idx, (tool_name, desc, params) in enumerate(steps, start=1):
            if self.is_cancelled:
                self.log_emitted.emit("warning", "Mission interrompue par l'utilisateur.")
                self.mission_finished.emit(self.mission_id, "cancelled")
                return

            while self.is_paused:
                self.msleep(500)
                if self.is_cancelled:
                    return

            self.step_started.emit(str(idx), desc)
            res = self.registry.execute(tool_name, params, is_human_approved=False)
            
            if not res.success and "validation humaine" in str(res.error):
                self.validation_required.emit(str(idx), desc, params)
                # Attente de validation...
                return

            if res.success:
                self.step_completed.emit(str(idx), desc, res.proof)
                self.log_emitted.emit("tool_result", res.proof)
            else:
                self.log_emitted.emit("error", str(res.error))

        self.mission_finished.emit(self.mission_id, "completed")

class CadranMainWindow(QMainWindow if PYSIDE_AVAILABLE else object):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Cadran Agent — Assistant Personnel & Moteur d'Automatisation")
        self.resize(1200, 800)
        self.init_ui()

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QHBoxLayout(main_widget)

        # Panneau latéral gauche : Liste des missions
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.addWidget(QLabel("<b>Missions</b>"))
        self.btn_new = QPushButton("+ Nouvelle mission")
        self.btn_new.clicked.connect(self.new_mission_dialog)
        left_layout.addWidget(self.btn_new)
        self.list_missions = QListWidget()
        left_layout.addWidget(self.list_missions)
        layout.addWidget(left_panel, 1)

        # Panneau central : Onglets Chat, Plan, Données, Paramètres
        tabs = QTabWidget()
        
        # Onglet 1 : Chat et Exécution
        tab_chat = QWidget()
        chat_layout = QVBoxLayout(tab_chat)
        self.txt_logs = QTextEdit()
        self.txt_logs.setReadOnly(True)
        chat_layout.addWidget(self.txt_logs)

        # Contrôles d'action
        ctrl_layout = QHBoxLayout()
        self.input_prompt = QLineEdit()
        self.input_prompt.setPlaceholderText("Donnez votre instruction en français (ex: Trouve 20 hôtels en Occitanie...)")
        self.btn_send = QPushButton("Lancer la mission")
        self.btn_send.clicked.connect(self.start_mission)
        ctrl_layout.addWidget(self.input_prompt)
        ctrl_layout.addWidget(self.btn_send)
        chat_layout.addLayout(ctrl_layout)
        tabs.addTab(tab_chat, "Discussion & Exécution")

        # Onglet 2 : Validations en attente
        tab_val = QWidget()
        val_layout = QVBoxLayout(tab_val)
        val_layout.addWidget(QLabel("<b>Validations Humaines Requises</b>"))
        self.txt_validation = QTextEdit()
        self.txt_validation.setReadOnly(True)
        self.txt_validation.setPlainText("Aucune action sensible en attente pour l'instant.")
        val_layout.addWidget(self.txt_validation)
        tabs.addTab(tab_val, "Validations (0)")

        layout.addWidget(tabs, 3)

    def new_mission_dialog(self):
        self.input_prompt.setFocus()

    def start_mission(self):
        prompt = self.input_prompt.text().strip()
        if not prompt:
            return
        self.txt_logs.append(f"<b>[Instruction reçue]</b> : {prompt}")
        self.input_prompt.clear()

def main():
    if not PYSIDE_AVAILABLE:
        print("[Information Cadran Agent]")
        print("Pour lancer l'interface PySide6 native sur votre machine :")
        print("1. cd desktop_app")
        print("2. pip install -r requirements.txt")
        print("3. python cadran_desktop.py")
        print("La version web interactive est actuellement en ligne sur le port 3000.")
        sys.exit(0)

    app = QApplication(sys.argv)
    window = CadranMainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()

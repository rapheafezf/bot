"""
Tests unitaires de sécurité, permissions, bac à sable et intégrité de Cadran Agent.
Exécutable directement avec : python3 -m unittest desktop_app/tests/test_cadran.py
"""

import os
import sys
import tempfile
import unittest

# Assure l'import du module desktop_app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from desktop_app.engine.permissions import PermissionManager, SecurityError, RISK_CRITICAL
from desktop_app.engine.tools import ToolRegistry, ToolExecutionResult
from desktop_app.engine.database import init_db, get_connection

class TestCadranAgentSecurityAndPermissions(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.perm_assistance = PermissionManager(mode="assistance", authorized_dir=self.temp_dir)
        self.perm_observation = PermissionManager(mode="observation", authorized_dir=self.temp_dir)
        self.perm_auto = PermissionManager(mode="strict_automation", authorized_dir=self.temp_dir)
        self.registry = ToolRegistry(self.perm_assistance)

    def tearDown(self):
        # Nettoyage
        for root, dirs, files in os.walk(self.temp_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(self.temp_dir)

    def test_sandbox_path_traversal_blocked(self):
        """Vérifie qu'un chemin tentant d'échapper au dossier autorisé lève une exception de sécurité."""
        malicious_paths = [
            "../../etc/passwd",
            "/etc/shadow",
            "../secret.txt",
            "subdir/../../outside.txt"
        ]
        for p in malicious_paths:
            with self.assertRaises(SecurityError):
                self.perm_assistance.validate_file_path(p)

    def test_secrets_file_access_blocked(self):
        """Vérifie que les fichiers de secrets comme .env ou token.json sont bloqués même dans le dossier."""
        with self.assertRaises(SecurityError):
            self.perm_assistance.validate_file_path(".env")
        with self.assertRaises(SecurityError):
            self.perm_assistance.validate_file_path("credentials.json")

    def test_valid_path_allowed_in_sandbox(self):
        """Vérifie qu'un chemin relatif légitime dans le dossier autorisé est validé."""
        valid = self.perm_assistance.validate_file_path("rapports/prospects.csv")
        self.assertTrue(valid.startswith(self.temp_dir))
        self.assertTrue(valid.endswith("rapports/prospects.csv"))

    def test_mode_observation_blocks_writing(self):
        """Vérifie que le mode Observation interdit toute action d'écriture ou d'envoi."""
        reg_obs = ToolRegistry(self.perm_observation)
        result = reg_obs.execute("file_write", {"filepath": "test.txt", "content": "hello"})
        self.assertFalse(result.success)
        self.assertIn("Mode Observation actif", result.error)

    def test_mode_assistance_requires_human_approval_for_writes(self):
        """Vérifie que le mode Assistance impose une validation préalable avant écriture."""
        result = self.registry.execute("file_write", {"filepath": "test.txt", "content": "hello"}, is_human_approved=False)
        self.assertFalse(result.success)
        self.assertIn("validation humaine", result.error)

        # Avec validation humaine, l'exécution réussit
        result_approved = self.registry.execute("file_write", {"filepath": "test.txt", "content": "hello"}, is_human_approved=True)
        self.assertTrue(result_approved.success)
        self.assertIn("Fichier écrit", result_approved.proof)

    def test_email_send_never_simulates_success_when_unconfigured(self):
        """Vérifie la règle absolue : un envoi non configuré renvoie 'Non configuré' et ne simule jamais de succès."""
        result = self.registry.execute(
            "email_send",
            {"to_email": "prospect@hotel.fr", "subject": "Audit", "body": "Bonjour", "smtp_configured": False},
            is_human_approved=True
        )
        self.assertFalse(result.success)
        self.assertIn("Non configuré", result.error)
        self.assertEqual(result.proof, "")

    def test_loop_detection_prevents_infinite_tool_calls(self):
        """Vérifie que la répétition de plus de 3 appels d'outils identiques est stoppée."""
        params = {"query": "hotels occitanie"}
        # 3 premiers appels enregistrés
        self.registry.check_loop("browser_search", params)
        self.registry.check_loop("browser_search", params)
        self.registry.check_loop("browser_search", params)
        # Le 4ème déclenche l'alarme
        is_loop = self.registry.check_loop("browser_search", params)
        self.assertTrue(is_loop)

    def test_sqlite_database_persistence(self):
        """Vérifie l'initialisation et l'insertion dans la base SQLite locale."""
        test_db = os.path.join(self.temp_dir, "test_cadran.sqlite3")
        init_db(test_db)
        conn = get_connection(test_db)
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO prospects (id, company_name, city, activity, collected_at, status) VALUES (?, ?, ?, ?, ?, ?)",
            ("p_1", "Hôtel du Parc", "Toulouse", "Hôtellerie", "2026-10-03", "new")
        )
        conn.commit()

        cur.execute("SELECT * FROM prospects WHERE id = ?", ("p_1",))
        row = cur.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row["company_name"], "Hôtel du Parc")
        self.assertEqual(row["city"], "Toulouse")
        conn.close()

if __name__ == "__main__":
    unittest.main()

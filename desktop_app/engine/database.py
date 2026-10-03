"""
Cadran Agent - Base de données SQLite et persistance.
Gère les missions, étapes, journaux, validations et prospects.
"""

import os
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_FILE = os.path.join(ROOT_DIR, "cadran.sqlite3")

def get_connection(db_path: str = DB_FILE) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: str = DB_FILE):
    """Initialise le schéma de base de données SQLite."""
    conn = get_connection(db_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        user_prompt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'preparing', -- preparing, running, waiting_validation, paused, completed, failed, cancelled
        permission_mode TEXT NOT NULL DEFAULT 'assistance', -- observation, assistance, strict_automation
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        result_summary TEXT,
        steps_count INTEGER DEFAULT 0,
        error_message TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS mission_steps (
        id TEXT PRIMARY KEY,
        mission_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        description TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        parameters_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, running, waiting_approval, completed, failed, skipped
        result_json TEXT,
        proof TEXT,
        error TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS action_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id TEXT NOT NULL,
        level TEXT NOT NULL, -- info, tool_call, tool_result, security_alert, approval_request, error
        message TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS validations (
        id TEXT PRIMARY KEY,
        mission_id TEXT NOT NULL,
        step_id TEXT,
        type TEXT NOT NULL, -- email_send, file_delete, file_overwrite, external_request, system_action
        title TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
        justification TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS prospects (
        id TEXT PRIMARY KEY,
        mission_id TEXT,
        company_name TEXT NOT NULL,
        website TEXT,
        city TEXT,
        activity TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        source_url TEXT,
        collected_at TEXT NOT NULL,
        observations TEXT,
        hypotheses TEXT,
        missing_info TEXT,
        proposal_email_subject TEXT,
        proposal_email_body TEXT,
        status TEXT NOT NULL DEFAULT 'new', -- new, validated, contacted, excluded
        is_excluded INTEGER DEFAULT 0
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS sent_emails (
        id TEXT PRIMARY KEY,
        mission_id TEXT,
        validation_id TEXT,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        attachments_json TEXT,
        delivery_mode TEXT NOT NULL, -- direct_dispatcher, smtp
        status TEXT NOT NULL, -- delivered, sent_smtp, failed
        delivery_proof TEXT NOT NULL,
        sent_at TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        cron_expression TEXT,
        frequency TEXT NOT NULL, -- daily, weekly, hourly
        time_of_day TEXT,
        is_active INTEGER DEFAULT 1,
        last_run_at TEXT,
        next_run_at TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        company TEXT,
        email_verified INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active', -- active, disabled
        created_at TEXT NOT NULL,
        last_login_at TEXT,
        login_count INTEGER DEFAULT 0
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS email_verification_codes (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Base SQLite Cadran initialisée avec succès.")

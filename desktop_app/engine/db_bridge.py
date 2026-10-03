"""
Pont d'accès SQLite haute performance pour Cadran Agent.
Permet d'exécuter des requêtes avec sérialisation JSON standard.
Utilisable depuis le terminal, Python ou le serveur Node.js / Express.
"""

import sys
import os
import json
import sqlite3
from typing import Any, List, Dict

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

DB_PATH = os.path.join(ROOT_DIR, "cadran.sqlite3")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def execute_sql(sql: str, params: list = None) -> Dict[str, Any]:
    params = params or []
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, params)
        conn.commit()
        last_id = cur.lastrowid
        rowcount = cur.rowcount
        conn.close()
        return {"success": True, "lastrowid": last_id, "rowcount": rowcount}
    except Exception as e:
        conn.close()
        return {"success": False, "error": str(e)}

def query_sql(sql: str, params: list = None) -> Dict[str, Any]:
    params = params or []
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, params)
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {"success": True, "rows": rows}
    except Exception as e:
        conn.close()
        return {"success": False, "error": str(e)}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Commande manquante"}))
        return

    cmd = sys.argv[1]
    if cmd == "init":
        from desktop_app.engine.database import init_db
        init_db(DB_PATH)
        print(json.dumps({"success": True, "message": "Base initialisée"}))
    elif cmd == "query":
        input_data = json.loads(sys.stdin.read())
        res = query_sql(input_data.get("sql", ""), input_data.get("params", []))
        print(json.dumps(res))
    elif cmd == "execute":
        input_data = json.loads(sys.stdin.read())
        res = execute_sql(input_data.get("sql", ""), input_data.get("params", []))
        print(json.dumps(res))
    else:
        print(json.dumps({"error": f"Commande inconnue: {cmd}"}))

if __name__ == "__main__":
    main()

from pathlib import Path
import sqlite3
from typing import List, Dict, Any

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "data" / "roadmap.db"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with _connect() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS roadmap_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )


def list_items() -> List[Dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute(
            "SELECT id, text, created_at FROM roadmap_items ORDER BY id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def add_item(text: str) -> Dict[str, Any]:
    with _connect() as connection:
        cursor = connection.execute(
            "INSERT INTO roadmap_items (text) VALUES (?)",
            (text,),
        )
        item_id = cursor.lastrowid
        row = connection.execute(
            "SELECT id, text, created_at FROM roadmap_items WHERE id = ?",
            (item_id,),
        ).fetchone()
    return dict(row)


def delete_item(item_id: int) -> bool:
    with _connect() as connection:
        cursor = connection.execute(
            "DELETE FROM roadmap_items WHERE id = ?",
            (item_id,),
        )
        return cursor.rowcount > 0

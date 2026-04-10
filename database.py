import sqlite3

DB_NAME = "edith.db"


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def save_note_db(note):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (content) VALUES (?)", (note,))
    conn.commit()
    conn.close()


def get_notes_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM notes ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [row[0] for row in rows]


def clear_notes_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes")
    conn.commit()
    conn.close()
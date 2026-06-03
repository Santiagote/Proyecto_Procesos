import sqlite3
import json
import sys

db = 'backend/db.sqlite3'
try:
    conn = sqlite3.connect(db)
    c = conn.cursor()
    c.execute('SELECT id, name, code FROM students_career')
    rows = c.fetchall()
    print(json.dumps(rows, ensure_ascii=False))
except Exception as e:
    print('ERROR:', e, file=sys.stderr)
    sys.exit(1)
finally:
    try:
        conn.close()
    except:
        pass

from flask import Flask, request
from flask_sock import Sock
from flask_cors import CORS
import duckdb
import json
import uuid


app = Flask(__name__)
sock = Sock(app)
CORS(app)
conn = duckdb.connect("database.db")

conn.sql("CREATE TABLE IF NOT EXISTS cases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), detective VARCHAR, name VARCHAR, short_description VARCHAR DEFAULT NULL)")
conn.sql("CREATE TABLE IF NOT EXISTS parties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, name VARCHAR, role VARCHAR, description VARCHAR DEFAULT NULL, alibi VARCHAR DEFAULT NULL)")
conn.sql("CREATE TABLE IF NOT EXISTS evidences (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, status VARCHAR, place VARCHAR, description VARCHAR, name VARCHAR, suspects UUID[])")
conn.sql("CREATE TABLE IF NOT EXISTS theories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, name VARCHAR, content VARCHAR)")
conn.sql("CREATE TABLE IF NOT EXISTS timelines_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, timestamp TIMESTAMP, place VARCHAR, status VARCHAR, name VARCHAR, description VARCHAR)")


def fetch_dict(result, size=-1):
    if size == -1:
        rows = result.fetchall()
    else:
        rows = result.fetchmany(size)

    columns = [desc[0] for desc in result.description]
    data = []
    for row in rows:
        row_data = {}
        for i, value in enumerate(row):
            if type(value) == uuid.UUID:
                value = str(value)

            row_data[columns[i]] = value

        data.append(row_data)

    return data


@app.route("/api/get_cases", methods=["GET"])
def get_cases():
    result = conn.execute("SELECT id, name, short_description FROM cases;")
    data = fetch_dict(result)

    return data


@app.route("/api/parties", methods=["POST", "PUT", "DELETE", "PATCH"])
def get_parties():
    data = request.get_json()

    if request.method == "DELETE":
        party_id = data.get("id")
        if party_id is None:
            return {"error": True, "message": "Missing id"}, 400
        conn.execute("DELETE FROM parties WHERE id=?", (party_id,))
        conn.commit()
        return {"success": True}

    elif request.method == "PATCH":
        party = data['partyid']
        party['partyid']

    elif request.method == "PUT":
        caseid = data['caseid']
        name = data['name']
        role = data['role']
        description = data.get("description")
        alibi = data.get("alibi")

        conn.execute("INSERT INTO parties (case_id, name, role, description, alibi) VALUES (?, ?, ?, ?, ?) RETURNING id;", (caseid, name, role, description, alibi, ))
        conn.commit()
        return str(conn.fetchone()[0])

    elif request.method == "POST":
        caseid = data.get("caseid")
        if caseid is None:
            return {"error": True, "message": "Missing caseid"}, 400

        result = conn.execute("SELECT id, name, role, description, alibi FROM parties WHERE case_id=?", (caseid, ))
        data = fetch_dict(result)
        response_data = {}

        for row in data:
            response_data[row['id']] = {
                "name": row['name'],
                "description": row.get('description'),
                "alibi": row.get('alibi'),
                "role": row.get('role')
            }

        return response_data


@app.route("/api/evidences", methods=["POST", "PUT", "DELETE"])
def get_evidences():
    data = request.get_json()

    if request.method == "DELETE":
        evidence_id = data.get("id")
        if evidence_id is None:
            return {"error": True, "message": "Missing id"}, 400
        conn.execute("DELETE FROM evidences WHERE id=?", (evidence_id,))
        conn.commit()
        return {"success": True}

    caseid = data.get("caseid")
    if caseid is None:
        return {"error": True, "message": "Missing caseid"}, 400

    if request.method == "PUT":
        name = data['name']
        status = data.get('status', 'unknown')
        place = data.get('place')
        description = data.get('description')
        suspects = data.get('suspects', [])

        result = conn.execute("INSERT INTO evidences (case_id, name, status, place, description, suspects) VALUES (?, ?, ?, ?, ?, ?) RETURNING id", (caseid, name, status, place, description, suspects))
        conn.commit()
        return str(conn.fetchone()[0])

    elif request.method == "POST":
        result = conn.execute("SELECT id, case_id, status, place, description, name, suspects FROM evidences WHERE case_id=?", (caseid, ))
        data = fetch_dict(result)

        return data

@app.route("/api/theories", methods=["POST", "PUT", "DELETE"])
def get_theories():
    data = request.get_json()

    if request.method == "DELETE":
        theory_id = data.get("id")
        if theory_id is None:
            return {"error": True, "message": "Missing id"}, 400
        conn.execute("DELETE FROM theories WHERE id=?", (theory_id,))
        conn.commit()
        return {"success": True}

    caseid = data.get('caseid')
    if caseid is None:
        return {"error": True, "message": "Missing caseid"}, 400

    if request.method == "PUT":
        name = data['name']
        content = data.get('content', '')

        result = conn.execute("INSERT INTO theories (case_id, name, content) VALUES (?, ?, ?) RETURNING id", (caseid, name, content))
        conn.commit()
        return str(conn.fetchone()[0])

    elif request.method == "POST":
        result = conn.execute("SELECT id, name, content FROM theories WHERE case_id=?", (caseid, ))
        data = fetch_dict(result)
        response_data = {}

        for row in data:
            response_data[row['id']] = {
                "name": row['name'],
                "content": row['content']
            }
        
        return response_data


@app.route("/api/timelines", methods=["POST", "PUT", "DELETE"])
def get_timelines():
    data = request.get_json()

    if request.method == "DELETE":
        event_id = data.get("id")
        if event_id is None:
            return {"error": True, "message": "Missing id"}, 400
        conn.execute("DELETE FROM timelines_events WHERE id=?", (event_id,))
        conn.commit()
        return {"success": True}

    caseid = data.get('caseid')
    if caseid is None:
        return {"error": True, "message": "Missing caseid"}, 400

    if request.method == "PUT":
        timestamp = data['timestamp']
        place = data.get('place', 'unknown')
        status = data['status']
        name = data['name']
        description = data.get('description')

        result = conn.execute("INSERT INTO timelines_events (case_id, timestamp, place, status, name, description) VALUES (?, make_timestamp_ms(?), ?, ?, ?, ?) RETURNING id", (caseid, timestamp, place, status, name, description))
        conn.commit()
        return str(conn.fetchone()[0])

    elif request.method == "POST":
        result = conn.execute("SELECT id, epoch_ms(timestamp) AS timestamp, place, status, name, description FROM timelines_events WHERE case_id=? ORDER BY timestamp;", (caseid, ))
        data = fetch_dict(result)

        return data


@sock.route("/api/chat")
def chat(ws):
    opcount = 0
    while True:
        opcount += 1
        raw = ws.receive()
        data = json.loads(raw)

        op = data.get('op')

        if op == 'send_message':
            message = data['message']
            ws.send(json.dumps({'op': 'send_message', 'message': f'{opcount} {message}'}))

if __name__ == "__main__":
    app.run(host="0.0.0.0")

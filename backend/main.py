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

"""
"timestamp": 1767634499,
"place": "Garden",
"status": "unsure",
"name": "Tongyu cut the grass",
"description": "According to Tongyu, she cut the grass with the lawnmower
"""

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


@app.route("/api/parties", methods=["POST"])
def get_parties():
    data = request.get_json()
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


@app.route("/api/evidences", methods=["POST"])
def get_evidences():
    data = request.get_json()
    caseid = data.get("caseid")
    if caseid is None:
        return {"error": True, "message": "Missing caseid"}, 400

    result = conn.execute("SELECT id, case_id, status, place, description, name, suspects FROM evidences WHERE case_id=?", (caseid, ))
    data = fetch_dict(result)

    return data

@app.route("/api/theories", methods=["POST"])
def get_theories():
    data = request.get_json()
    caseid = data.get('caseid')
    if caseid is None:
        return {"error": True, "message": "Missing caseid"}, 400

    result = conn.execute("SELECT id, name, content FROM theories WHERE case_id=?", (caseid, ))
    data = fetch_dict(result)
    response_data = {}

    for row in data:
        response_data[row['id']] = {
            "name": row['name'],
            "content": row['content']
        }
    
    return response_data


@app.route("/api/timelines", methods=["POST"])
def get_timelines():
    data = request.get_json()
    caseid = data.get('caseid')
    if caseid is None:
        return {"error": True, "message": "Missing caseid"}, 400

    result = conn.execute("SELECT timestamp, place, status, name, description FROM timelines_events WHERE case_id=? ORDER BY timestamp;", (caseid, ))
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

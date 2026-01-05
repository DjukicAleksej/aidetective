from flask import Flask, request
from flask_sock import Sock
import json

app = Flask(__name__)
sock = Sock(app)

@app.route("/api/get_cases", methods=["GET"])
def get_cases():
    return [
        {
            "id": "15293657-fcf7-4382-b474-d0c1753b6eb8",
            "name": "Aunt Bethesda",
            "short_description": "Aunt Bethesda was murdered on the 31st December of 2025 by one of its staff member"
        }
    ]


@app.route("/api/parties", methods=["POST"])
def get_parties():
    data = request.get_json()
    if "caseid" not in data:
        return {"error": True, "message": "Missing caseid"}, 400

    return {
        "c1976a46-3558-429b-9b41-0b068ebece23": {
            "name": "Euan",
            "role": "suspect",
            "description": "Ginger",
            "alibi": "Drinking tea"
        },
        "0c2ee2f4-284e-4d2b-9458-b121825ccd44": {
            "name": "Jane",
            "role": "suspect",
            "description": "",
            "alibi": "frauding hcb by buying dubai chocolat"
        },
        "9a27a7c1-d8d5-4799-958d-5b587a3faf0a": {
            "name": "Renran",
            "role": "detective",
            "description":  "",
            "alibi": "learning french la baguette et le croissant"
        }
    }

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
            ws.send(json.dumps({'op': 'send_message', 'message': f'yeah {opcount}'}))

if __name__ == "__main__":
    app.run(host="0.0.0.0")

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
        },
        "0ae7905b-c631-4490-ad0d-9d1fd27dad3d": {
            "name": "Tongyu",
            "role": "suspect",
            "description": "Gardener",
            "alibi": "In the greenhouse"
        }
    }

@app.route("/api/evidences", methods=["POST"])
def get_evidences():
    data = request.get_json()
    if "caseid" not in data:
        return {"error": True, "message": "Missing caseid"}, 400

    return {
        "cebce509-e65e-4830-9913-1b9e41f6407d": {
            "status": "confirmed",
            "place": "Garden",
            "description": "The grass is messy which mean the gardener didn't done it",
            "name": "Uncut grass",
            "suspects": ["0ae7905b-c631-4490-ad0d-9d1fd27dad3d"]
        }
    }

@app.route("/api/theories", methods=["POST"])
def get_theories():
    data = request.get_json()
    if "caseid" not in data:
        return {"error": True, "message": "Missing caseid"}, 400

    return {
        "be648140-aea2-4682-b841-73b3afa05e2a": {
            "name": "Euan killed her for money",
            "content": "Euan killed Aunt Bethesda because he's broke and need money for teens and cosplay leprechaun"
        }
    }

@app.route("/api/timelines", methods=["POST"])
def get_timelines():
    data = request.get_json()
    if "caseid" not in data:
        return {"error": True, "message": "Missing caseid"}, 400

    return [
        {
            "timestamp": 1767634499,
            "place": "Garden",
            "status": "unsure",
            "name": "Tongyu cut the grass",
            "description": "According to Tongyu, she cut the grass with the lawnmower"
        }
    ]

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

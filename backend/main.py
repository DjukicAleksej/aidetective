# Made by humans and not crankers like for the frontend

from fastapi import FastAPI, WebSocket, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from typing import Dict
from models import *
import duckdb
import json
import uuid
import io
import threading

app = FastAPI(
    title="Casemate API",
    description="API for managing detective cases, parties, evidences, theories, and timelines",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread-local storage for DuckDB connections
_thread_local = threading.local()

def get_conn():
    """Get a thread-safe connection to DuckDB"""
    if not hasattr(_thread_local, 'conn') or _thread_local.conn is None:
        _thread_local.conn = duckdb.connect("database.db")
    return _thread_local.conn

# Initialize main connection for schema
conn = get_conn()

get_conn().sql("CREATE TABLE IF NOT EXISTS cases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), detective VARCHAR, name VARCHAR, short_description VARCHAR DEFAULT NULL)")
get_conn().sql("CREATE TABLE IF NOT EXISTS parties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, name VARCHAR, role VARCHAR, description VARCHAR DEFAULT NULL, alibi VARCHAR DEFAULT NULL, image BLOB DEFAULT NULL)")
get_conn().sql("CREATE TABLE IF NOT EXISTS evidences (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, status VARCHAR, place VARCHAR, description VARCHAR, name VARCHAR, suspects UUID[])")
get_conn().sql("CREATE TABLE IF NOT EXISTS theories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, name VARCHAR, content VARCHAR)")
get_conn().sql("CREATE TABLE IF NOT EXISTS timelines_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, timestamp TIMESTAMP, place VARCHAR, status VARCHAR, name VARCHAR, description VARCHAR)")


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

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse('favicon.ico')


@app.get("/api/cases", tags=["cases"], response_model=List[ShortCaseModel])
def get_cases() -> List[ShortCaseModel]:
    result = get_conn().execute("SELECT id, name, short_description FROM cases;")
    data = fetch_dict(result)
    return data


@app.delete("/api/cases", tags=["cases"], response_model=SuccessResponse)
def delete_case(data: CaseInputModel) -> SuccessResponse:
    case_id = data.caseid
    get_conn().execute("DELETE FROM parties WHERE case_id=?", (case_id,))
    get_conn().execute("DELETE FROM evidences WHERE case_id=?", (case_id,))
    get_conn().execute("DELETE FROM theories WHERE case_id=?", (case_id,))
    get_conn().execute("DELETE FROM timelines_events WHERE case_id=?", (case_id,))
    get_conn().execute("DELETE FROM cases WHERE id=?", (case_id,))
    get_conn().commit()
    return {"success": True}


@app.patch("/api/cases", tags=["cases"], response_model=SuccessResponse)
def patch_case(case_id: str, data: CaseUpdateModel) -> SuccessResponse:
    if case_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    keys = ['name', 'short_description', 'detective']

    for key in keys:
        if getattr(data, key) is not None:
            get_conn().execute(f"UPDATE cases SET {key}=? WHERE id=?", (getattr(data, key), case_id))

    get_conn().commit()
    return {"success": True}


@app.put("/api/cases", tags=["cases"], response_model=IDResponse)
def create_case(data: ShortCaseInputModel) -> IDResponse:
    get_conn().execute("INSERT INTO cases (name, detective, short_description) VALUES (?, NULL, ?) RETURNING id;", (data.name, data.short_description))
    get_conn().commit()
    return {"id": str(get_conn().fetchone()[0])}

@app.get("/api/parties/{id}/image", tags=["parties", "images"])
def get_party_image(id):
    get_conn().execute("SELECT image FROM parties WHERE id=?", (id, ))
    result = get_conn().fetchone()
    
    if result is None or result[0] is None:
        return FileResponse('default_pic.jpg')
    
    image_data = result[0]
    return StreamingResponse(io.BytesIO(image_data), media_type="image/jpeg")


@app.post("/api/parties/{id}/image", tags=["parties", "images"])
async def upload_party_image(id: str, file: UploadFile = File(...)):
    image_data = await file.read()
    get_conn().execute("UPDATE parties SET image=? WHERE id=?", (image_data, id))
    get_conn().commit()
    return {"success": True}

@app.post("/api/parties", tags=["parties"])
def get_parties_by_case(data: CaseInputModel) -> Dict[str, PartyModel]:
    result = get_conn().execute("SELECT id, name, role, description, alibi FROM parties WHERE case_id=?", (data.caseid, ))
    parties_data = fetch_dict(result)
    response_data = {}

    for row in parties_data:
        response_data[row['id']] = {
            "name": row['name'],
            "description": row.get('description'),
            "alibi": row.get('alibi'),
            "role": row.get('role'),
            "image": f"/api/parties/{row['id']}/image"
        }

    return response_data


@app.delete("/api/parties", tags=["parties"])
def delete_party(data: dict):
    party_id = data.get("id")
    if party_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    get_conn().execute("DELETE FROM parties WHERE id=?", (party_id,))
    get_conn().commit()
    return {"success": True}


@app.patch("/api/parties", tags=["parties"])
def patch_party(data: dict):
    party = data['partyid']
    keys = ['name', 'role', 'description', 'alibi']

    for key in keys:
        if key not in data:
            continue

        get_conn().execute(f"UPDATE parties SET {key}=? WHERE id=?", (data[key], party, ))

    get_conn().commit()
    return {"success": True}


@app.delete("/api/parties/{id}/image", tags=["parties"])
def delete_party_image(id: str):
    get_conn().execute("UPDATE parties SET image=NULL WHERE id=?", (id,))
    get_conn().commit()
    return {"success": True}


@app.put("/api/parties", tags=["parties"])
def create_party(data: dict):
    caseid = data['caseid']
    name = data['name']
    role = data['role']
    description = data.get("description")
    alibi = data.get("alibi")

    get_conn().execute("INSERT INTO parties (case_id, name, role, description, alibi) VALUES (?, ?, ?, ?, ?) RETURNING id;", (caseid, name, role, description, alibi, ))
    get_conn().commit()
    return str(get_conn().fetchone()[0])


@app.post("/api/evidences", tags=["evidences"])
def get_evidences_by_case(data: dict):
    caseid = data.get("caseid")
    if caseid is None:
        raise HTTPException(status_code=400, detail="Missing caseid")
    
    result = get_conn().execute("SELECT id, case_id, status, place, description, name, suspects FROM evidences WHERE case_id=?", (caseid, ))
    data = fetch_dict(result)
    return data


@app.delete("/api/evidences", tags=["evidences"])
def delete_evidence(data: dict):
    evidence_id = data.get("id")
    if evidence_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    get_conn().execute("DELETE FROM evidences WHERE id=?", (evidence_id,))
    get_conn().commit()
    return {"success": True}


@app.patch("/api/evidences", tags=["evidences"])
def patch_evidence(data: dict):
    evidence_id = data.get("id")
    if evidence_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    keys = ['name', 'status', 'place', 'description', 'suspects']

    for key in keys:
        if key not in data:
            continue
        get_conn().execute(f"UPDATE evidences SET {key}=? WHERE id=?", (data[key], evidence_id))

    get_conn().commit()
    return {"success": True}


@app.put("/api/evidences", tags=["evidences"])
def create_evidence(data: dict):
    caseid = data.get("caseid")
    if caseid is None:
        raise HTTPException(status_code=400, detail="Missing caseid")
    
    name = data['name']
    status = data.get('status', 'unknown')
    place = data.get('place')
    description = data.get('description')
    suspects = data.get('suspects', [])

    result = get_conn().execute("INSERT INTO evidences (case_id, name, status, place, description, suspects) VALUES (?, ?, ?, ?, ?, ?) RETURNING id", (caseid, name, status, place, description, suspects))
    get_conn().commit()
    return str(get_conn().fetchone()[0])


@app.post("/api/theories", tags=["theories"])
def get_theories_by_case(data: dict):
    caseid = data.get('caseid')
    if caseid is None:
        raise HTTPException(status_code=400, detail="Missing caseid")
    
    result = get_conn().execute("SELECT id, name, content FROM theories WHERE case_id=?", (caseid, ))
    theories_data = fetch_dict(result)
    response_data = {}

    for row in theories_data:
        response_data[row['id']] = {
            "name": row['name'],
            "content": row['content']
        }
    
    return response_data


@app.delete("/api/theories", tags=["theories"])
def delete_theory(data: dict):
    theory_id = data.get("id")
    if theory_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    get_conn().execute("DELETE FROM theories WHERE id=?", (theory_id,))
    get_conn().commit()
    return {"success": True}


@app.patch("/api/theories", tags=["theories"])
def patch_theory(data: dict):
    theory_id = data.get("id")
    if theory_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    keys = ['name', 'content']

    for key in keys:
        if key not in data:
            continue
        get_conn().execute(f"UPDATE theories SET {key}=? WHERE id=?", (data[key], theory_id))

    get_conn().commit()
    return {"success": True}


@app.put("/api/theories", tags=["theories"])
def create_theory(data: dict):
    caseid = data.get('caseid')
    if caseid is None:
        raise HTTPException(status_code=400, detail="Missing caseid")
    
    name = data['name']
    content = data.get('content', '')

    result = get_conn().execute("INSERT INTO theories (case_id, name, content) VALUES (?, ?, ?) RETURNING id", (caseid, name, content))
    get_conn().commit()
    return str(get_conn().fetchone()[0])


@app.post("/api/timelines", tags=["timelines"])
def get_timelines_by_case(data: dict):
    caseid = data.get('caseid')
    if caseid is None:
        raise HTTPException(status_code=400, detail="Missing caseid")
    
    result = get_conn().execute("SELECT id, epoch_ms(timestamp) AS timestamp, place, status, name, description FROM timelines_events WHERE case_id=? ORDER BY timestamp;", (caseid, ))
    data = fetch_dict(result)
    return data


@app.delete("/api/timelines", tags=["timelines"])
def delete_timeline_event(data: dict):
    event_id = data.get("id")
    if event_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    get_conn().execute("DELETE FROM timelines_events WHERE id=?", (event_id,))
    get_conn().commit()
    return {"success": True}


@app.patch("/api/timelines", tags=["timelines"])
def patch_timeline_event(data: dict):
    event_id = data.get("id")
    if event_id is None:
        raise HTTPException(status_code=400, detail="Missing id")
    keys = ['place', 'status', 'name', 'description']

    for key in keys:
        if key not in data:
            continue
        get_conn().execute(f"UPDATE timelines_events SET {key}=? WHERE id=?", (data[key], event_id))

    if 'timestamp' in data:
        get_conn().execute("UPDATE timelines_events SET timestamp=make_timestamp_ms(?) WHERE id=?", (data['timestamp'], event_id))

    get_conn().commit()
    return {"success": True}


@app.put("/api/timelines", tags=["timelines"])
def create_timeline_event(data: dict):
    caseid = data.get('caseid')
    if caseid is None:
        raise HTTPException(status_code=400, detail="Missing caseid")
    
    timestamp = data['timestamp']
    place = data.get('place', 'unknown')
    status = data['status']
    name = data['name']
    description = data.get('description')

    result = get_conn().execute("INSERT INTO timelines_events (case_id, timestamp, place, status, name, description) VALUES (?, make_timestamp_ms(?), ?, ?, ?, ?) RETURNING id", (caseid, timestamp, place, status, name, description))
    get_conn().commit()
    return str(get_conn().fetchone()[0])


@app.websocket("/api/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    opcount = 0
    try:
        while True:
            opcount += 1
            raw = await websocket.receive_text()
            data = json.loads(raw)

            op = data.get('op')

            if op == 'send_message':
                message = data['message']
                await websocket.send_text(json.dumps({'op': 'send_message', 'message': f'{opcount} {message}'}))
    except Exception as e:
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

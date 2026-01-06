# Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build


# Run Python backend with built frontend
FROM python:3.11-slim

WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install "fastapi[standard]"

COPY backend/main.py backend/models.py backend/populate_db.py ./
COPY backend/favicon.ico backend/default_pic.jpg ./

# Copy built frontend to backend's static directory
COPY --from=frontend-builder /frontend/dist ../dist

# Serve static files from FastAPI
EXPOSE 8000

CMD ["fastapi", "run", "main.py"]

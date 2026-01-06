FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py models.py populate_db.py ./
COPY favicon.ico default_pic.jpg ./

EXPOSE 8000

CMD ["fastapi", "run", "main.py"]

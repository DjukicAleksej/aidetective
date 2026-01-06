"""
Populate the database with a template case
"""

import duckdb

conn = duckdb.connect("database.db")

conn.sql("CREATE TABLE cases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), detective VARCHAR, name VARCHAR, short_description VARCHAR DEFAULT NULL)")
conn.sql("CREATE TABLE parties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, name VARCHAR, role VARCHAR, description VARCHAR DEFAULT NULL, alibi VARCHAR DEFAULT NULL, image BLOB DEFAULT NULL)")
conn.sql("CREATE TABLE evidences (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, status VARCHAR, place VARCHAR, description VARCHAR, name VARCHAR, suspects UUID[])")
conn.sql("CREATE TABLE theories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, name VARCHAR, content VARCHAR)")
conn.sql("CREATE TABLE timelines_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), case_id UUID, timestamp TIMESTAMP, place VARCHAR, status VARCHAR, name VARCHAR, description VARCHAR)")

res = conn.execute("INSERT INTO cases (name, short_description) VALUES (?, ?) RETURNING id",
                   ("Aunt Bethesda", "Aunt Bethesda was killed on the 31st of December 2025 by one of her closest assistant"))

case_id = res.fetchone()[0]
#print(f"Case ID: {case_id}")

class Event:
    def __init__(self, timestamp, place, status, name, description):
        self.timestamp = timestamp
        self.place = place
        self.status = status
        self.name = name
        self.description = description

    def register(self):
        conn.execute("INSERT INTO timelines_events (case_id, timestamp, place, status, name, description) VALUES (?, make_timestamp_ms(?), ?, ?, ?, ?)", 
                     (case_id, self.timestamp, self.place, self.status, self.name, self.description))

class Theories:
    def __init__(self, name, content):
        self.name = name
        self.content = content

    def register(self):
        conn.execute("INSERT INTO theories (case_id, name, content) VALUES (?, ?, ?)",
                     (case_id, self.name, self.content))

class Party:
    def __init__(self, name, role, description="", alibi="", image=None):
        self.name = name
        self.role = role
        self.description = description
        self.alibi = alibi
        self.image = image

    def register(self):
        conn.execute("INSERT INTO parties (case_id, name, role, description, alibi, image) VALUES (?, ?, ?, ?, ?, ?)",
                     (case_id, self.name, self.role, self.description, self.alibi, self.image, ));


class Evidence:
    def __init__(self, status, place, description, name, suspects):
        self.status = status
        self.place = place
        self.description = description
        self.name = name
        self.suspects = suspects

    def register(self):
        conn.execute("INSERT INTO evidences (case_id, status, place, description, name, suspects) VALUES ()",
                     (case_id, self.status, self.place, self.description, self.name, self.suspects, ))

parties = [
    Party("Renran", "detective", "", ""),
    Party("Clay", "detective", "", ""),
    Party("Reem", "detective", "", ""),
    Party("Manitej", "detective", "", ""),
    Party("Sebastian", "detective", "", ""),

    Party("Euan", "suspect", "Ginger", "Was in the wine cellar tasting wine"),
    Party("Tongyu", "suspect", "Gardener", "Was mowing the grass"),
    Party("Hrby", "suspect", "Scientist", ""),
    Party("Kasper", "suspect", "Cook", ""),
    Party("Jane", "suspect", "", "")
]

for party in parties:
    party.register()

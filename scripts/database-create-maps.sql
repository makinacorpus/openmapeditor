CREATE TABLE IF NOT EXISTS maps (
	id TEXT PRIMARY KEY NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	modified TEXT NOT NULL,
	lat REAL NOT NULL,
	lng REAL NOT NULL,
	zoom INT NOT NULL,
	layers TEXT,
	tileLayers TEXT,
	providers TEXT,
	leaflet TEXT,
	drawnFeatures TEXT,
	hide INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS layers (
	id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	description TEXT,
	uri TEXT
);

DROP TABLE IF EXISTS registros;
DROP TABLE IF EXISTS user_projects;
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- 'admin' or 'client'
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE projetos (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL, -- Owner (Admin)
  nome TEXT NOT NULL,
  valor_hora REAL NOT NULL,
  moeda TEXT NOT NULL,
  atividades TEXT NOT NULL, -- JSON array stored as text
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_projects (
  user_id INTEGER NOT NULL,
  project_id TEXT NOT NULL,
  PRIMARY KEY (user_id, project_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projetos(id) ON DELETE CASCADE
);

CREATE TABLE registros (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL, -- Who created the record (Admin)
  projeto_id TEXT NOT NULL,
  atividade TEXT NOT NULL,
  descricao TEXT,
  horas REAL NOT NULL,
  data TEXT NOT NULL,
  valor_hora_na_epoca REAL,
  moeda_na_epoca TEXT,
  projeto_nome TEXT,
  pago INTEGER DEFAULT 0, -- 0 = não pago, 1 = pago
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

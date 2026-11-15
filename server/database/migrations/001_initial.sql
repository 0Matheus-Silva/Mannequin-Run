CREATE TABLE IF NOT EXISTS players (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(48) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_active_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_players_name_activity (name, last_active_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS runs (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  player_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  mode ENUM('story','infinite') NOT NULL,
  practice BOOLEAN NOT NULL DEFAULT FALSE,
  resumed BOOLEAN NOT NULL DEFAULT FALSE,
  score BIGINT UNSIGNED NOT NULL DEFAULT 0,
  distance DOUBLE NOT NULL DEFAULT 0,
  start_distance DOUBLE NOT NULL DEFAULT 0,
  items INT UNSIGNED NOT NULL DEFAULT 0,
  sector TINYINT UNSIGNED NOT NULL DEFAULT 0,
  duration DOUBLE NOT NULL DEFAULT 0,
  result ENUM('running','checkpoint','crashed','completed','abandoned') NOT NULL DEFAULT 'running',
  revision INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  INDEX idx_runs_player_history (player_id, created_at),
  INDEX idx_runs_ranking (mode, practice, result, score),
  CHECK(distance >= 0 AND duration >= 0 AND start_distance >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS checkpoints (
  player_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  distance INT UNSIGNED NOT NULL,
  run_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  score BIGINT UNSIGNED NOT NULL,
  items INT UNSIGNED NOT NULL,
  duration DOUBLE NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY(player_id, distance),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE,
  CHECK(distance IN (600,1200,1800,2300))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progress (
  player_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  story_distance INT UNSIGNED NOT NULL DEFAULT 0,
  last_checkpoint INT UNSIGNED NOT NULL DEFAULT 0,
  unlocked_sectors TINYINT UNSIGNED NOT NULL DEFAULT 1,
  best_score BIGINT UNSIGNED NOT NULL DEFAULT 0,
  best_infinite BIGINT UNSIGNED NOT NULL DEFAULT 0,
  best_story BIGINT UNSIGNED NOT NULL DEFAULT 0,
  max_distance DOUBLE NOT NULL DEFAULT 0,
  story_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS achievements (
  player_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  code VARCHAR(40) CHARACTER SET ascii NOT NULL,
  unlocked_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY(player_id, code),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB;

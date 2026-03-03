-- Table: id 1..1000000, value = random alphanumeric string (max length 20)
CREATE TABLE IF NOT EXISTS items (
  id   BIGINT PRIMARY KEY,
  value VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS items_value_idx ON items (value);

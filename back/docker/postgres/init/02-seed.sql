-- Fill 1000000 rows: id 1..1000000
INSERT INTO items (id)
SELECT i
FROM generate_series(1, 1000000) AS i;

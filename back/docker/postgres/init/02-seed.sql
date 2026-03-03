-- Fill 1000000 rows: id 1..1000000, value = random string (letters + numbers, max length 20)
INSERT INTO items (id, value)
SELECT
  i,
  (
    SELECT string_agg(
      substr(
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        floor(random() * 62)::int + 1,
        1
      ),
      ''
    )
    FROM generate_series(1, 20)
  )
FROM generate_series(1, 1000000) AS i;

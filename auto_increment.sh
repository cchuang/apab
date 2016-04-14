#!/bin/sh
USER=$(awk -F "=" '/user/ {print $2}' cred.ini | tr -d '[[:space:]]')
PASS=$(awk -F "=" '/password/ {print $2}' cred.ini | tr -d '[[:space:]]')

mysql --user=$USER --password=$PASS apab <<ZZZZFFFFAAAA
INSERT INTO status (slideno, path, event_id, opt_type) SELECT slideno + 1 AS slideno, path, event_id, opt_type FROM status ORDER BY id DESC LIMIT 1;
SELECT * FROM status ORDER BY id DESC LIMIT 1;
ZZZZFFFFAAAA

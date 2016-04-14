#!/bin/bash
if [[ $# -lt 2 ]]; then
	echo "Usage: $0 EVENT_NAME FILE [START_PAGE] [OPT_TYPE]"
	exit
fi

EVENT_NAME=$1
FILE=$2

if [[ $# -lt 3 ]]; then
	START=1
else
	START=$3
fi

if [[ $# -lt 4 ]]; then
	OPTTYPE='GENLIKE'
else
	OPTTYPE=$4
fi

echo $EVENT_NAME
echo $FILE
echo $START
echo $OPTTYPE

USER=$(awk -F "=" '/user/ {print $2}' cred.ini | tr -d '[[:space:]]')
PASS=$(awk -F "=" '/password/ {print $2}' cred.ini | tr -d '[[:space:]]')

mysql --user=$USER --password=$PASS apab <<ZZZZFFFFAAAA
UPDATE events SET live=0;
INSERT INTO events (name, live, default_opt_type) VALUE ("$EVENT_NAME", 1, "$OPTTYPE");
INSERT INTO status (event_id, path, slideno, opt_type) SELECT id AS event_id, "$FILE" AS path, "$START" AS slideno, "$OPTTYPE" AS opt_type FROM events WHERE live=1;
ZZZZFFFFAAAA


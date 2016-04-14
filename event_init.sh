#!/bin/bash
FILE=$1
if [[ $# -lt 2 ]]; then
	START=1
else
	START=$2
fi

if [[ $# -lt 3 ]]; then
	ASSESS='assessment.php'
else
	ASSESS=$3
fi

echo $FILE
echo $START
echo $ASSESS

USER=$(awk -F "=" '/user/ {print $2}' cred.ini | tr -d '[[:space:]]')
PASS=$(awk -F "=" '/password/ {print $2}' cred.ini | tr -d '[[:space:]]')

mysql --user=$USER --password=$PASS apab <<ZZZZFFFFAAAA
INSERT INTO status (path, slideno, handle) VALUE ("$FILE", "$START", "$ASSESS")
ZZZZFFFFAAAA


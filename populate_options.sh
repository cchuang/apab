#!/bin/bash
DEFAULT_TYPE="GENLIKE"

USER=$(awk -F "=" '/user/ {print $2}' cred.ini | tr -d '[[:space:]]')
PASS=$(awk -F "=" '/password/ {print $2}' cred.ini | tr -d '[[:space:]]')

mysql --user=$USER --password=$PASS apab <<ZZZZFFFFAAAA
LOCK TABLES options WRITE;
INSERT INTO options VALUES (1,'GENLIKE','精彩'),(2,'GENLIKE','不錯'),(3,'GENLIKE','無感'),(4,'GENLIKE','困惑'),(5,'GENLIKE','無趣');
UNLOCK TABLES;
ZZZZFFFFAAAA


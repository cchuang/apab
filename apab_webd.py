#!/usr/bin/env python3.4

import asyncio
import datetime
import random
import websockets
import json
import mysql.connector
import threading
import time
import configparser

def query_current_status():
    config = configparser.ConfigParser()
    config.read('cred.ini')
    cnx = mysql.connector.connect(
            user=config['general']['user'], 
            password=config['general']['password'], 
            host='127.0.0.1', 
            database='apab')
    cursor = cnx.cursor()
    cursor.execute("SELECT status.id,slideno,path,opt_type,events.id,events.name FROM status JOIN events on status.event_id=events.id WHERE events.live=1 ORDER BY `status`.`id` DESC LIMIT 1")
    row = cursor.fetchone()
    cursor.close()
    cnx.close()
    out = {"idstatus": row[0], "slideno": row[1], "path": row[2], "opt_type": row[3], "event_id": row[4], "event_name": row[5]}
    return out

class QueryThread (threading.Thread):
    def __init__(self, threadID, name):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
    def run(self):
        print ("Starting {}".format(self.name))
        curr_id = 0
        while True: 
            global stat
            stat = query_current_status()
            if (curr_id != stat["idstatus"]):
                print("{}".format(stat))
                curr_id = stat["idstatus"]
            time.sleep(1)
        print ("Exiting {}".format(self.name))

@asyncio.coroutine
def server_core(websocket, path):
    curr_id = 0

    global stat
    while True:
        if (curr_id != stat["idstatus"]): 
            yield from websocket.send(json.dumps(stat))
            curr_id = stat["idstatus"]
        yield from asyncio.sleep(0.05)

start_server = websockets.serve(server_core, 'localhost', 5678)

stat = query_current_status()

qthread = QueryThread(1, "Query Thread")
qthread.start()

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


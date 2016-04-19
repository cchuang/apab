# Speech Quality Monitoring and Inference

## HOWTO
### Populate the MySQL database
#### Rebuild the database
```
mysql -p < mysql_db_schema.sql
```
#### Populate the default options 'GENLIKE'
```
./populate_options.sh
```
#### Create the current event with its name and the slides in pdf
e.g. 
```
./event_init.sh "computer vision" 01lego.pdf
```
### Migrate to another server
* install prerequisites
* pull this 
* create & edit cred.ini
* create & edit .htaccess and .htpasswd
* set the proxy of apache for the websocket server - apab\_webd.py
* rebuild DB
* modify path in admin.js & main.js
* put the slides (pdf) in the directory (''public\_html'')
* start apache
* start apab\_webd.py

## Interfaces
### Web (Client)
* http://skyrim2.iis.sinica.edu.tw/~cchuang/

### Web (Administrator)
* http://skyrim2.iis.sinica.edu.tw/~cchuang/admin.html
* Authentication and authorization: by Apache .htaccess 

## Source code 
* https://github.com/cchuang/apab

### Description

```
├── apab_webd.py - websocket server. bind on localhost:5678
├── auto_increment.sh - a gadget for changing slides. 
├── cred.ini - database accessing credentials (account & password)
├── event_init.sh - a gadget for adding events and slides. 
├── mysql_db_schema.sql - DB schema
├── populate_options.sh - a gadget for create default options. 
└── public_html - web pages on skyrim2
    ├── <slides in pdf format> - slides for sharing
    ├── admin.html - administration workbench
    ├── admin_util.php - backend of administration tasks
    ├── assessment.php - backend of client tasks
    ├── get_status.php - obsolete
    ├── index.html - the client page for entering seat number and disclaimer
    ├── main.html - the main client page
    ├── text_layer_builder.css - text layer for pdf slides with PDF.js
    └── js
        ├── admin.js - administration workbench (hard-coded path here)
        ├── js.cookie.js - cookie library
        ├── main.js - the main client page (hard-coded path here)
        ├── pdf.js - PDF.js
        ├── pdf.min.js - 'compiled' PDF.js
        ├── pdf.worker.js - PDF.js
        ├── pdf.worker.min.js - 'compiled' PDF.js
        ├── session.js - session management js
        ├── text_layer_builder.js - text layer for pdf slides with PDF.js
        └── ui_utils.js - PDF.js
```

## Prerequisite

### Python 
* At least Python 3.4 
#### packages
* mysql-connector-python
* websockets

### Apache2
* 2.4.7
* mod\_proxy\_wstunnel 

### MySQL

## Face detetion program (face\_dtct.py)
### Dependency
#### python 3
* dlib
* scikit-image


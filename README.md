urlshortener
============

Basic rest like url shortener 

Implemented Node.js with Express.
The app exposes a REST like interface.

The app uses redis for persistence and requires a running redis server on default port(6379) and host(127.0.0.1).
The app will to some extend respond to accept headers in the clients, so that if the client sends accept: application/json 
then the app will try to provide json instead of html. But it will always render html if the */html/ option has been set in the client.
If you want to see json results in a browser then the easiest way is to set the format param of the url to .json. 


The following are the entry points:
=====================================
GET /:id
This is the basic redirect url for the short urls

GET /shorturl.:format?
lists all short url entris in the app

GET /shorturl/new 
Presents a form for creating a new short url

GET /shorturl/:id.:format?
Enables viewing of the individual short urls configured in the system 

POST /shorturl.:format?
Create new short url

DELETE /shorturl/:id.:format?
Deletes the provided short url.


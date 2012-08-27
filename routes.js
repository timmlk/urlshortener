var sys = require('util'), gen = require('./shortUrlGenerator'), store = require('./urlstore');

function NotFound(msg) {
	  this.name = 'NotFound';
	  Error.call(this, msg);
	  Error.captureStackTrace(this, arguments.callee);
	}

function setupRoutes(app){
	
	// setup route handlers
	//
	// everything, except shorturl redirect, has been placed in /shorturl on purpose to make room for expansions and to go with a rest approach.
	// The actual redirect for short urls are host/:id
	// get for create form
	app.get('/shorturl/new', function(req, res, next) {
		console.log('get(/shorturl/new');
		res.render('shorturl/new.jade');
	});
	
	// List all short urls ... expensive operation
	app.get('/shorturl/.:format?', function(req, res) {
		console.log('get(/shorturl.:format?' + sys.inspect(req.params));
		
		store.list(function (val){
			handleRespFormat(req,res,function(){
				console.log("sending json:"+val);
				sendJson(res,val);
			}, function (){
				res.render('shorturl/view.jade',{'legendmsg': 'All reqistered short urls', 
					'shorturls':val.keys, 'longurls' : val.values});
			}); 
		});
		
	});
	
	// getter for viewing the actual record 
	app.get('/shorturl/:id.:format?',  function(req,res,next){
		console.log('get(/shorturl/:id.:format?');
		var format = req.params.format; // todo should look for accept
		var id = req.params.id;
		store.get(id, function (resp){
			var url = resp;		
			if(url){
					handleRespFormat(req,res,function(){
					sendJson(res,{'shortUrl' : id, 'url' : url});
				}, function(){
					res.render('shorturl/view.jade',{'legendmsg': 'View short url','shorturls':[id], 'longurls' : [url]});
				});
			}else{
				next(new NotFound('Unable to find a url for the given short url'));
			}
		});
		
	});

	
	// get url for normal redirect, this is the central part of the actual redirect functionality ;o)
	app.get('/:id',  function(req,res,next){
		store.get(req.params.id, function(url,err){
			if(!url){
				return next(new NotFound("Unable to find the requested url "+req.params.id));
			}
			console.log("url:"+url);
			res.redirect(url);
		});
		
	});
	
	
	// Create
	app.post('/shorturl.:format?', function(req, res) { // todo check if exists
		console.log('app.post(/shorturl.:format?');
		var shortUrl =req.body.shorturl;
		var url = req.body.url;
		if(!shortUrl){
			store.getNewId(function(val,err){
				shortUrl = gen.encode(val);
				store.save(shortUrl,url);
				handleRespFormat(req,res,function(){
					sendJson(res,{'shortUrl' : shortUrl, 'url' : url});
				}, function(){
					res.redirect('/shorturl/'+shortUrl);
				});
			});
		}else{
			store.save(shortUrl,url);
			handleRespFormat(req,res,function(){
				sendJson(res,{'shortUrl' : shortUrl, 'url' : url});
			}, function(){
				res.redirect('/shorturl/'+shortUrl);
			});
			
		}
	});
	
	// Delete
	app.del('/shorturl/:id.:format?', function(req, res, next) {
		console.log('deleting:' + req.params.id)
		// Load the url and remove if present, else 404
		store.get(req.params.id, function (val,err){
			
			if(!val){
				return next(new NotFound("Unable to delete "+req.params.id));
			}
			store.del(req.params.id);
			handleRespFormat(req,res,function(){
				res.send("",204);// sort of the correct response
			},function(){
				res.send("OK",200);// but quite annoing in the browser... so we send 200
			});
		});
		
	});
	// Update
	// no update functionality... delete and create again
	/*app.put('/shorturl/:id.:format?', function(req, res) {
		
	});*/

	function handleRespFormat(req,res,jsonfn,htmlfn){
		if(req.accepts('html') && htmlfn && req.params.format !== "json"){ // chrome annoyingly sends an accept */* so we check for html, to render in browser
			htmlfn();													   // use an explecit .json to get json result in browser	
		}else if((req.accepts("json") || req.params.format == "json") && jsonfn){
			jsonfn();
		} 
		
	}
	function sendJson(res, json){
		res.set('Content-Type', 'application/json');
		res.send(json);
	}

}
console.log("exporting routes");
exports.setupRoutes = setupRoutes;
exports.notFound = NotFound;
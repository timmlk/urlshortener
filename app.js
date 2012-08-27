
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , urlstore = require("./urlstore")
  , routes = require("./routes");

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(err, req, res, next) {
	  console.log("ERROR "+err);
	  if (err instanceof routes.notFound) {
	    res.render('404.jade', { status: 404 });
	  } else {
	    next(err);
	  }
  });

});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.errorHandler({
		dumpExceptions : true
	}));
	
});

//app.get('/', routes.index);

routes.setupRoutes(app);

exports.httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
exports.httpServer.close=function(){
	urlstore.shutdown();
}

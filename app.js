
/**
 * Module dependencies.
 */

var express = require('express')
  , routes  = require('./routes')
  , user    = require('./routes/user')
  , func    = require('./routes/functions')
  , http    = require('http')
  , path    = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 2001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('path', 'localhost:' + app.get('port'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// setup paths to views
app.get('/'         , routes.index  );
app.get('/options'  , routes.options);
app.get('/you/:mode', routes.you    );
app.get('/them'     , routes.them   );
app.get('/share'    , routes.share  );
app.get('/map/:id'  , routes.map    );

// setup paths to functions
app.post('/setyou', routes.setYou);
app.post('/setthem', routes.setThem);
app.get('/checkupdatepermission', routes.checkUpdatePermission);
app.post('/updateposition', routes.updatePosition);
app.get('/getFinders/:id', routes.getFinders);
app.post('/setshare', routes.setShare);
app.get('/getLast', routes.getLast);

// express generated functions
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

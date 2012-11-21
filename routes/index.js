var func   = require('./functions');
var util   = require('util');
var model  = require('./model');
var invite = require('./invite');
var secret = require('./secret');


/* GET check permission to update position */
exports.checkUpdatePermission = function(req, res){
  // check if a user exists in sessionCode
  if(req.session.user){
    if(req.session.user.update == 1){
      res.send('1');
    }else{
      res.send('0');
    }
  }else{
    res.send('1');
  }
  
};

/* POST current position */
exports.updatePosition = function(req, res){

  req.session.lat = req.body.lat;
  req.session.lon = req.body.lon;
  req.session.time = req.body.time;
  
  // update current user
  if(req.session.user){
    model.Finder.findOne({'_id' : req.session.user._id}, function(err,finder){
      // catch errors
      if (err) {
        console.log(err);
        return;
      }
      
      finder.lat = req.session.lat;
      finder.lon = req.session.lon;
      finder.time = req.session.time;
      finder.save();
    });
  }
  
  res.send('success');
};


/* GET position data for plotting on map */
exports.getFinders = function(req, res){
  
  // get params  
  var id = req.params.id;
  
  model.Find.findOne({'_id': id},function(err, find){
  
    // catch errors
    if (err) {
      console.log(err);
      return;
    }
    
    // setup array to hold 'finder' ids
    var ids = [];
    ids.push(find.me);
    ids.push(find.them);
    
    // setup array to hold finders objects
    var finders = [];
  
    // return array of 'finder' objects
    func.getFinders(ids, finders, function(err, finders){
      res.send(finders);
    });
  });
  
};

/* GET home page */
exports.index = function(req, res){
  res.render('index', { title: 'isGoing.to' });
};

/* GET options page */
exports.options = function(req, res){
  res.render('options', { title: 'isGoing.to' });
};

/* GET you info page */
exports.you = function(req, res){
  
  var mode = req.params.mode;
  
  res.render('you', { title: 'isGoing.to',
                      mode:   mode  });
};

/* POST you info */
exports.setYou = function(req, res){
   // update session object
   req.session.youName = req.body.name;
   req.session.youContact = req.body.contact;
   req.session.mode = req.body.mode;
   
   // redirect to them page
   res.redirect('/them');
};

/* GET them info page */
exports.them = function(req, res){

  res.render('them', { title:'isGoing.to',
                       mode:  req.session.mode});
};

/* POST them info */
exports.setThem = function(req, res){
  // update session object
  req.session.themName = req.body.name;
  req.session.themContact = req.body.contact;
  req.session.message = req.body.message;
  req.session.self = req.body.self;
  
  console.log(req.session.self);
  
  // setup Find, Finder objects and send invites 
  invite.setupFind(req, function(err, id){
  
    // catch errors
    if (err) {
      console.log(err);
      return;
    }
    
    // redirect to map page
    res.redirect('/map/' + id);
  });
  
};

/* GET map page */
exports.map = function(req, res){

  // check if a user exists in session; if not, redirect to home page
  if(!req.session.user){
    res.redirect('/');
  }
  
  // get requested find
  model.Find.findOne({'_id': req.params.id}, function(err, find) {
    
    // catch errors
    if (err) {
      console.log(err);
      return;
    }
    
    // get me object
    model.Finder.findOne({'_id': find.me}, function(err, me){
    
      // catch errors
      if (err) {
        console.log(err);
        return;
      }
      
      // get them object
      model.Finder.findOne({'_id': find.them}, function(err, them){
        
        // catch errors
        if (err) {
          console.log(err);
          return;
        }
        
        var meName = "";
        if (me.name){
          meName = me.name;
        }else{
          meName = me.contact;
        }
        
        var themName = "";
        if (them.name){
          themName = them.name;
        }else{
          themName = them.contact;
        }
        
        
        // render map view
        res.render('map', { title:'isGoing.to'
                            , find : find
                            , me   : me
                            , them : them
                            , meName : meName
                            , themName : themName
                            , sessionCode : req.session.user.code
                            , mode : find.mode
                            , apikey : secret.google_api_key
        });
      });
    });
  });
};

/* process inbound links to shared maps */
exports.share = function(req, res){
  
  // get params
  var id = req.param('id');
  var code = req.param('code');
  
  // get requested find object
  model.Find.findOne({'_id': id}, function(err, find){
    // catch errors
    if (err) {
      console.log(err);
      return;
    }
    
    // check if code is valid for this 'find'
    if(code == find.meCode || code == find.themCode){
      
      // get user
      var userid;
      if(code == find.meCode){
        userid = find.me;
      }else{
        userid = find.them;
      }
      
      model.Finder.findOne({'_id': userid}, function(err,user){
        
        // catch errors
        if (err) {
          console.log(err);
          return;
        }
    
        // set session values, reroute to map view
        req.session.user = user;
        req.session.findId = id;
        req.session.code = code;
        res.redirect('/map/' + id);
      });
    }else{
      // code not valid --> reroute to home
      res.redirect('/');
    }
  });
};

/* POST share info */
exports.setShare = function(req,res){
  
  // get params
  var id = req.body.id;
  var code = req.body.code;
  var share = req.body.share;
  
  // find Finder object
  model.Finder.findOne({'code': code}, {'find':id}, function(err,finder){
    // catch errors
    if (err) {
      console.log(err);
      return;
    }
    
    // update finder
    finder.update = share;
    finder.save(function(err,finder){
      // update user in session
      req.session.user = finder;
      res.send("success");
    }); 
       
  });  
};


exports.getLast = function(req,res){

  // check session for existing find
  if(req.session.findId && req.session.user.code){
    res.redirect('/map/' + req.session.findId);
  }else{
    res.send('Sorry, we can\'t find your last map. Try using the link provided by email/text or <a href="/options">create a new one instead</a>.');
  }
  
};
  
  






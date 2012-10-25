var func = require('./functions');
var util = require('util');
var model = require('./model');
var nodemailer = require('nodemailer');

// MAIL Configuration ------------------------------------------------------

// see http://www.nodemailer.org/ and https://github.com/Marak/node_mailer/blob/master/Readme.md for more details
nodemailer.SMTP = {
	    host: '', // required
	    use_authentication: true, // optional, false by default
	    user: '', // used only when use_authentication is true 
	    pass: ''  // used only when use_authentication is true
}

exports.setupFind = function(req, next){
  
  // create find object
  var find = new model.Find();
  find.meName = req.session.youName;
  find.meContact = req.session.youContact;
  find.mode = req.session.mode;
  find.created = new Date().getTime();
  find.modified = find.created;
  find.themName = req.session.themName;
  find.themContact = req.session.themContact;
  find.message = req.session.message;
  
  // save find
  find.save(function(err, find){
  
    // catch errors
    if (err) {
      console.log(err);
      return;
    }
    
    // create finder object me
    var me = new model.Finder();
    me.name = req.session.youName;
    me.contact = req.session.youContact;
    me.find = find._id;
    me.lat  = req.session.lat;
    me.lon  = req.session.lon;
    me.time = req.session.time;
    me.update = 1;
    me.me = 1;
    func.getRandom(6, function(err, code){
    
      // catch errors
      if (err) {
        console.log(err);
        return;
      }

      me.code = code;
      
      // save me
      me.save(function(err,me){
        
        // catch errors
        if (err) {
          console.log(err);
          return;
        }
      
        // create finder object them
        var them = new model.Finder();
        them.name = req.session.themName;
        them.contact = req.session.themContact;
        them.update = 0;
        them.me = 0;
        func.getRandom(6, function(err, code){
          
          // catch errors
          if (err) {
            console.log(err);
            return;
          }
          
          them.code = code;
          
          // save them
          them.save(function(err,them){
            
            // catch errors
            if (err) {
              console.log(err);
              return;
            }
            
            // update find object with finder
            find.me = me._id;
            find.them = them._id;
            find.meCode = me.code;
            find.themCode = them.code;
            find.save(function(err,find){
              
              // catch errors
              if (err) {
                console.log(err);
                return;
              }
              
              // set current user
              req.session.user = me;
              
              console.log(util.inspect(me));
      
              // send invites
              emailInvite(find, me, them, req.session.self);
              
              // call callback
              next(null, find._id);
              
            });
          });
        });
      });
    });
  }); 
}  

function emailInvite(find, me, them, self){
  
  var themSubject = "";
  var themBody = "";
  
  if (me.name){
    themSubject = me.name + ' (' + me.contact + ') wants to share his/her location with you';
    themBody = 'Hi there!\r\n\r\n' + me.name + ' (' + me.contact + ')';
  }else{
    themSubject = me.contact + ' wants to share his/her location with you';
    themBody = 'Hi there!\r\n\r\n' + me.contact;
  }
  themBody = themBody + ' shared his/her current location with you:\r\n\r\n\"' + find.message + '\"\r\n\r\n';
  themBody = themBody + 'Click below to view on a map: \r\n\r\nhttp://localhost:3000/share?id=' + find._id + '&code=' + them.code + '\r\n\r\n';
  themBody = themBody + 'Thanks,\r\n\r\nIsGoing.to Team\r\n\r\n-------------------------\r\n\r\n';
  themBody = themBody + 'Meeting up with someone? IsGoing.to makes it easy! Learn more here: www.isgoing.to/about.\r\n\r\n© 2012 Sidelime LLC | www.sidelime.com';
  
  nodemailer.send_mail(
    // e-mail options
    {
        sender: 'IsGoing.to <noreply@isgoing.to>',
        to: them.contact,
        subject: themSubject,
        body: themBody
    },
    // callback function
    function(error, success){
        console.log('Message (them) ' + success ? 'sent' : 'failed');
    }
  );
    
  if(self){
    var meBody = "";
    var meSubject = "";
    
    if (them.name){
      meSubject = 'You shared your location with ' + them.name + ' (' + them.contact +  ')';
      meBody = meBody + 'Hi there!\r\n\r\nYou shared your location with ' + them.name +' (' + them.contact + ').\r\n\r\n';
    }else{
      meSubject = 'You shared your location with ' + them.contact;
      meBody = meBody + 'Hi there!\r\n\r\nYou shared your location with ' + them.contact + '.\r\n\r\n';
    }
    meBody = meBody + 'Click below to view: \r\n\r\nhttp://localhost:3000/share?id=' + find._id + '&code=' + me.code + '\r\n\r\n';
    meBody = meBody + 'Thanks,\r\n\r\nIsGoing.to Team\r\n\r\n-------------------------\r\n\r\n';
    meBody = meBody + 'Meeting up with someone? IsGoing.to makes it easy! Learn more here: www.isgoing.to/about.\r\n\r\n© 2012 Sidelime LLC | www.sidelime.com';
    
    nodemailer.send_mail(
      // e-mail options
      {
          sender: 'IsGoing.to <noreply@isgoing.to>',
          to: me.contact,
          subject: meSubject,
          body: meBody
          	  
      },
      // callback function
      function(error, success){
          console.log('Message (me) ' + success ? 'sent' : 'failed');
      }
    );
  }
}

function textInvite(find){
  //TODO
};


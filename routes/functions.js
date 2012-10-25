var model = require('./model');
var util = require('util');


// generate random alpha-numeric code
exports.getRandom = function(length, next){
  
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	var code = "";
	
	if (length < 0){
	  return next("Error: cannot issue random code of negative length", null);
	}
	
	for(x=0;x<length;x++){
		i = Math.floor(Math.random() * 62);
		code += chars.charAt(i);
	}
	
	return next(null, code);
	
}


// recursive function to return position/time data for all requested 'finders'
exports.getFinders = function(ids, finders, next){
  
  if(ids.length > 0){
    model.Finder.findOne({ '_id' : ids.pop() }, function(err, finder){
      
      // catch errors
      if (err) {
        console.log(err);
        return next(err, null);
      }
      
      // clear position data if finder has turned off updating
      if(finder.update != 1){
        finder.lat = null;
        finder.lon = null;
        finder.time = null;
      }    
        
      finders.push(finder);
      
      exports.getFinders(ids, finders, next);
      
    });
    
  }else{
    return next(null, finders);
  }
  
}

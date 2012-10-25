// get current user's position and refresh every 60 seconds
$(document).ready(function() {	
	
	updatePosition();
	setInterval("updatePosition()", 60000);
	
});

// use browser geolocation to get user lat, lon
function updatePosition() {

  // check if current user has allowed geolocation
  $.get('/checkupdatepermission', function(update){
  
    // continue if update approved
    if(update == 1){
      
      // check if browser supports geolocation:
	    if(navigator.geolocation) {
		
	      // get current position
	      navigator.geolocation.getCurrentPosition(function(position){
	        // ajax post to database
	        $.post('/updateposition', {lat: position.coords.latitude, lon: position.coords.longitude, time: new Date().getTime()}, function(data) {
	          //alert('position updated');
	        });
        });
        
	    }
    }
    
  });  
}

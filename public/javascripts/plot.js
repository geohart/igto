function updateMarkers(id, viewer){

  // get 'finders' to plot on map
  $.get('/getFinders/' + id, function(finders){
  
    // clear existing markers from map
    $('#map_canvas').gmap('clear', 'markers');
    
    // plot each on map and attach information window
    $.each(finders, function(i, finder){
    
      // check if finder is in update mode
      if(finder.update == 1 && finder.lat != null && finder.lon != null){
        var contact;
        if(finder.name != ''){
          contact = finder.name + '<br/>' + finder.contact + '';
        }else{
          contact = finder.contact;
        }
        
        var icon;
        if(finder.me == 1){
          icon = '../images/markers/marker1_32.png';
        }else{
          icon = '../images/markers/marker2_32.png';
        }

        $('#map_canvas').gmap('addMarker', { 
				  'position': new google.maps.LatLng(finder.lat, finder.lon), 
				  'bounds': true,
				  'icon': icon
			  }).click(function() {
				  $('#map_canvas').gmap('openInfoWindow', { 'content': contact + '<br/><span style="color:#aaa;font-style:italic;">Updated ' + prettyDate(finder.time) + '<span>' }, this);
			  });
			}
			
			// update interface below map
			if(finder.code != viewer){
			  if(finder.update == 1){
			    $('#' + finder.code + '_sharing').show();
			    $('#' + finder.code + '_stopped').hide();
			  }else{
			    $('#' + finder.code + '_sharing').hide();
			    $('#' + finder.code + '_stopped').show();
			  }
			}
			
    });
  });
}

function prettyDate(time){
	
	var diff = (new Date().getTime() - time) / 1000; // deal in seconds, not milliseconds
	var day_diff = Math.floor(diff / 86400); // calculate current difference in days
	
	if (isNaN(day_diff || day_diff < 0 )){
		return;
	}else if(day_diff >= 365){
		// return in years
		return "over 1 year ago"
	}else if(day_diff >= 31 && day_diff < 365){
		// return in months
		var months = Math.floor(day_diff / 31);
		
		if(months > 1){
			return months + " months ago";
		}else{
			return "1 month ago";
		}
		
	}else{
		// return in days, weeks, hours, and mins
		return day_diff == 0 && (
				diff < 60 && Math.floor(diff) + " seconds ago" ||
				diff < 120 && "1 minute ago" ||
				diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
				diff < 7200 && "1 hour ago" ||
				diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
			day_diff == 1 && "Yesterday" ||
			day_diff < 7 && day_diff + " days ago" ||
			day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
	}
}

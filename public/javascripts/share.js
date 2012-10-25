// use browser geolocation to get user lat, lon
function stopSharing() {

  // ajax post to database
  $.post('/setShare', {id: #{find._id}, code: #{sessionCode}, share: 0}, function(data) {
    //alert('position updated');
  });
}

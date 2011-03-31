var map = {}; events = []; markers = []; infowindows = [];
var currentWindowNumber = null;
var zip, days, radius;
var requestUrl = "http://api.meetup.com/2/open_events.json?key=622c792d131d6f4b345705e3e566242&callback=parseResponse";
window.onresize = function() {resize()};
window.onload=function(){
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { map[key] = value;});
	requestUrl+= "&zip="+map['zip'];
	if(map['days']!="")
		requestUrl+= "&time=0d,"+map['days']+"d";
	if(map['radius']!="")
		requestUrl+= "&radius="+map['radius'];
	if(map['zip']!=null)
		insertScript();
}
function insertScript(){
	var elem = document.createElement("script");
	//elem.src = "http://api.meetup.com/2/open_events.json?zip="+zip+"&radius="+radius+"&time=0d,"+days+"d&key=622c792d131d6f4b345705e3e566242&callback=parseResponse";
	elem.src = requestUrl;
	document.body.appendChild(elem);
}
//creates an array of all of the events
function parseResponse(json){
	document.getElementById('responseArea').innerHTML = "<h2>Working...</h2>";
	for (var i=0; i<json.results.length-1;i++)
	{
	 	eventObject=new Object();
	 	jsonEvent = json.results[i];
	 	eventObject.event_url = jsonEvent.event_url;
	 	eventObject.groupName = jsonEvent.group.name;
	 	try{
			eventObject.venueName = jsonEvent.venue.name;
	 		eventObject.latitude = jsonEvent.venue.lat;
	 		eventObject.longitude = jsonEvent.venue.lon;
	 		eventObject.eventName = jsonEvent.name;
	 		events.push(eventObject);
	 	}catch(err){}
	}
	if(events.length<1)
		alert("There aren't any events in this area to map!");
	else
		initialize();
}
//builds the map
function initialize() {
	var myLatlng = new google.maps.LatLng(40.441667,-80);
	var myOptions = {zoom: 8,center: myLatlng,mapTypeId: google.maps.MapTypeId.ROADMAP}
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	resize();
	//creates the markers and places them on the map
  	for (var i = 0; i < events.length; i++) {
    	var location = new google.maps.LatLng(events[i].latitude,events[i].longitude);
    	var marker = new google.maps.Marker({
        	position: location, 
        	map: map,
    	});
		markers[i] = marker;
       	attachWindow(marker, i);
  	}
	//centers the map based on the markers
	var bounds = new google.maps.LatLngBounds();
	for(var i=0; i<markers.length; i++){
		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);
}
//Attaches an infowindow to each marker on the map
function attachWindow(marker,i) {
	infowindows[i] = new google.maps.InfoWindow({content:
		'Event: <a href='+events[i].event_url+'>'+events[i].eventName+'</a><br/>'+
		'Group: '+events[i].groupName+'<br/>'+
		'Location: '+events[i].venueName+'<br/>'
	});
	google.maps.event.addListener(marker, 'click', function() {
		if(currentWindowNumber!=null)
			infowindows[currentWindowNumber].close();
		currentWindowNumber = i;
		infowindows[i].open(map,marker);
	});
}
function resize() {
	document.getElementById("map_canvas").style.height = (document.body.clientHeight-107) + "px";
}
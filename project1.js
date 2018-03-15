// need to enable Allow-control allow origin* google chrome plugin
// https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Houston&key=AIzaSyDU-fy2Dvxy-7WUjmYF8PovXrwjz5qeFzs
function update_location() {
    (function() {
        //var activity = document.getElementById("activity").value;
        var activity = "Park"; // temporary placeholder
        var location = document.getElementById("location").value;
        var apiKey = "&key=AIzaSyDU-fy2Dvxy-7WUjmYF8PovXrwjz5qeFzs"; 
        var latitude = [];
        var longitude = [];
        var activityLength = 10;
        
        var fullUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + activity + "+in+" + location + apiKey;
    
        $.get(fullUrl).done(function(response) {
            console.log(response);
            updateUISuccess(response);
        }).fail(function(error) {
            console.log(error);
            updateUIError();	
        });
        
        // handle success
        function updateUISuccess(response) {
            $("#event1").text("");
            
            for (var i = 0; i < activityLength; i++) {
            
                var address = response.results[i].formatted_address;
                var name = response.results[i].name;
                var rating = response.results[i].rating;
                var mapIcon = {url: response.results[i].icon,
                    scaledSize: new google.maps.Size(40, 40), // scaled size
                    origin: new google.maps.Point(0,0), // origin
                    anchor: new google.maps.Point(0, 0) // anchor
                        };
                try {
                    var priceLevel = response.results[i].price_level;
                    var priceLevelDescription = ["Free", "Inexpensive", "Moderate", "Expensive", "Very Expensive"];
                    priceLevel = priceLevelDescription[Number(priceLevel)];
                    if (priceLevel == undefined) {
                        priceLevel = "N/A";
                    }
                }
                catch(err) {
                    var priceLevel = "N/A";
                }


                var type1 = response.results[i].types[0];
                var typeAll = type1;
                try {
                    var type2 = response.results[i].types[1];
                    typeAll = typeAll + ", " + type2;
                }
                catch(err) {
                    var type2 = "";
                }
                try {

                    var type3 = response.results[i].types[2];
                    typeAll = typeAll + ", " + type3;
                }
                catch(err) {
                    var type3 = "";
                }  


                // to add photo of location
                var photoReference = response.results[i].photos["0"].photo_reference;
                var photoReferenceLink = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=" + photoReference + apiKey;

                $("#event1").append("<br><br><b>" + (Number(i) + 1) + ". " + name + "<br><img src=" + photoReferenceLink + ">" + "</b><br>" + address + "<br> <b>Rating</b>: " + rating + "<b> Price Level</b>: " + priceLevel + "<br>" + typeAll);
                
                latitude[i] = response.results[i].geometry.location.lat;
                longitude[i] = response.results[i].geometry.location.lng;
            
                }
        
            initMap(latitude, longitude, activityLength, name, mapIcon);
                
        }

        // handle error
        function updateUIError() {
            alert("Error");
        }

        update_weather();
        
    })();

}

function initMap(latitude, longitude, activityLength, name, mapIcon) {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: {lat: latitude[0], lng: longitude[0]}
        });
        
        var locations = [];
        for (var i = 0; i < activityLength; i++) {
            locations.push({lat: latitude[i], lng: longitude[0]})
        
        }
        // Create an array of alphabetical characters used to label the markers.
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        var contentString = name;
    
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

    
        var markers = locations.map(function(location, i) {
          return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length],
            icon: mapIcon
          });
        });

        // Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        }

function update_weather() {
    (function() {
        var url = "http://api.apixu.com/v1/forecast.json?key=";
        var apiKey = "072572d88ff3433a9e1203832180903"; 
        
        var location = document.getElementById("location").value;
        
        var url2 = "&q=" + location;
        $.get(url + apiKey + url2).done(function(response) {
            console.log(response);
            updateUISuccess(response);
        }).fail(function(error) {
            console.log(error);
            updateUIError();	
        });

        // handle success
        function updateUISuccess(response) {
            var condition = response.current.condition.text;
            degC = response.current.temp_c;
            degF = response.current.temp_f;
            feelsLikeC = response.current.feelslike_c;
            feelsLikeF = response.current.feelslike_f;
            minTempC = Math.round(response.forecast.forecastday[0].day.mintemp_c);
            minTempF = Math.round(response.forecast.forecastday[0].day.mintemp_f);
            maxTempC = Math.round(response.forecast.forecastday[0].day.maxtemp_c);
            maxTempF = Math.round(response.forecast.forecastday[0].day.maxtemp_f);
            sunrise = response.forecast.forecastday[0].astro.sunrise;
            sunset = response.forecast.forecastday[0].astro.sunset;
            var currentLocation = response.location.name + ", " + response.location.region;
            var currentCountry = response.location.country;
            localTime = response.location.localtime;
            // checks whether to use day or night icons
            var isDay = response.current.is_day;
            if (isDay === 1) {
                isDay = "day";
            }
            else {
                isDay = "night";
            }
            
            $("#condition").html(condition);
            $("#current-location").html(currentLocation);
            $("#current-country").html(currentCountry);
            $("#local-time").html("Local Time: " + localTime);
            $("#current-temp").html(degF + "&#176;F");
            $("#max-min-description").html("High / Low");
            $("#max-min-temp").html(maxTempF + " / " + minTempF + "&#176F");
            $("#weather-icon").attr("src", "images/weather_icons/" + isDay +"/" + condition + ".png");
            $("#sunrise").html("<b>Sunrise: </b>" + sunrise);
            $("#sunset").html("<b>Sunset: </b>" + sunset);
            
        }

        // handle error
        function updateUIError() {
            console.log("Error");
        }

    })();

}
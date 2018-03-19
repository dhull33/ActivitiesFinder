// need to enable Allow-control allow origin* google chrome plugin
// https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Houston&key=AIzaSyDU-fy2Dvxy-7WUjmYF8PovXrwjz5qeFzs

function update_location(activity) {
    (function() {
        var location = document.getElementById("location").value;
        location = location.substr(0, location.lastIndexOf(","));   // Removes country from location
        var apiKey = "&key=AIzaSyDU-fy2Dvxy-7WUjmYF8PovXrwjz5qeFzs"; 
        var latitude = [];
        var longitude = [];
        var activityLength = 20;
        
        var fullUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + activity + "+in+" + location + "&radius=45000" + apiKey;
    
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
            var mapIcon = [];
            var locationNumb = [];
            var name1 = []
            
            var resultsLength = response.results.length;
            if (resultsLength < activityLength) {
                activityLength = resultsLength;
            }
            
            for (var i = 0; i < activityLength; i++) {
                locationNumb[i] = String(i + 1);
                //var address = response.results[i].formatted_address;
                //var name = response.results[i].name;
                name1[i] = response.results[i].name;
                //var rating = response.results[i].rating;
                mapIcon[i] = {url: response.results[i].icon,
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

                /*
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
                try {
                    var photoReference = response.results[i].photos["0"].photo_reference;
                    var photoReferenceLink = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=" + photoReference + apiKey;
                }
                catch(err) {
                    // insert a default photo here
                } 
                 */

                 // Add Event Details
                var placeId = response.results[i].place_id;

                var detailUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + apiKey;
                
                $.get(detailUrl).done(function (details) {
                    console.log(details);

                    //Contact information
                    var Name = details.result.name;
                    var webSite = details.result.website;
                    var address = details.result.adr_address;
                    var phoneNum = details.result.formatted_phone_number;
                    var googleLink = details.result.url;

                    //Photo Reference Link
                    var photoReference = details.result.photos['0'].photo_reference;
                    var photoReferenceLink = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=" + photoReference + apiKey;



                    //Misc. Details
                    var typeAll = details.result.types;
                    var openHours = details.result.opening_hours.weekday_text;
                    var monday = openHours[0];
                    var tuesday = openHours[1];
                    var wednesday = openHours[2];
                    var thursday = openHours[3];
                    var friday = openHours[4];
                    var saturday = openHours[5];
                    var sunday = openHours[6];


                    var rating = details.result.rating;

                    /*var priceLevel = response.results[i].price_level;
                    var priceLevelDescription = ["0", "$", "$$", "$$$", "$$$$"];
                    priceLevel = priceLevelDescription[Number(priceLevel)];
                    if (priceLevel == undefined) {
                        priceLevel = "No Info";
                    } */

                    
                    //Append info to div with id=event1
                    $('#event1').append('<div id="event2" class=card>' + '<img class="resize card-img-top float-right" src=' + photoReferenceLink + '>' + '<div class="card-body">' + '<h5 class="card-title">' + Name + '</h5>' + '<p class="card-text"><b>Rating: </b> ' + rating + '<br>' + '<b>Price: </b> ' + priceLevel + '<br>' + '<b>Address: </b>' + address + '<br>' + '<b>Phone: </b>'+ phoneNum + '<br>' + '<a href="' + webSite + '" class="card-link">' + Name + "'s Site  </a>" + '<br>' + '</p>' + '<p class="card-text"><b> Hours: </b>' +'<br>' + monday +'<br>' + tuesday +'<br>' + wednesday +'<br>' + thursday +'<br>' + friday +'<br>' + saturday +'<br>' + sunday + '<br><br>' + '</p>' + '<div class="card-footer"><a class="card-link" href="' + googleLink + '"><small class="text-muted">Find Us on Google</small></a><hr><small class="text-muted">Categories: ' + typeAll + '</small></div>' + '</div>' + '</div>');

                });
                
                latitude[i] = response.results[i].geometry.location.lat;
                longitude[i] = response.results[i].geometry.location.lng;
            
                }
        
            initMap(latitude, longitude, activityLength, name1, mapIcon, locationNumb, location);
                
        }

        // handle error
        function updateUIError() {
            alert("Error");
        }
        
    })();

}

function initMap(latitude, longitude, activityLength, name1, mapIcon, locationNumb, location) {
    
    
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: latitude[0], lng: longitude[0]}
    });
    
    // centers map on the city instead of one of the places
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': location}, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
    } else {
      console.log('Geocode was not successful for the following reason: ' + status);
    }
    });

    var locations = [];
    for (var i = 0; i < activityLength; i++) {
        locations.push({lat: latitude[i], lng: longitude[i]})

    }

    var markers = locations.map(function(location, i) {
      return new google.maps.Marker({
        position: location,
        label: {
            text: locationNumb[i] + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
            color: "red",
            fontSize: "24px",
            fontWeight: "bold"
        },
        //label: labels[i % labels.length],
        icon: mapIcon[i]
      });
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }
    

function autoComplete() {
    // Auto complete input box for locations
    var input = document.getElementById('location');
    var options = {
        // Limits search results to city
        types: ["(cities)"]
    };
    var autocomplete = new google.maps.places.Autocomplete(input, options);    

}
    
//google.maps.event.addDomListener(window, 'load', autoComplete);

function update_weather() {
    (function() {
        var url = "http://api.apixu.com/v1/forecast.json?key=";
        var apiKey = "072572d88ff3433a9e1203832180903"; 
        
        var location = document.getElementById("location").value;
        location = location.substr(0, location.lastIndexOf(","));   // Removes country from location
        
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
        update_location(activity);
    })();

}

function checkboxFilter() {
    activity = "type="
    
    if ($("#check_box1").is(":checked")) {
        activity += $("#check_box1").val();
    }
    if ($("#check_box2").is(":checked")) {
        activity += $("#check_box2").val();
    }
    if ($("#check_box3").is(":checked")) {
        activity += $("#check_box3").val();
    }
    if ($("#check_box4").is(":checked")) {
        activity += $("#check_box4").val();
    }
    if ($("#check_box5").is(":checked")) {
        activity += $("#check_box5").val();
    }
    if ($("#check_box6").is(":checked")) {
        activity += $("#check_box6").val();
    }
    if ($("#check_box7").is(":checked")) {
        activity += $("#check_box7").val();
    }
    if ($("#check_box8").is(":checked")) {
        activity += $("#check_box8").val();
    }
    if ($("#check_box9").is(":checked")) {
        activity += $("#check_box9").val();
    }
    
    if (activity === "type=") {
        activity = "Landmark OR Restaurant OR Park";
    }
    console.log(activity);
    update_weather()
    
}


// Below is JavaScript Code for Slideshow
var slideIndex = 0;
carousel();

function carousel() {
    var i;
    var x = document.getElementsByClassName("mySlides");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none"; 
    }
    slideIndex++;
    if (slideIndex > x.length) {slideIndex = 1} 
    x[slideIndex-1].style.display = "block"; 
    setTimeout(carousel, 4000); // Change image every 2 seconds
}

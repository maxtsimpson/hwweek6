// had a look at trying to do this as a class instead but doesn't really warrant it because
//there's no real calculations associated with it and want the render functions seperate
let cityWeatherRepo = {};
let currentCity = "";
const APIKEY = "db7659b069972354627d855668ebaf95";
const GEOAPIFYKEY = "d167547b4c204380b2554416dc375bc8";
const LOCATIONIQKEY = "d8f0580573990c";
const OPENUVKEY = "aaa5274f748d804b446f494b32315010"; //limit of 50 reqs/day

let getCurrentTime = function () {
    return moment().clone();
}

let postDisplayDate = function () {  
    var dateString = getCurrentTime().format('dddd, MMMM Do');
    $("#currentDay").text(dateString);
}

let retrieveRecentSearches = function () {
    //get the cityWeatherRepo from local storage. if there isnt one then create a blank object
    var cityWeatherRepo = JSON.parse(localStorage.getItem("cityWeatherRepo"));
    if (cityWeatherRepo === null) {
        cityWeatherRepo = {};
    }
    return cityWeatherRepo;
}

let retrieveRecentSearch = function (cityName) {
    //could return a particular search for a city or null
    var cityWeatherRepo = retrieveRecentSearches()
    return cityWeatherRepo[cityName];
}


let storeRecentSearch = function (cityWeatherObject){
    var cityWeatherRepo = retrieveRecentSearches()
    
    //we are only going to store one weather report for one city at a time
    //no historical data or duplicates

    cityWeatherRepo[cityWeatherObject.Name.toLowerCase()] = cityWeatherObject;
    localStorage.setItem("cityWeatherRepo",JSON.stringify(cityWeatherRepo));
}

let mapAPIWeatherToLocalWeather = function (cityWeatherDTO) {
    //this is seperated so that if the API change the format of their object we should just edit here

    
}

let searchCityWeatherByAPI = async function(cityName){
    
    //construct a request and search the api. then return the api weather object
    var queryURL = 
    "https://api.openweathermap.org/data/2.5/forecast?q=" + 
    cityName + 
    "&units=metric" +
    "&appid=" + APIKEY

    // api.openweathermap.org/data/2.5/forecast/daily?q={city name}&cnt={cnt}&appid={your api key}
    //the only issue is the daily forecast needs a paid subscription, so we get a 3 hourly

    $.ajax({
    url: queryURL,
    method: "GET"
    })
    .then(renderWeatherFromAjax,null);
    //then just wants the name of the call back functions for args, not an actual call itself - no ()
}

let searchCityByAPI = async function(cityName){
    //couldnt get geoapify to work
    // var queryURL = "https://geoapify-platform.p.rapidapi.com/v1/geocode/search" +
    // "?text=" + cityName +
    // "&type=city&apiKey=" + GEOAPIFYKEY

    //using location IQ. limit of 2 searches per second should be ok
    var queryURL = "https://us1.locationiq.com/v1/search.php" +
    "?key=" + LOCATIONIQKEY +
    "&q=" + cityName +
    "&format=json&limit=1"

    $.ajax({
        url: queryURL,
        method: "GET"
        })
        .then(getCityLongAndLatFromResponse,null);

}

let getCityNameFromCoordsByAPI = async function(latitude,longtitude){
    
    //https://us1.locationiq.com/v1/reverse.php?key=d8f0580573990c&lat=32.124&lon=116.005&format=json
    var queryURL = "https://us1.locationiq.com/v1/reverse.php" +
    "?key=" + LOCATIONIQKEY +
    "&lat=" + latitude + "&lon=" + longtitude + 
    "&format=json" + 
    "&normalizecity"

    $.ajax({
        url: queryURL,
        method: "GET"
        })
        .then(getCityNameFromResponse,null);


}

let getCityNameFromResponse = function(reverseGeocodeResponse){
    let cityName = reverseGeocodeResponse.address.city
    currentCity = cityName;
    populatePage();
}

let getCityLongAndLatFromResponse = function(locationAPIResponse){

    if(locationAPIResponse[0].type === "city")
    {
        var longtitude = locationAPIResponse[0].lon;
        var latitude = locationAPIResponse[0].lat;
        getCityUVIndex(longtitude,latitude);
    } else {
        renderUV(-1)
    }

}

let getCityUVIndex = function(longtitude,latitude) {
    
    //the openweather uv index api gives a 404. can't get it to work
    
    //date in the format 2017-01-02T12:00:00Z
    // note the api doc says to hardcode 12:00:00Z
    // var currentDate = getCurrentTime().format("YYYY-MM-DDT12:00:00Z");
    
    // var queryURL = 
    // "https://api.openweathermap.org/v3/uvi/" + 
    // latitude + "," + longtitude + 
    // currentDate + 
    // ".json?" + 
    // "appid=" + APIKEY

    // $.ajax({
    // url: queryURL,
    // method: "GET"
    // })
    // .then(renderUV,null);

    var queryURL = 
    "https://api.openuv.io/api/v1/uv?lat=" + latitude + '&lng=' + longtitude

    $.ajax({
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
        request.setRequestHeader('x-access-token', OPENUVKEY);
    },
    url: queryURL})
    .then(getUVFromAjaxResponse,null);

}


let getUVFromAjaxResponse = function(ajaxResponse){
    var uvIndex = ajaxResponse.result.uv
    renderUV(uvIndex);
}

let renderWeatherFromAjax = function(weatherAjaxResponse){
    
    //get the weather for 12 noon for the day, instead of every 3 hours
    weatherArray = weatherAjaxResponse.list.filter(function (item) {
        return item.dt_txt.endsWith("00:00:00");
    });

    var forecastArray = [];
    //create a local weather object from the weatherDTO
    weatherArray.forEach(element => {
        forecast = {
            "date": moment(element.dt_txt).format("dddd Do"),
            "temp": element.main.temp,
            "humidity": element.main.humidity,
            "weatherSummary": element.weather[0].main,
            "weatherDescription": element.weather[0].description,
            "windSpeed": element.wind.speed,
            "iconSrc": "http://openweathermap.org/img/wn/" + element.weather[0].icon + "@2x.png"
        };

        forecastArray.push(forecast);     
    });

    renderForecastArray(forecastArray);

    var cardUpdatedText = $("<small>").text("Last updated: " + (new Date().toLocaleString())).addClass("text-muted p-3");
    $("#update-time").append(cardUpdatedText);

    var cityWeatherObject = {
        "Name": currentCity,
        "ForecastArray": forecastArray
    };

    storeRecentSearch(cityWeatherObject);
}

let renderRecentSearch = function(cityName){

    $("#recent-search-" + cityName).remove()
    var link = $("<a>").text(cityName).attr("href","#").addClass("mw-100 stretched-link p-sm-0").css({textTransform: "capitalize"})
    var listItem = $("<li>").addClass("list-group-item").append(link).attr("id",("recent-search-" + cityName))
    $("#search-history-list").prepend(listItem);
    
}

let renderForecastArray = function(forecastArray) {
    
    populateJumbotron(forecastArray[0]);

    $("#forecast-cards").empty();
    forecastArray.forEach(forecast => {
        addWeatherCard(forecast)    
    });
    $("#update-time").empty()

}

let addWeatherCard = function(forecast){
    //create a div that uses bootstraps card class using jquery
    var card = $("<div>").addClass("card border-primary bg-info mb-3");
    var cardImage = $("<img>").attr("src",forecast.iconSrc).addClass("card-img-top img-fluid").css({width: "100px", height: "auto"})
    var cardHeader = $("<div>").addClass("card-header");
    var cardBody = $("<div>").addClass("card-body");
    var cardTitle = $("<h5>").addClass("card-title text-white").text(forecast.date);
    var cardDesc = $("<p>").text(forecast.weatherDescription).addClass("card-text text-light");
    var cardTemp = $("<p>").text("Temp: " + forecast.temp).addClass("card-text text-light");
    var cardHumidity = $("<p>").text("Humidity: " + forecast.humidity + "%").addClass("card-text text-light");
    

    cardBody.append(cardTitle).append(cardDesc).append(cardTemp).append(cardHumidity)//.append(cardUpdatedText);
    card.append(cardImage).append(cardBody);
    $("#forecast-cards").append(card);
}

let renderUV = function(uvIndex){
    $(".jumbotron").remove(":contains('UV')")

    //uv range
    // 0-3 low 3-6 high 6+ high to extreme. taken from https://www.openuv.io/uvindex#
    var uvIndexColour = null;

    uvIndex = parseFloat(uvIndex.toFixed(2));

    switch (true) {
        case (uvIndex >= 0 && uvIndex <= 3):
                //low
                uvIndexColour = "#558B2F";
            break;
    
        case (uvIndex > 3 && uvIndex <= 6):
                //moderate
                uvIndexColour = "#F9A825";
            break;
                
        case (uvIndex > 6 && uvIndex <= 8):
                //high
                uvIndexColour = "#EF6C00";
            break;
            
        case (uvIndex > 8 && uvIndex <= 11):
                //very high
                uvIndexColour = "#B71C1C";
            break;
            
        case (uvIndex >= 11):
                //extreme
                uvIndexColour = "#6A1B9A";
            break;
        case (uvIndex === -1):
            //we were unable to retrieve the uv index
            var alertDiv = $("<div>").addClass("alert alert-danger").text("Sorry we were unable to retrieve the uv index for this city");
            $(".jumbotron").append(alertDiv);
            return;
        break;
        default:
            break;
    }
    
    var jumboUVIndex = $("<p>").text("UV Index: ");
    var span = $("<span />").text(uvIndex.toString());
    //give the uvindex text a background colour if we could retrieve one
    if( uvIndexColour !== null ){
        span.css("background-color",uvIndexColour).addClass("text-white px-2 py-1");
    }
    jumboUVIndex.append(span);

    $(".jumbotron").append(jumboUVIndex);
}

let mapOpenWeatherDateTimeToDateString = function(openWeatherDTstring){

}

let populateJumbotron = function (forecast) {
    
    $(".jumbotron").empty()

    var jumboTitle = $("<h3>").text(currentCity + " " + getCurrentTime().format("dddd Do MMM YYYY") + " " ).css({textTransform: "capitalize"})
    var jumboImage = $("<img>").attr("src",forecast.iconSrc).css({width: "100px", height: "auto"})
    var jumboTemp = $("<p>").text("Temperature: " + forecast.temp + '\u00B0' + "C").addClass("");
    var jumboHumidity = $("<p>").text("Humidity: " + forecast.humidity + "%").addClass("");
    var jumboWindSpeed = $("<p>").text("Wind Speed: " + forecast.windSpeed + " meter/sec").addClass("");
    
    $(".jumbotron").append(jumboTitle).append(jumboImage).append(jumboTemp).append(jumboHumidity).append(jumboWindSpeed)
}

let successfulGeoLocation = function(pos){
    getCityNameFromCoordsByAPI(pos.coords.latitude,pos.coords.longitude);
}

let populatePage = function(){
    renderRecentSearch(currentCity);
    searchCityWeatherByAPI(currentCity);
    searchCityByAPI(currentCity);
}

$("#search-button").on("click",function(){
    currentCity = $("#search-term").val();
    populatePage();
});

$("#search-history-list").on("click",function(){
    currentCity = $(event.target).text();
    populatePage();
});

let OnInit = function(){
    navigator.geolocation.getCurrentPosition(successfulGeoLocation)
    var cityWeatherRepo = retrieveRecentSearches()
    for (cityWeather in cityWeatherRepo)
    {
        renderRecentSearch(cityWeather);
    }
}

OnInit();
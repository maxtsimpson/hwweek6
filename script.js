// had a look at trying to do this as a class instead but doesn't really warrant it because
//there's no real calculations associated with it and want the render functions seperate
let cityWeatherRepo = {};
let currentCity = "";
const APIKEY = "db7659b069972354627d855668ebaf95"
const GEOAPIFYKEY = "d167547b4c204380b2554416dc375bc8"

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
    console.log({cityWeatherObject});
    cityWeatherRepo[cityWeatherObject.Name.toLowerCase()] = cityWeatherObject;
    localStorage.setItem("cityWeatherRepo",JSON.stringify(cityWeatherRepo));
}

let mapAPIWeatherToLocalWeather = function (cityWeatherDTO) {
    //this is seperated so that if the API change the format of their object we should just edit here

    
}

let searchCityWeatherByAPI = async function(cityName){
    console.log({cityName});
    
    //construct a request and search the api. then return the api weather object
    var queryURL = 
    "https://api.openweathermap.org/data/2.5/forecast?q=" + 
    cityName + 
    "&units=metric" +
    "&appid=" + APIKEY

    console.log({queryURL});
    // api.openweathermap.org/data/2.5/forecast/daily?q={city name}&cnt={cnt}&appid={your api key}
    //the only issue is the daily forecast needs a paid subscription, so we get a 3 hourly

    $.ajax({
    url: queryURL,
    method: "GET"
    })
    .then(renderWeatherFromAjax,null);
    //then just wants the name of the call back functions for args, not an actual call itself - no ()
}

let getCityLongtitudeAndLatitudeByAPI = async function(cityName){
    var queryURL = "https://geoapify-platform.p.rapidapi.com/v1/geocode/search" +
    "?text=" + cityName +
    "&type=city&apiKey=" + GEOAPIFYKEY

    $.ajax({
        url: queryURL,
        method: "GET"
        })
        .then(getCityUVIndex,null);

}

let getCityUVIndex = function(longtitude,latitude) {
    
    //date in the format 2017-01-02T12:00:00Z
    var currentDate = 'P';
    
    var queryURL = 
    "https://api.openweathermap.org/v3/uvi/" + 
    latitude + "," + longtitude + 
    currentDate + 
    ".json?" + 
    "appid=" + APIKEY

    $.ajax({
    url: queryURL,
    method: "GET"
    })
    .then(renderUVFromAjax,null);
}

let renderWeatherFromAjax = function(weatherAjaxResponse){
    
    //get the weather for 12 noon for the day, instead of every 3 hours
    weatherArray = weatherAjaxResponse.list.filter(function (item) {
        return item.dt_txt.endsWith("12:00:00");
    });

    var forecastArray = [];
    //create a local weather object from the weatherDTO
    weatherArray.forEach(element => {
        console.log({element});
        forecast = {
            "date": element,
            "temp": element.main.temp,
            "humidity": element.main.humidity,
            "weatherSummary": element.weather[0].main,
            "weatherDescription": element.weather[0].description,
            "iconSrc": "http://openweathermap.org/img/wn/" + element.weather[0].icon + "@2x.png"
        };

        forecastArray.push(forecast);     
    });

    console.log({forecastArray});
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
    // console.log($("#search-history-list").each(function(){
    //     if ($(this).text().toLowerCase() === cityName.toLowerCase()) {
    //         $("#search-history-list").remove()       
    //     }
    // }));

    $("#search-history-list").remove(":contains(cityName)")
    
    $("#search-history-list").prepend(
        $("<li>").append($("<a>").text(cityName).attr("href","#").attr("id",cityName))
        .addClass("list-group-item")
    );
}

let renderForecastArray = function(forecastArray) {
    console.log({forecastArray});
    //empty any current cards
    $("#forecast-cards").empty();
    forecastArray.forEach(forecast => {
        addWeatherCard(forecast)    
    });
    $("#update-time").empty()
}

let addWeatherCard = function(forecast){
    //create a div that uses bootstraps card class using jquery
    var card = $("<div>").addClass("card border-primary bg-info mb-3");
    var cardImage = $("<img>").attr("src",forecast.iconSrc).addClass("card-img-top img-fluid")
    var cardHeader = $("<div>").addClass("card-header");
    var cardBody = $("<div>").addClass("card-body");
    var cardTitle = $("<h5>").addClass("card-title");
    var cardTemp = $("<p>").text("Temp: " + forecast.temp).addClass("card-text text-light");
    var cardHumidity = $("<p>").text("Humidity: " + forecast.humidity + "%").addClass("card-text text-light");
    

    cardBody.append(cardTitle).append(cardTemp).append(cardHumidity)//.append(cardUpdatedText);
    card.append(cardImage).append(cardBody);
    $("#forecast-cards").append(card);
}

let renderUVFromAjax = function(uvIndex){
    $(".jumbotron").remove(":contains('UV')")
    var jumboUVIndex = $("<p>").text("UV Index: " + uvIndex)
    $(".jumbotron").append(jumboUVIndex);
}

let populateWeatherCard = function (forecast) {
    
    var jumboTemp = $("<p>").text("Temperature: " + forecast.temp + '\u00B0' + "C").addClass("");
    var jumboHumidity = $("<p>").text("Humidity: " + forecast.humidity + "%").addClass("");
    var jumboWindSpeed = $("<p>").text("Humidity: " + forecast.humidity + "%").addClass("");
    
    $(".jumbotron").append(jumboTemp).append(jumboHumidity).append(jumboWindSpeed)
}

$("#search-button").on("click",function(){
    currentCity = $("#search-term").val();
    renderRecentSearch(currentCity);
    searchCityWeatherByAPI(currentCity);
});

$("#search-history-list").on("click",function(){
    // console.log();
    currentCity = $(event.target).text();
    renderRecentSearch(currentCity);
    searchCityWeatherByAPI(currentCity);
});

// var a = searchCityWeatherByAPI("perth");
// console.log({a});
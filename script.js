// had a look at trying to do this as a class instead but doesn't really warrant it because
//there's no real calculations associated with it and want the render functions seperate
let cityWeatherRepo = {};
const APIKEY = "db7659b069972354627d855668ebaf95"


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
    cityWeatherRepo[cityWeatherObject.Name] = {

    }
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

    console.log({queryURL});
    // api.openweathermap.org/data/2.5/forecast/daily?q={city name}&cnt={cnt}&appid={your api key}
    //the only issue is the daily forecast needs a paid subscription, so we get a 3 hourly

    var cityWeather = null;
    $.ajax({
    url: queryURL,
    method: "GET"
    })
    .then(renderWeather,null);
    //then just wants the name of the call back functions for args, not an actual call itself - no ()
}

let renderWeather = function(weatherAjaxResponse){
    
    //get the weather for 12 noon for the day, instead of every 3 hours
    weatherArray = weatherAjaxResponse.list.filter(function (item) {
        return item.dt_txt.endsWith("12:00:00");
    });

    //empty any current cards
    $("#forecast-cards").empty();

    //create a local weather object from the weatherDTO
    weatherArray.forEach(element => {
        console.log({element});
        forecast = {
            "temp": element.main.temp,
            "humidity": element.main.humidity,
            "weatherSummary": element.weather[0].main,
            "weatherDescription": element.weather[0].description,
            "iconSrc": "http://openweathermap.org/img/wn/" + element.weather[0].icon + "@2x.png"
        };

        //clear the cards from underneath forecast cards
        
        addWeatherCard(forecast)
    });

    var cardUpdatedText = $("<small>").text("Last updated: " + (new Date().toLocaleString())).addClass("text-muted p-3");
    $("#forecast-cards").append(cardUpdatedText);


}

let addWeatherCard = function(forecast){
    //create a div that uses bootstraps card class using jquery
    var card = $("<div>").addClass("col-2");
    var cardImage = $("<img>").attr("src",forecast.iconSrc)//.addClass("card-img-top")
    var cardBody = $("<div>");
    var cardTitle = $("<h5>");
    var cardTemp = $("<p>").text("Temp: " + forecast.temp);
    var cardHumidity = $("<p>").text("Humidity: " + forecast.humidity + "%");
    

    cardBody.append(cardTitle).append(cardTemp).append(cardHumidity)//.append(cardUpdatedText);
    card.append(cardImage).append(cardBody);
    $("#forecast-cards").append(card);
}

let search = function(event){
    console.log("search function")
    console.log( $(this).parent);
    $()
    // $(this)
}

$("#search-button").on("click",search);

// var a = searchCityWeatherByAPI("Perth");
// console.log({a});
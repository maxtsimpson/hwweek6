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

    var queryURL = 
    "api.openweathermap.org/data/2.5/forecast?q=" + 
    cityName + 
    "appid=" + APIKEY

    $.ajax({
    url: queryURL,
    method: "GET"
    })
    .then(function(response) {
        console.log({response})
        return response;
    });
    
}

let searchCityWeatherByAPI = function(){
    //construct a request and search the api. then return the api weather object

    return cityWeatherDTO;
}

let renderWeather = function(){

}


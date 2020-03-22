// had a look at trying to do this as a class instead but doesn't really warrant it because
//there's no real calculations associated with it and want the render functions seperate
let cityWeatherRepo = {};
let currentCity = "";
const APIKEY = "db7659b069972354627d855668ebaf95";
const GEOAPIFYKEY = "d167547b4c204380b2554416dc375bc8";
const LOCATIONIQKEY = "d8f0580573990c";
const OPENUVKEY = "aaa5274f748d804b446f494b32315010";

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

    console.log({queryURL})

    $.ajax({
        url: queryURL,
        method: "GET"
        })
        .then(getCityLongAndLatFromResponse,null);

}

let getCityLongAndLatFromResponse = function(locationAPIResponse){

    console.log({locationAPIResponse});
    if(locationAPIResponse[0].type === "city")
    {
        var longtitude = locationAPIResponse[0].lon;
        var latitude = locationAPIResponse[0].lat;
        getCityUVIndex(longtitude,latitude);
    } else {
        alert("could not find the city you searched for")
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

    // console.log({queryURL})

    // $.ajax({
    // url: queryURL,
    // method: "GET"
    // })
    // .then(renderUV,null);

    var queryURL = 
    "https://api.openuv.io/api/v1/uv?lat=" + latitude + '&lng=' + longtitude

    console.log({queryURL})

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
    console.log({ajaxResponse});
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
        console.log({element});
        forecast = {
            "date": element,
            "temp": element.main.temp,
            "humidity": element.main.humidity,
            "weatherSummary": element.weather[0].main,
            "weatherDescription": element.weather[0].description,
            "windSpeed": element.wind.speed,
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


    populateWeatherCard(forecastArray[0]);

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

    //uv index will be a decimal so need to check how that works with comparisons
    //should also round it to 2 decimal places
    
    switch (true) {
        case (uvIndex > 0 && uvIndex <= 3):
                //low
                uvIndexColour = "#558B2F" 
            break;
    
        case (uvIndex > 0 && uvIndex <= 3):
                //moderate
                uvIndexColour = "#F9A825"
            break;
                
        case (uvIndex > 0 && uvIndex <= 3):
                //high
                uvIndexColour = "#EF6C00"
            break;
            
        case (uvIndex > 0 && uvIndex <= 3):
                //very high
                uvIndexColour = "#B71C1C"
            break;
            
        case (uvIndex > 0 && uvIndex <= 3):
                //extreme
                uvIndexColour = "#6A1B9A"
            break;
        default:
            break;
    }

    var jumboUVIndex = $("<p>").text("UV Index: " + uvIndex)
    if( uvIndexColour !== null ){

    }
    $(".jumbotron").append(jumboUVIndex);
}

let populateWeatherCard = function (forecast) {
    
    $(".jumbotron").empty()

    var jumboTemp = $("<p>").text("Temperature: " + forecast.temp + '\u00B0' + "C").addClass("");
    var jumboHumidity = $("<p>").text("Humidity: " + forecast.humidity + "%").addClass("");
    var jumboWindSpeed = $("<p>").text("Wind Speed: " + forecast.windSpeed + "%").addClass("");
    
    $(".jumbotron").append(jumboTemp).append(jumboHumidity).append(jumboWindSpeed)
}

$("#search-button").on("click",function(){
    currentCity = $("#search-term").val();
    renderRecentSearch(currentCity);
    searchCityByAPI(currentCity);
    searchCityWeatherByAPI(currentCity);
});

$("#search-history-list").on("click",function(){
    // console.log();
    currentCity = $(event.target).text();
    renderRecentSearch(currentCity);
    searchCityByAPI(currentCity);
    searchCityWeatherByAPI(currentCity);
});

// var a = searchCityWeatherByAPI("perth");
// console.log({a});
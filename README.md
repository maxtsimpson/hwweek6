# 06 Server-Side APIs: Weather Dashboard

Developers are often tasked with retrieving data from another application's API and using it in the context of their own. Third-party APIs allow developers to access their data and functionality by making requests with specific parameters to a URL. Your challenge is to build a weather dashboard that will run in the browser and feature dynamically updated HTML and CSS.

Use the [OpenWeather API](https://openweathermap.org/api) to retrieve weather data for cities. The documentation includes a section called "How to start" that will provide basic setup and usage instructions. Use `localStorage` to store any persistent data.

## User Story

```
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly
```

## Acceptance Criteria

```
GIVEN a weather dashboard with form inputs
WHEN I search for a city
    make a search input field and search button
    add an event listener for clicking the search button
THEN I am presented with current and future conditions for that city and that city is added to the search history
    on search click:
        add the city to the search history list
        call a store recent serach function
            Define a storeRecentSearch function that:
            stores the search in local storage
        call a searchCity function
            Define a searchCity funtion that:
            calls the api with the city
            on success calls the render weather info function
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
    Define a renderWeather function that:
        maps the api object we get back to the fields we are expecting to render
        populate the main card at the top of the page
        dynamically create a card per day in the 5 day forecast
WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
    write in if condition in the render function to change the class attribute on the UV display, use the bootswatch classes
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
    add an event listener for the unordered list and use event delegation for the on click
        the on click should call the searchCity function
```
Define an OnInit function that retrieves the search History on page load.
could also add some default behaviour that it uses geolocation from the browser to load weather for that users city by default

The following image demonstrates the application functionality:

![weather dashboard demo](./Assets/06-server-side-apis-homework-demo.png)

## Review

You are required to submit the following for review:

* The URL of the deployed application.

* The URL of the GitHub repository. Give the repository a unique name and include a README describing the project.

- - -
© 2019 Trilogy Education Services, a 2U, Inc. brand. All Rights Reserved.

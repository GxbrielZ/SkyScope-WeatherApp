const weatherForm = document.querySelector("#weather-form");
const cityInput = document.querySelector("#city-input");
const currentDate = document.querySelector("#current-date");
const mobileDate = document.querySelector("#mobile-date");
const weatherIcon = document.querySelector("#weather-icon");
const tempDisplay = document.querySelector("#temp");
const cityDisplay = document.querySelector("#city-name");
const perceivedTempDisplay = document.querySelector("#perceived-temperature");
const pressureDisplay = document.querySelector("#pressure");
const humidityDisplay = document.querySelector("#humidity");
const windDisplay = document.querySelector("#wind");

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultCity = "Berlin";

//API KEY
const apiKey = "ENTER YOUR API KEY HERE!";

//DEFAULT DATA ON LOAD
window.onload = async () => {
    //CURRENT DATE DISPLAY
    let today = new Date();
    let dayName = weekDays[today.getDay()];
    let todayString = dayName + ' '
        +('0' + today.getDate()).slice(-2) + '.'
        + ('0' + (today.getMonth() + 1)).slice(-2) + '.'
        + today.getFullYear();

    currentDate.textContent = `${todayString}`;
    mobileDate.textContent = `${todayString}`;

    //WEATHER ON LOAD
    try {
        const weatherData = await getWeatherData(defaultCity);
        displayWeatherInfo(weatherData);
    } catch (error) {
        console.error(error);
    }
};

//WEATHER DATA
weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    const city = cityInput.value;
    
    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);

            cityInput.classList.remove("error");
        } catch(error) {
            console.error(error);
            cityInput.classList.add("error");
        }
    } else {
        console.log("Please enter correct city name.");
        cityInput.classList.add("error");
    }

    cityInput.value = "";
});

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not fetch weather data");
    }

    return await response.json();
}

async function getForecastData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not fetch forecast data");
    }

    return await response.json();
}

function processForecastData(data) {
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const time = date.getHours();

        if (time === 13) {
            const dateKey = date.toISOString().split('T')[0];

            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    temp: item.main.temp,
                    weatherId: item.weather[0].id,
                    date: date
                };
            }
        }
    });

    return Object.values(dailyForecasts).slice(0, 5);
}

async function displayWeatherInfo(data) {
    //console.log(data);

    const {
        name: city,
        main: { temp, feels_like, humidity, pressure },
        weather: [{ id }],
        wind: { speed },
        dt,
        sys: { sunrise, sunset }
    } = data;

    const iconPath = getWeatherEmoji(id, dt, sunrise, sunset);
    
    weatherIcon.src = iconPath;
    cityDisplay.textContent = city;
    tempDisplay.textContent = `${(temp - 273.15).toFixed(1)}°C`;
    perceivedTempDisplay.textContent = `Perceived temperature: ${(feels_like - 273.15).toFixed(1)}°C`;
    pressureDisplay.textContent = `Pressure: ${pressure} hPa`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    windDisplay.textContent = `Wind: ${speed} km/h`;

    //FORECAST DATA
    try {
        const forecastData = await getForecastData(city);
        displayForecastInfo(forecastData);
    } catch (error) {
        console.error(error);
    }
}

async function displayForecastInfo(data) {
    const forecastBoxes = document.querySelectorAll(".future-day-box");
    const processedForecast = processForecastData(data);

    forecastBoxes.forEach((box, index) => {
        const forecast = processedForecast[index];
        if (forecast) {
            const icon = box.querySelector(".forecast-icon");
            const temp = box.querySelector(".future-temperature");
            const date = box.querySelector(".future-day");

            const iconPath = getWeatherEmoji(forecast.weatherId, forecast.date.getTime() / 1000, 0, 0, true);

            icon.src = iconPath;
            temp.textContent = `${(forecast.temp - 273.15).toFixed(1)}°C`;

            const day = String(forecast.date.getDate()).padStart(2, '0');
            const month = String(forecast.date.getMonth() + 1).padStart(2, '0');
            const year = forecast.date.getFullYear();
            const formattedDate = `${day}.${month}.${year}`;

            date.textContent = formattedDate;
        }
    });
}

function getWeatherEmoji(weatherId, timestamp, sunrise, sunset, isForecast = false) {
    const isDay = isForecast ? true : timestamp >= sunrise && timestamp < sunset;

    switch (true) {
        case (weatherId >= 200 && weatherId < 300):
            return "/assets/weather-icons/thunderstorm.png";
        case (weatherId >= 300 && weatherId < 500):
            return "/assets/weather-icons/shower_rain.png";
        case (weatherId >= 500 && weatherId < 600):
            return isDay ? "/assets/weather-icons/rain_day.png" : "/assets/weather-icons/rain_night.png";
        case (weatherId >= 600 && weatherId < 611):
            return isDay ? "/assets/weather-icons/snow_day.png" : "/assets/weather-icons/snow_night.png";
        case (weatherId >= 611 && weatherId < 701):
            return "/assets/weather-icons/snow_rain.png";
        case (weatherId >= 701 && weatherId < 800):
            return isDay ? "/assets/weather-icons/mist_day.png" : "/assets/weather-icons/mist_night.png";
        case (weatherId === 800):
            return isDay ? "/assets/weather-icons/clear_sky_day.png" : "/assets/weather-icons/clear_sky_night.png";
        case (weatherId === 801):
            return isDay ? "/assets/weather-icons/few_clouds_day.png" : "/assets/weather-icons/few_clouds_night.png";
        case (weatherId >= 802 && weatherId <= 804):
            return "/assets/weather-icons/clouds.png";
        default:
            return isDay ? "/assets/weather-icons/clear_sky_day.png" : "/assets/weather-icons/clear_sky_night.png";
    }
}
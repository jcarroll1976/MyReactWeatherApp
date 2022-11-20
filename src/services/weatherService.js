import {DateTime} from "luxon";

const WEATHER_API_KEY = "f0ac43b811ac6e1e9b72b43afb981350";
const BASE_URL = "https://api.openweathermap.org/data/2.5";



//https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid={API key}

const getWeatherData = (infoType,searchParams) => {
    const url = new URL(BASE_URL + "/" + infoType);
    url.search = new URLSearchParams({...searchParams, appid:WEATHER_API_KEY});
    return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
    const {
        coord: {lon,lat},
        main: {temp,feels_like, temp_min, temp_max, humidity},
        name,
        dt,
        sys: {country,sunrise,sunset},
        weather,
        wind: {speed}
    } = data

    const {main:details,icon} = weather[0];

    return {lon,lat,temp,feels_like,temp_min,temp_max,humidity,name,dt,country,sunrise,sunset,details,icon,speed}
};

const formatForecastWeather = (data) => {
    let {timezone,daily,hourly} = data;
    daily = daily.slice(0,5).map(d => {
        return {
            title: formatToLocalTime(d.dt, timezone, 'ccc'),
            temp: d.temp.day,
            icon: d.weather[0].icon
        }
    });

    hourly = hourly.slice(1,6).map(d => {
        return {
            title: formatToLocalTime(d.dt, timezone, 'hh:mm a'),
            temp: d.temp,
            icon: d.weather[0].icon
        }
    });

    return {timezone,daily,hourly};
}
const getFormattedWeatherData = async (searchParams) => {
    const formattedCurrentWeather = await getWeatherData("weather",searchParams).then(formatCurrentWeather)

    const {lon,lat} = formattedCurrentWeather;

    const formattedForecastWeather = await getWeatherData("onecall", {lon,lat,exclude:'current,minutely,alerts',units:searchParams.units}).then(formatForecastWeather);

    return {...formattedCurrentWeather,...formattedForecastWeather};
}

const formatToLocalTime = (secs,zone, format = "cccc, LLL dd yyyy") => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const iconUrlFromCode = (code) => `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export {formatToLocalTime, iconUrlFromCode};
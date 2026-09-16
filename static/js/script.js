// =========================================================
// WEATHER ACROSS WORLD
// MAIN SCRIPT.JS
// =========================================================

let temperatureChart = null;
let latestWeatherData = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const aiWeatherButton =
    document.getElementById("aiWeatherButton");

const aiWeatherText =
    document.getElementById("aiWeatherText");

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const locationButton =
    document.getElementById("locationButton");

const weatherSection =
    document.getElementById("weatherSection");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const themeButton =
    document.getElementById("themeButton");


// =========================================================
// AI FLOATING ASSISTANT ELEMENTS
// =========================================================

const aiFloatingButton =
    document.getElementById("aiFloatingButton");

const aiChatWindow =
    document.getElementById("aiChatWindow");

const aiCloseButton =
    document.getElementById("aiCloseButton");

const aiChatInput =
    document.getElementById("aiChatInput");

const aiSendButton =
    document.getElementById("aiSendButton");

const aiMessages =
    document.getElementById("aiMessages");


// =========================================================
// WEATHER DESCRIPTIONS
// =========================================================

function getWeatherDescription(code) {

    const descriptions = {

        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",

        45: "Fog",
        48: "Depositing Rime Fog",

        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",

        56: "Freezing Drizzle",
        57: "Dense Freezing Drizzle",

        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",

        66: "Freezing Rain",
        67: "Heavy Freezing Rain",

        71: "Slight Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",

        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",

        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",

        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Thunderstorm with Heavy Hail"
    };

    return descriptions[code] || "Unknown Weather";
}


// =========================================================
// WEATHER ICONS
// =========================================================

function getWeatherIcon(code, isDay = 1) {

    if (code === 0) {
        return isDay ? "☀️" : "🌙";
    }

    if (code === 1 || code === 2) {
        return isDay ? "🌤️" : "🌙";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code === 45 || code === 48) {
        return "🌫️";
    }

    if (code >= 51 && code <= 67) {
        return "🌧️";
    }

    if (code >= 71 && code <= 77) {
        return "❄️";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️";
    }

    if (code >= 85 && code <= 86) {
        return "🌨️";
    }

    if (code >= 95) {
        return "⛈️";
    }

    return "🌤️";
}


// =========================================================
// LOADING
// =========================================================

function showLoading() {

    if (loading) {
        loading.classList.remove("hidden");
    }

    if (weatherSection) {
        weatherSection.classList.add("hidden");
    }

    if (errorBox) {
        errorBox.classList.add("hidden");
    }
}


function hideLoading() {

    if (loading) {
        loading.classList.add("hidden");
    }
}


// =========================================================
// ERROR
// =========================================================

function showError(message) {

    hideLoading();

    if (weatherSection) {
        weatherSection.classList.add("hidden");
    }

    if (errorMessage) {
        errorMessage.textContent =
            message || "Something went wrong.";
    }

    if (errorBox) {
        errorBox.classList.remove("hidden");
    }
}


// =========================================================
// SEARCH WEATHER
// =========================================================

async function getWeather() {

    if (!cityInput) {
        return;
    }

    const city =
        cityInput.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    showLoading();

    try {

        const response =
            await fetch(
                `/api/weather?city=${encodeURIComponent(city)}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to find weather."
            );
        }

        displayWeather(data);

    }

    catch (error) {

        console.error(
            "Weather search error:",
            error
        );

        showError(
            error.message ||
            "Unable to get weather."
        );
    }

    finally {

        hideLoading();
    }
}


// =========================================================
// CURRENT LOCATION
// =========================================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            if (cityInput) {
                cityInput.value = "";
            }

            try {

                const response =
                    await fetch(
                        `/api/weather/location?latitude=${latitude}&longitude=${longitude}`
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to get your location weather."
                    );
                }

                displayWeather(data);

            }

            catch (error) {

                console.error(
                    "Location weather error:",
                    error
                );

                showError(
                    error.message ||
                    "Unable to get weather for your location."
                );
            }

            finally {

                hideLoading();
            }
        },

        function (error) {

            hideLoading();

            switch (error.code) {

                case error.PERMISSION_DENIED:

                    showError(
                        "Location permission was denied. Please allow location access in your browser."
                    );

                    break;

                case error.POSITION_UNAVAILABLE:

                    showError(
                        "Your location could not be determined."
                    );

                    break;

                case error.TIMEOUT:

                    showError(
                        "Location request timed out. Please try again."
                    );

                    break;

                default:

                    showError(
                        "Unable to determine your location."
                    );
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }
    );
}


// =========================================================
// DISPLAY WEATHER
// =========================================================

function displayWeather(data) {

    if (!data) {
        return;
    }

    latestWeatherData = data;

    restartWeatherAnimations();

    const current =
        data.current || {};

    const location =
        data.location || {};


    // -------------------------------------------------------
    // LOCATION
    // -------------------------------------------------------

    const cityName =
        document.getElementById("cityName");

    const countryName =
        document.getElementById("countryName");

    if (cityName) {

        cityName.textContent =
            location.city ||
            "Unknown Location";
    }

    if (countryName) {

        countryName.textContent =
            location.country ||
            "";
    }


    // -------------------------------------------------------
    // TEMPERATURE
    // -------------------------------------------------------

    const temperature =
        document.getElementById("temperature");

    if (temperature) {

        temperature.textContent =
            `${Math.round(
                current.temperature_2m ?? 0
            )}°C`;
    }


    // -------------------------------------------------------
    // WEATHER DESCRIPTION
    // -------------------------------------------------------

    const weatherDescription =
        document.getElementById(
            "weatherDescription"
        );

    if (weatherDescription) {

        weatherDescription.textContent =
            getWeatherDescription(
                current.weather_code
            );
    }


    // -------------------------------------------------------
    // WEATHER ICON
    // -------------------------------------------------------

    const weatherIcon =
        document.getElementById(
            "weatherIcon"
        );

    if (weatherIcon) {

        weatherIcon.textContent =
            getWeatherIcon(
                current.weather_code,
                current.is_day
            );
    }


    // -------------------------------------------------------
    // HUMIDITY
    // -------------------------------------------------------

    const humidity =
        document.getElementById(
            "humidity"
        );

    if (humidity) {

        humidity.textContent =
            `${current.relative_humidity_2m ?? "--"}%`;
    }


    // -------------------------------------------------------
    // WIND
    // -------------------------------------------------------

    const wind =
        document.getElementById("wind");

    if (wind) {

        wind.textContent =
            `${Math.round(
                current.wind_speed_10m ?? 0
            )} km/h`;
    }


    // -------------------------------------------------------
    // FEELS LIKE
    // -------------------------------------------------------

    const feelsLike =
        document.getElementById(
            "feelsLike"
        );

    if (feelsLike) {

        feelsLike.textContent =
            `${Math.round(
                current.apparent_temperature ?? 0
            )}°C`;
    }


    // -------------------------------------------------------
    // PRECIPITATION
    // -------------------------------------------------------

    const rain =
        document.getElementById("rain");

    if (rain) {

        rain.textContent =
            `${current.precipitation ?? 0} mm`;
    }


    // -------------------------------------------------------
    // CLOUD COVER
    // -------------------------------------------------------

    const cloudCover =
        document.getElementById(
            "cloudCover"
        );

    if (cloudCover) {

        cloudCover.textContent =
            `${current.cloud_cover ?? 0}%`;
    }


    // -------------------------------------------------------
    // WIND DIRECTION
    // -------------------------------------------------------

    const windDirection =
        document.getElementById(
            "windDirection"
        );

    if (windDirection) {

        windDirection.textContent =
            `${current.wind_direction_10m ?? 0}°`;
    }


    // -------------------------------------------------------
    // PRESSURE
    // -------------------------------------------------------

    const pressure =
        document.getElementById(
            "pressure"
        );

    if (pressure) {

        pressure.textContent =
            `${Math.round(
                current.surface_pressure ?? 0
            )} hPa`;
    }


    // -------------------------------------------------------
    // LOCAL TIME
    // -------------------------------------------------------

    const localTime =
        document.getElementById(
            "localTime"
        );

    if (localTime) {

        localTime.textContent =
            formatDateTime(
                current.time
            );
    }


    // -------------------------------------------------------
    // FORECAST
    // -------------------------------------------------------

    if (data.daily) {

        displayForecast(
            data.daily
        );

        createTemperatureChart(
            data.daily
        );
    }


    // -------------------------------------------------------
    // SHOW WEATHER SECTION
    // -------------------------------------------------------

    if (weatherSection) {

        weatherSection.classList.remove(
            "hidden"
        );

        setTimeout(
            function () {

                weatherSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            100
        );
    }


    // -------------------------------------------------------
    // RESET AI INSIGHT
    // -------------------------------------------------------

    if (aiWeatherText) {

        aiWeatherText.textContent =
            "Weather loaded! Ask Weather AI for advice. ✨";
    }
}


// =========================================================
// FORECAST
// =========================================================

function displayForecast(daily) {

    const container =
        document.getElementById(
            "forecastContainer"
        );

    if (!container || !daily) {
        return;
    }

    container.innerHTML = "";

    const dates =
        daily.time || [];

    for (
        let i = 0;
        i < dates.length;
        i++
    ) {

        const date =
            new Date(
                `${dates[i]}T12:00:00`
            );

        const day =
            i === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        const icon =
            getWeatherIcon(
                daily.weather_code?.[i]
            );

        const max =
            Math.round(
                daily.temperature_2m_max?.[i] ?? 0
            );

        const min =
            Math.round(
                daily.temperature_2m_min?.[i] ?? 0
            );

        const rain =
            daily.precipitation_probability_max?.[i] ?? 0;

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        card.innerHTML = `

            <div class="forecast-day">
                ${day}
            </div>

            <div class="forecast-icon">
                ${icon}
            </div>

            <div class="forecast-max">
                ${max}°C
            </div>

            <div class="forecast-min">
                ${min}°C
            </div>

            <div class="forecast-rain">
                🌧️ ${rain}%
            </div>

        `;

        container.appendChild(card);
    }


    // =====================================================
    // SUNRISE
    // =====================================================

    const sunrise =
        document.getElementById("sunrise");

    if (
        sunrise &&
        daily.sunrise &&
        daily.sunrise.length
    ) {

        sunrise.textContent =
            formatTime(
                daily.sunrise[0]
            );
    }


    // =====================================================
    // SUNSET
    // =====================================================

    const sunset =
        document.getElementById("sunset");

    if (
        sunset &&
        daily.sunset &&
        daily.sunset.length
    ) {

        sunset.textContent =
            formatTime(
                daily.sunset[0]
            );
    }
}


// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(value) {

    if (!value) {
        return "--";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =========================================================
// FORMAT DATE TIME
// =========================================================

function formatDateTime(value) {

    if (!value) {
        return "--";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString(
        [],
        {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =========================================================
// RESTART ANIMATIONS
// =========================================================

function restartWeatherAnimations() {

    const elements =
        document.querySelectorAll(
            `
            .weather-section,
            .current-weather-card,
            .weather-icon,
            .temperature,
            .weather-description,
            .weather-detail,
            .forecast-section,
            .forecast-card,
            .sun-card
            `
        );

    elements.forEach(
        element => {

            element.style.animation =
                "none";

            void element.offsetWidth;

            element.style.animation =
                "";
        }
    );
}


// =========================================================
// DARK MODE
// =========================================================

function toggleTheme() {

    if (!document.body) {
        return;
    }

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    if (themeButton) {

        themeButton.textContent =
            isDark
                ? "☀️"
                : "🌙";
    }

    try {

        localStorage.setItem(
            "theme",
            isDark
                ? "dark"
                : "light"
        );

    }

    catch (error) {

        console.warn(
            "Could not save theme.",
            error
        );
    }

    syncAITheme();
}


// =========================================================
// AI THEME
// =========================================================

function syncAITheme() {

    if (!document.body) {
        return;
    }

    const isMainDark =
        document.body.classList.contains(
            "dark"
        );

    if (aiChatWindow) {

        aiChatWindow.classList.toggle(
            "ai-opposite-dark",
            !isMainDark
        );

        aiChatWindow.classList.toggle(
            "ai-opposite-light",
            isMainDark
        );
    }
}


// =========================================================
// LOAD THEME
// =========================================================

function loadTheme() {

    let theme = "light";

    try {

        theme =
            localStorage.getItem(
                "theme"
            ) || "light";

    }

    catch (error) {

        console.warn(
            "Could not load theme.",
            error
        );
    }

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        if (themeButton) {
            themeButton.textContent =
                "☀️";
        }
    }

    else {

        document.body.classList.remove(
            "dark"
        );

        if (themeButton) {
            themeButton.textContent =
                "🌙";
        }
    }

    syncAITheme();
}


// =========================================================
// TEMPERATURE CHART
// =========================================================

function createTemperatureChart(daily) {

    const canvas =
        document.getElementById(
            "temperatureChart"
        );

    if (!canvas || !daily) {
        return;
    }


    // -------------------------------------------------------
    // DESTROY PREVIOUS CHART
    // -------------------------------------------------------

    if (temperatureChart) {

        temperatureChart.destroy();

        temperatureChart = null;
    }


    const dates =
        daily.time || [];

    const maxTemperatures =
        daily.temperature_2m_max || [];

    const minTemperatures =
        daily.temperature_2m_min || [];


    if (!dates.length) {
        return;
    }


    // -------------------------------------------------------
    // LABELS
    // -------------------------------------------------------

    const labels =
        dates.map(
            (date, index) => {

                if (index === 0) {
                    return "Today";
                }

                const dateObject =
                    new Date(
                        `${date}T12:00:00`
                    );

                return dateObject.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );
            }
        );


    // -------------------------------------------------------
    // CHECK CHART.JS
    // -------------------------------------------------------

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js is not loaded."
        );

        return;
    }


    // -------------------------------------------------------
    // CREATE CHART
    // -------------------------------------------------------

    temperatureChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label: "High",

                            data:
                                maxTemperatures.map(
                                    value =>
                                        Math.round(value)
                                ),

                            borderColor:
                                "#f97316",

                            backgroundColor:
                                "rgba(249, 115, 22, 0.10)",

                            borderWidth: 3,

                            pointBackgroundColor:
                                "#f97316",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            pointRadius: 5,

                            pointHoverRadius: 7,

                            tension: 0.4,

                            fill: false
                        },

                        {
                            label: "Low",

                            data:
                                minTemperatures.map(
                                    value =>
                                        Math.round(value)
                                ),

                            borderColor:
                                "#38bdf8",

                            backgroundColor:
                                "rgba(56, 189, 248, 0.10)",

                            borderWidth: 3,

                            pointBackgroundColor:
                                "#38bdf8",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            pointRadius: 5,

                            pointHoverRadius: 7,

                            tension: 0.4,

                            fill: false
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: "index",

                        intersect: false
                    },

                    plugins: {

                        legend: {

                            display: true,

                            labels: {

                                color:
                                    "#a8b8ca",

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                padding:
                                    20,

                                font: {

                                    family:
                                        "Inter",

                                    size:
                                        12,

                                    weight:
                                        "600"
                                }
                            }
                        },

                        tooltip: {

                            backgroundColor:
                                "#0b1729",

                            titleColor:
                                "#ffffff",

                            bodyColor:
                                "#cbd5e1",

                            borderColor:
                                "#263852",

                            borderWidth:
                                1,

                            padding:
                                12,

                            callbacks: {

                                label:
                                    function (context) {

                                        return (
                                            context.dataset.label +
                                            ": " +
                                            context.parsed.y +
                                            "°C"
                                        );
                                    }
                            }
                        }
                    },

                    scales: {

                        x: {

                            grid: {

                                color:
                                    "rgba(148, 163, 184, 0.06)",

                                drawBorder:
                                    false
                            },

                            ticks: {

                                color:
                                    "#71869f",

                                font: {

                                    family:
                                        "Inter",

                                    size:
                                        11,

                                    weight:
                                        "600"
                                }
                            }
                        },

                        y: {

                            grid: {

                                color:
                                    "rgba(148, 163, 184, 0.08)",

                                drawBorder:
                                    false
                            },

                            ticks: {

                                color:
                                    "#71869f",

                                callback:
                                    function (value) {

                                        return (
                                            value +
                                            "°C"
                                        );
                                    },

                                font: {

                                    family:
                                        "Inter",

                                    size:
                                        11
                                }
                            }
                        }
                    }
                }
            }
        );
}


// =========================================================
// AI CHAT - ADD MESSAGE
// =========================================================

function addAIMessage(text, sender) {

    if (!aiMessages) {
        return;
    }

    const message =
        document.createElement("div");

    message.className =
        sender === "user"
            ? "ai-message ai-message-user"
            : "ai-message ai-message-bot";


    const avatar =
        document.createElement("div");

    avatar.className =
        "ai-message-avatar";

    avatar.textContent =
        sender === "user"
            ? "👤"
            : "✦";


    const content =
        document.createElement("div");

    content.className =
        "ai-message-content";

    content.textContent =
        text;


    message.appendChild(avatar);

    message.appendChild(content);

    aiMessages.appendChild(message);


    aiMessages.scrollTop =
        aiMessages.scrollHeight;
}


// =========================================================
// AI TYPING
// =========================================================

function showAITyping() {

    if (!aiMessages) {
        return;
    }

    removeAITyping();

    const typing =
        document.createElement("div");

    typing.id =
        "aiTypingMessage";

    typing.className =
        "ai-message ai-message-bot";

    typing.innerHTML = `

        <div class="ai-message-avatar">
            ✦
        </div>

        <div class="ai-message-content">

            <div class="ai-typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>
    `;

    aiMessages.appendChild(
        typing
    );

    aiMessages.scrollTop =
        aiMessages.scrollHeight;
}


// =========================================================
// REMOVE AI TYPING
// =========================================================

function removeAITyping() {

    const typing =
        document.getElementById(
            "aiTypingMessage"
        );

    if (typing) {
        typing.remove();
    }
}


// =========================================================
// OPEN AI CHAT
// =========================================================

function openAIChat() {

    if (!aiChatWindow) {
        return;
    }

    aiChatWindow.classList.add(
        "active"
    );

    if (aiChatInput) {

        setTimeout(
            () => aiChatInput.focus(),
            100
        );
    }
}


// =========================================================
// CLOSE AI CHAT
// =========================================================

function closeAIChat() {

    if (!aiChatWindow) {
        return;
    }

    aiChatWindow.classList.remove(
        "active"
    );
}


// =========================================================
// SEND AI MESSAGE
// =========================================================

async function sendAIMessage() {

    if (!aiChatInput) {
        return;
    }

    const question =
        aiChatInput.value.trim();

    if (!question) {
        return;
    }


    addAIMessage(
        question,
        "user"
    );

    aiChatInput.value = "";


    if (aiSendButton) {

        aiSendButton.disabled =
            true;
    }


    showAITyping();


    try {

        const response =
            await fetch(
                "/api/ai-weather",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            message:
                                question,

                            city:
                                latestWeatherData?.location?.city ||
                                "No city selected",

                            current:
                                latestWeatherData?.current ||
                                {},

                            daily:
                                latestWeatherData?.daily ||
                                {}
                        })
                }
            );


        const result =
            await response.json();

        removeAITyping();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "AI request failed."
            );
        }


        addAIMessage(
            result.response ||
            "I couldn't generate a response.",
            "ai"
        );
    }


    catch (error) {

        console.error(
            "AI Error:",
            error
        );

        removeAITyping();

        addAIMessage(
            error.message ||
            "Weather AI is temporarily unavailable. Please try again later.",
            "ai"
        );
    }


    finally {

        if (aiSendButton) {

            aiSendButton.disabled =
                false;
        }

        if (aiChatInput) {

            aiChatInput.focus();
        }
    }
}


// =========================================================
// QUICK AI WEATHER ADVICE
// =========================================================

async function getAIWeatherAdvice() {

    if (!latestWeatherData) {

        if (aiWeatherText) {

            aiWeatherText.textContent =
                "Search for a city first, then I can give you weather advice.";
        }

        return;
    }


    if (aiWeatherButton) {

        aiWeatherButton.disabled =
            true;

        aiWeatherButton.textContent =
            "✦ Thinking...";
    }


    if (aiWeatherText) {

        aiWeatherText.textContent =
            "Analyzing the current weather...";
    }


    try {

        const response =
            await fetch(
                "/api/ai-weather",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            message:
                                "Give me a short practical weather summary. Tell me what the weather is like, what I should wear, whether I need an umbrella, and suggest one activity.",

                            city:
                                latestWeatherData
                                    .location
                                    .city,

                            current:
                                latestWeatherData
                                    .current,

                            daily:
                                latestWeatherData
                                    .daily
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "AI request failed."
            );
        }


        if (aiWeatherText) {

            aiWeatherText.textContent =
                result.response;
        }
    }


    catch (error) {

        console.error(
            "AI advice error:",
            error
        );

        if (aiWeatherText) {

            aiWeatherText.textContent =
                "Unable to generate weather advice right now.";
        }
    }


    finally {

        if (aiWeatherButton) {

            aiWeatherButton.disabled =
                false;

            aiWeatherButton.textContent =
                "✨ Get AI Advice";
        }
    }
}


// =========================================================
// EVENT LISTENERS
// =========================================================


// Search button
if (searchButton) {

    searchButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            getWeather();
        }
    );
}


// Search with Enter
if (cityInput) {

    cityInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                getWeather();
            }
        }
    );
}


// Current location
if (locationButton) {

    locationButton.addEventListener(
        "click",
        function () {

            getCurrentLocation();
        }
    );
}


// Return to current location
const returnLocationButton =
    document.getElementById(
        "returnLocationButton"
    );

if (returnLocationButton) {

    returnLocationButton.addEventListener(
        "click",
        function () {

            getCurrentLocation();
        }
    );
}


// Current Weather navigation
const currentWeatherNavLink =
    document.getElementById(
        "currentWeatherNavLink"
    );

if (currentWeatherNavLink) {

    currentWeatherNavLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (
                weatherSection &&
                !weatherSection.classList.contains(
                    "hidden"
                )
            ) {

                weatherSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

            else {

                getCurrentLocation();
            }
        }
    );
}


// Dark mode
if (themeButton) {

    themeButton.addEventListener(
        "click",
        toggleTheme
    );
}


// AI floating button
if (aiFloatingButton) {

    aiFloatingButton.addEventListener(
        "click",
        openAIChat
    );
}


// AI close button
if (aiCloseButton) {

    aiCloseButton.addEventListener(
        "click",
        closeAIChat
    );
}


// AI send button
if (aiSendButton) {

    aiSendButton.addEventListener(
        "click",
        sendAIMessage
    );
}


// AI Enter key
if (aiChatInput) {

    aiChatInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendAIMessage();
            }
        }
    );
}


// AI advice button
if (aiWeatherButton) {

    aiWeatherButton.addEventListener(
        "click",
        getAIWeatherAdvice
    );
}


// Current location card
const currentLocationCard =
    document.getElementById(
        "currentLocationCard"
    );

if (currentLocationCard) {

    currentLocationCard.addEventListener(
        "click",
        getCurrentLocation
    );
}


// ESC closes AI
document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            aiChatWindow
        ) {

            closeAIChat();
        }
    }
);


// =========================================================
// GLOBAL LEAFLET WEATHER MAP
// =========================================================

let globalLeafletMap = null;
let globalMapMarker = null;


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// EXTRACT LOCATION PARTS
// =========================================================

function extractLocationParts(address) {

    if (!address) {
        return [];
    }

    const country =
        address.country || "";

    const state =
        address.state ||
        address.region ||
        address.province ||
        address.state_district ||
        "";

    const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.city_district ||
        address.county ||
        "";

    const local =
        address.suburb ||
        address.neighbourhood ||
        address.neighborhood ||
        address.residential ||
        address.subdivision ||
        address.subdistrict ||
        address.quarter ||
        address.hamlet ||
        address.road ||
        "";

    const parts = [];

    [
        country,
        state,
        city,
        local
    ].forEach(
        part => {

            const value =
                String(part || "").trim();

            if (
                value &&
                !parts.some(
                    p =>
                        p.toLowerCase() ===
                        value.toLowerCase()
                )
            ) {

                parts.push(value);
            }
        }
    );

    return parts;
}


// =========================================================
// REVERSE GEOCODING
// =========================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    // -------------------------------------------------------
    // Nominatim
    // -------------------------------------------------------

    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                {
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (response.ok) {

            const data =
                await response.json();


            if (data?.address) {

                const parts =
                    extractLocationParts(
                        data.address
                    );

                if (parts.length) {

                    return parts.join(
                        ", "
                    );
                }
            }


            if (data?.display_name) {

                return data.display_name;
            }
        }
    }


    catch (error) {

        console.warn(
            "Nominatim reverse geocoding failed:",
            error
        );
    }


    // -------------------------------------------------------
    // BigDataCloud fallback
    // -------------------------------------------------------

    try {

        const response =
            await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );


        if (response.ok) {

            const data =
                await response.json();


            const parts =
                extractLocationParts({

                    country:
                        data.countryName,

                    state:
                        data.principalSubdivision,

                    city:
                        data.city,

                    suburb:
                        data.locality
                });


            if (parts.length) {

                return parts.join(
                    ", "
                );
            }
        }
    }


    catch (error) {

        console.warn(
            "Reverse geocoding fallback failed:",
            error
        );
    }


    return null;
}


// =========================================================
// REMOVE MAP MARKER
// =========================================================

function removeGlobalMapMarker() {

    if (
        globalMapMarker &&
        globalLeafletMap
    ) {

        globalLeafletMap.removeLayer(
            globalMapMarker
        );
    }

    globalMapMarker = null;
}


// =========================================================
// CREATE MAP MARKER
// =========================================================

function createGlobalMapMarker(
    latitude,
    longitude
) {

    removeGlobalMapMarker();

    globalMapMarker =
        L.marker([
            latitude,
            longitude
        ]).addTo(
            globalLeafletMap
        );

    return globalMapMarker;
}


// =========================================================
// MAP POPUP - LOADING
// =========================================================

function setGlobalMapPopupLoading(
    latitude,
    longitude,
    title = "Finding location..."
) {

    if (!globalMapMarker) {
        return;
    }

    globalMapMarker
        .bindPopup(`

            <div class="weather-popup">

                <strong>
                    📍 ${escapeHTML(title)}
                </strong>

                <div>
                    ${latitude.toFixed(4)}°,
                    ${longitude.toFixed(4)}°
                </div>

                <div>
                    🌡️ Getting weather...
                </div>

            </div>

        `)
        .openPopup();
}


// =========================================================
// MAP POPUP - ERROR
// =========================================================

function setGlobalMapPopupError(
    latitude,
    longitude,
    title,
    message
) {

    if (!globalMapMarker) {
        return;
    }

    globalMapMarker
        .bindPopup(`

            <div class="weather-popup">

                <strong>
                    📍 ${escapeHTML(title)}
                </strong>

                <div>
                    ${latitude.toFixed(4)}°,
                    ${longitude.toFixed(4)}°
                </div>

                <div>
                    ⚠️ ${escapeHTML(message)}
                </div>

            </div>

        `)
        .openPopup();
}


// =========================================================
// MAP POPUP - WEATHER
// =========================================================

function setGlobalMapPopupWeather(
    latitude,
    longitude,
    locationName,
    data
) {

    if (!globalMapMarker) {
        return;
    }

    const current =
        data?.current || {};


    const temperature =
        current.temperature_2m !== undefined &&
            current.temperature_2m !== null

            ? `${Math.round(
                current.temperature_2m
            )}°C`

            : "N/A";


    const humidity =
        current.relative_humidity_2m !== undefined &&
            current.relative_humidity_2m !== null

            ? `${Math.round(
                current.relative_humidity_2m
            )}%`

            : "N/A";


    const wind =
        current.wind_speed_10m !== undefined &&
            current.wind_speed_10m !== null

            ? `${Math.round(
                current.wind_speed_10m
            )} km/h`

            : "N/A";


    globalMapMarker
        .bindPopup(`

            <div class="weather-popup">

                <strong>
                    📍 ${escapeHTML(locationName)}
                </strong>

                <div>
                    ${latitude.toFixed(4)}°,
                    ${longitude.toFixed(4)}°
                </div>

                <div>
                    🌡️ Temperature:
                    <b>${temperature}</b>
                </div>

                <div>
                    🌤️ Condition:
                    <b>
                        ${escapeHTML(
            getWeatherDescription(
                current.weather_code
            )
        )}
                    </b>
                </div>

                <div>
                    💧 Humidity:
                    <b>${humidity}</b>
                </div>

                <div>
                    💨 Wind:
                    <b>${wind}</b>
                </div>

            </div>

        `)
        .openPopup();
}


// =========================================================
// LOAD WEATHER FOR MAP LOCATION
// =========================================================

async function loadMapWeather(
    latitude,
    longitude,
    locationName = null
) {

    try {

        const response =
            await fetch(
                `/api/weather/location?latitude=${latitude}&longitude=${longitude}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to get weather for this location."
            );
        }


        // ---------------------------------------------------
        // Reuse normal weather dashboard
        // ---------------------------------------------------

        if (
            typeof displayWeather === "function" &&
            weatherSection
        ) {

            displayWeather(data);
        }


        const resolvedName =
            locationName ||
            data.location?.formatted ||
            data.location?.city ||
            `Location (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;


        setGlobalMapPopupWeather(
            latitude,
            longitude,
            resolvedName,
            data
        );


        return data;
    }


    catch (error) {

        console.error(
            "Map weather error:",
            error
        );


        setGlobalMapPopupError(
            latitude,
            longitude,
            locationName ||
            "Selected Location",
            error.message ||
            "Weather information is unavailable."
        );


        return null;
    }
}


// =========================================================
// SEARCH LOCATION ON GLOBAL MAP
// =========================================================

async function searchGlobalMapLocation() {

    const searchInput =
        document.getElementById(
            "locationSearch"
        );

    const searchButton =
        document.getElementById(
            "searchLocationButton"
        );


    if (
        !globalLeafletMap ||
        !searchInput ||
        !searchButton
    ) {

        return;
    }


    const location =
        searchInput.value.trim();


    if (!location) {

        alert(
            "Please enter a city or location."
        );

        searchInput.focus();

        return;
    }


    searchButton.disabled =
        true;

    searchButton.textContent =
        "Searching...";


    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(location)}`,
                {
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Location search failed."
            );
        }


        const results =
            await response.json();


        if (!results.length) {

            alert(
                "Location not found. Please try another city."
            );

            return;
        }


        const place =
            results[0];


        const latitude =
            Number.parseFloat(
                place.lat
            );


        const longitude =
            Number.parseFloat(
                place.lon
            );


        const parts =
            extractLocationParts(
                place.address
            );


        const displayName =
            parts.length
                ? parts.join(", ")
                : place.display_name;


        globalLeafletMap.setView(
            [
                latitude,
                longitude
            ],
            10,
            {
                animate: true
            }
        );


        createGlobalMapMarker(
            latitude,
            longitude
        );


        setGlobalMapPopupLoading(
            latitude,
            longitude,
            displayName
        );


        await loadMapWeather(
            latitude,
            longitude,
            displayName
        );
    }


    catch (error) {

        console.error(
            "Map location search error:",
            error
        );

        alert(
            error.message ||
            "Unable to search for this location."
        );
    }


    finally {

        searchButton.disabled =
            false;

        searchButton.textContent =
            "🔍 Search";
    }
}


// =========================================================
// INITIALIZE GLOBAL WEATHER MAP
// =========================================================

function initializeGlobalWeatherMap() {

    const mapElement =
        document.getElementById(
            "globalWeatherMap"
        );

    // =========================================================
    // ZOOM TO CURRENT LOCATION
    // =========================================================

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                // Zoom map to current location
                globalLeafletMap.setView(
                    [
                        latitude,
                        longitude
                    ],
                    10,
                    {
                        animate: true
                    }
                );

                // Add marker
                createGlobalMapMarker(
                    latitude,
                    longitude
                );

                // Show loading popup
                setGlobalMapPopupLoading(
                    latitude,
                    longitude,
                    "Your Current Location"
                );

                // Load weather
                loadMapWeather(
                    latitude,
                    longitude,
                    "Your Current Location"
                );
            },

            function (error) {

                console.warn(
                    "Unable to get current location:",
                    error
                );

                // Keep default world view
                globalLeafletMap.setView(
                    [20, 0],
                    4
                );
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000
            }
        );
    }
    // -------------------------------------------------------
    // IMPORTANT:
    // This makes script.js safe for index.html,
    // forecast.html, etc.
    // -------------------------------------------------------

    if (!mapElement) {
        return;
    }


    // -------------------------------------------------------
    // Check Leaflet
    // -------------------------------------------------------

    if (typeof L === "undefined") {

        console.error(
            "Leaflet is not loaded. Load leaflet.js before script.js on map.html."
        );


        mapElement.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                    color:#b91c1c;
                    font-weight:600;
                "
            >
                Map library failed to load.
                Please refresh the page.
            </div>

        `;

        return;
    }


    // -------------------------------------------------------
    // Prevent duplicate initialization
    // -------------------------------------------------------

    if (globalLeafletMap) {

        setTimeout(
            () =>
                globalLeafletMap.invalidateSize(),
            0
        );

        return;
    }


    // -------------------------------------------------------
    // CREATE LEAFLET MAP
    // -------------------------------------------------------

    globalLeafletMap =
        L.map(
            mapElement,
            {

                center: [
                    20,
                    0
                ],

                zoom: 4,

                worldCopyJump:
                    true,

                zoomControl:
                    true
            }
        );


    // -------------------------------------------------------
    // OPENSTREETMAP TILES
    // -------------------------------------------------------

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        globalLeafletMap
    );


    // -------------------------------------------------------
    // MAP CLICK
    // -------------------------------------------------------

    globalLeafletMap.on(
        "click",
        async function (event) {

            const latitude =
                event.latlng.lat;

            const longitude =
                event.latlng.lng;


            createGlobalMapMarker(
                latitude,
                longitude
            );


            setGlobalMapPopupLoading(
                latitude,
                longitude
            );


            const locationName =
                await reverseGeocode(
                    latitude,
                    longitude
                );


            await loadMapWeather(
                latitude,
                longitude,
                locationName
            );
        }
    );


    // -------------------------------------------------------
    // MAP SEARCH FORM
    // -------------------------------------------------------

    const form =
        document.getElementById(
            "mapSearchForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                searchGlobalMapLocation();
            }
        );
    }


    // -------------------------------------------------------
    // FIX MAP SIZE AFTER PAGE LOAD
    // -------------------------------------------------------

    setTimeout(
        function () {

            if (globalLeafletMap) {

                globalLeafletMap.invalidateSize();
            }

        },
        100
    );


    // -------------------------------------------------------
    // FIX MAP SIZE ON WINDOW RESIZE
    // -------------------------------------------------------

    window.addEventListener(
        "resize",
        function () {

            if (globalLeafletMap) {

                globalLeafletMap.invalidateSize();
            }
        }
    );
}


// =========================================================
// INITIALIZE
// =========================================================

loadTheme();


// Only initialize map on map.html.
// index.html and forecast.html are unaffected.

if (
    document.getElementById(
        "globalWeatherMap"
    )
) {

    initializeGlobalWeatherMap();
}


console.log(
    "Weather Across World loaded successfully."
);
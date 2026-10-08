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
    document.getElementById("themeButton") ||
    document.getElementById("mapDesktopThemeToggle");

const mobileThemeToggles =
    [
        document.getElementById("mobileThemeToggle"),
        document.getElementById("mapThemeToggle")
    ].filter(Boolean);

const mainMenuButton =
    document.getElementById("mainMenuButton") ||
    document.getElementById("mapMenuButton");

const mainNavLinks =
    document.getElementById("mainNavLinks") ||
    document.getElementById("mapNavLinks");


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
        themeButton.textContent = isDark ? "☀️" : "🌙";
    }

    mobileThemeToggles.forEach(button => {
        button.textContent = isDark ? "☀️ Theme" : "🌙 Theme";
    });

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
            themeButton.textContent = "☀️";
        }
        mobileThemeToggles.forEach(button => {
            button.textContent = "☀️ Theme";
        });
    }

    else {

        document.body.classList.remove(
            "dark"
        );

        if (themeButton) {
            themeButton.textContent = "🌙";
        }
        mobileThemeToggles.forEach(button => {
            button.textContent = "🌙 Theme";
        });
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


// Mobile navigation
function setSiteMenu(open) {
    if (!mainMenuButton || !mainNavLinks) {
        return;
    }

    mainMenuButton.classList.toggle("is-open", open);
    mainNavLinks.classList.toggle("is-open", open);
    mainMenuButton.setAttribute("aria-expanded", String(open));
    mainMenuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
}

mobileThemeToggles.forEach(button => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        toggleTheme();
    });
});

if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
}

if (mainMenuButton) {
    mainMenuButton.addEventListener("click", () => {
        setSiteMenu(!mainMenuButton.classList.contains("is-open"));
    });
}

if (mainNavLinks) {
    mainNavLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setSiteMenu(false));
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && mainMenuButton?.classList.contains("is-open")) {
        setSiteMenu(false);
    }
});

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
// GOOGLE MAPS WEATHER MAP
// =========================================================

let globalGoogleMap = null;
let globalMapMarker = null;
let globalInfoWindow = null;
let globalGeocoder = null;


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
// GOOGLE MAPS API LOADER
// =========================================================

async function loadGoogleMapsApi() {

    if (window.google?.maps) {
        return window.google.maps;
    }

    const configResponse = await fetch("/api/config");

    if (!configResponse.ok) {
        throw new Error("Unable to load Google Maps configuration.");
    }

    const config = await configResponse.json();
    const apiKey = config.googleMapsApiKey;

    if (!apiKey) {
        throw new Error(
            "Google Maps API key is not configured. Add GOOGLE_MAPS_API_KEY to .env."
        );
    }

    if (window.__googleMapsApiPromise) {
        return window.__googleMapsApiPromise;
    }

    window.__googleMapsApiPromise = new Promise((resolve, reject) => {

        const existingScript =
            document.querySelector(
                'script[data-google-maps-loader="true"]'
            );

        if (existingScript) {
            existingScript.addEventListener(
                "load",
                () => resolve(window.google.maps)
            );
            existingScript.addEventListener(
                "error",
                () => reject(
                    new Error("Google Maps JavaScript API failed to load.")
                )
            );
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://maps.googleapis.com/maps/api/js" +
            `?key=${encodeURIComponent(apiKey)}&v=weekly`;

        script.async = true;
        script.defer = true;
        script.dataset.googleMapsLoader = "true";

        script.onload = () => {
            if (window.google?.maps) {
                resolve(window.google.maps);
            } else {
                reject(
                    new Error("Google Maps loaded without the Maps API.")
                );
            }
        };

        script.onerror = () => {
            reject(
                new Error(
                    "Google Maps could not be loaded. Check the API key, billing, API restrictions, and allowed website referrers."
                )
            );
        };

        document.head.appendChild(script);
    });

    return window.__googleMapsApiPromise;
}


// =========================================================
// GOOGLE MAP MARKER
// =========================================================

function removeGlobalMapMarker() {

    if (globalMapMarker) {
        globalMapMarker.setMap(null);
    }

    globalMapMarker = null;
}


function createGlobalMapMarker(
    latitude,
    longitude
) {

    removeGlobalMapMarker();

    globalMapMarker =
        new google.maps.Marker({
            position: {
                lat: latitude,
                lng: longitude
            },
            map: globalGoogleMap
        });

    return globalMapMarker;
}


// =========================================================
// GOOGLE MAP INFO WINDOW
// =========================================================

function openGlobalMapInfoWindow(content) {

    if (!globalInfoWindow) {
        globalInfoWindow =
            new google.maps.InfoWindow();
    }

    globalInfoWindow.setContent(content);

    if (globalMapMarker) {
        globalInfoWindow.open({
            map: globalGoogleMap,
            anchor: globalMapMarker
        });
    }
}


function setGlobalMapPopupLoading(
    latitude,
    longitude,
    title = "Finding location..."
) {

    openGlobalMapInfoWindow(`

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
    `);
}


function setGlobalMapPopupError(
    latitude,
    longitude,
    title,
    message
) {

    openGlobalMapInfoWindow(`

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
    `);
}


function setGlobalMapPopupWeather(
    latitude,
    longitude,
    locationName,
    data
) {

    const current =
        data?.current || {};

    const temperature =
        current.temperature_2m !== undefined &&
        current.temperature_2m !== null
            ? `${Math.round(current.temperature_2m)}°C`
            : "N/A";

    const humidity =
        current.relative_humidity_2m !== undefined &&
        current.relative_humidity_2m !== null
            ? `${Math.round(current.relative_humidity_2m)}%`
            : "N/A";

    const wind =
        current.wind_speed_10m !== undefined &&
        current.wind_speed_10m !== null
            ? `${Math.round(current.wind_speed_10m)} km/h`
            : "N/A";

    openGlobalMapInfoWindow(`

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
    `);
}


// =========================================================
// WEATHER FOR MAP LOCATION
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
            locationName || "Selected Location",
            error.message ||
            "Weather information is unavailable."
        );

        return null;
    }
}


// =========================================================
// GOOGLE GEOCODING HELPERS
// =========================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    if (!globalGeocoder) {
        globalGeocoder =
            new google.maps.Geocoder();
    }

    const response =
        await globalGeocoder.geocode({
            location: {
                lat: latitude,
                lng: longitude
            }
        });

    const result =
        response.results?.[0];

    return (
        result?.formatted_address ||
        null
    );
}


// =========================================================
// SEARCH LOCATION ON GOOGLE MAP
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
        !globalGoogleMap ||
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

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {

        // Use the app's Open-Meteo geocoder through /api/weather instead of
        // Google Maps Geocoder. This avoids Google Geocoding API referrer
        // restrictions (REQUEST_DENIED) while keeping the map itself on
        // Google Maps.
        const response =
            await fetch(
                `/api/weather?city=${encodeURIComponent(location)}`
            );

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(
                data.error ||
                data.message ||
                "Location not found. Please try another city."
            );
        }

        const locationData = data.location || {};
        const latitude = Number(locationData.latitude);
        const longitude = Number(locationData.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error(
                "Location coordinates are unavailable. Please try another city."
            );
        }

        const displayName = [
            locationData.city,
            locationData.state,
            locationData.country
        ]
            .filter(Boolean)
            .join(", ") || location;

        globalGoogleMap.setCenter({
            lat: latitude,
            lng: longitude
        });

        globalGoogleMap.setZoom(10);

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

        searchButton.disabled = false;
        searchButton.textContent = "🔍 Search";
    }
}


// =========================================================
// INITIALIZE GOOGLE MAP
// =========================================================

async function initializeGlobalWeatherMap() {

    const mapElement =
        document.getElementById(
            "globalWeatherMap"
        );

    if (!mapElement) {
        return;
    }

    try {

        await loadGoogleMapsApi();

        globalGeocoder =
            new google.maps.Geocoder();

        globalGoogleMap =
            new google.maps.Map(
                mapElement,
                {
                    center: {
                        lat: 20,
                        lng: 0
                    },
                    zoom: 2,
                    minZoom: 2,
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    gestureHandling: "greedy"
                }
            );

        globalGoogleMap.addListener(
            "click",
            async function (event) {

                const latitude =
                    event.latLng.lat();

                const longitude =
                    event.latLng.lng();

                createGlobalMapMarker(
                    latitude,
                    longitude
                );

                setGlobalMapPopupLoading(
                    latitude,
                    longitude
                );

                let locationName = null;

                try {
                    locationName =
                        await reverseGeocode(
                            latitude,
                            longitude
                        );
                }

                catch (error) {
                    console.warn(
                        "Google reverse geocoding failed:",
                        error
                    );
                }

                await loadMapWeather(
                    latitude,
                    longitude,
                    locationName
                );
            }
        );

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

        // Try to center on the user's location when permission is granted.
        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(

                async function (position) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    globalGoogleMap.setCenter({
                        lat: latitude,
                        lng: longitude
                    });

                    globalGoogleMap.setZoom(10);

                    createGlobalMapMarker(
                        latitude,
                        longitude
                    );

                    setGlobalMapPopupLoading(
                        latitude,
                        longitude,
                        "Your Current Location"
                    );

                    let locationName = null;

                    try {
                        locationName =
                            await reverseGeocode(
                                latitude,
                                longitude
                            );
                    }

                    catch (error) {
                        console.warn(
                            "Current-location reverse geocoding failed:",
                            error
                        );
                    }

                    await loadMapWeather(
                        latitude,
                        longitude,
                        locationName ||
                        "Your Current Location"
                    );
                },

                function (error) {

                    console.warn(
                        "Unable to get current location:",
                        error
                    );

                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000
                }
            );
        }

        window.addEventListener(
            "resize",
            function () {
                if (globalGoogleMap) {
                    google.maps.event.trigger(
                        globalGoogleMap,
                        "resize"
                    );
                }
            }
        );

    }

    catch (error) {

        console.error(
            "Google Maps initialization error:",
            error
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
                ${escapeHTML(
                    error.message ||
                    "Google Maps failed to load."
                )}
            </div>
        `;
    }
}


// =========================================================
// INITIALIZE
// =========================================================

loadTheme();

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


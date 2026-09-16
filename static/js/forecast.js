document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // DOM
    // =========================================================

    const countrySelect =
        document.getElementById("countrySelect");

    const stateSelect =
        document.getElementById("stateSelect");

    const citySelect =
        document.getElementById("citySelect");

    const forecastButton =
        document.getElementById("forecastButton");

    const selectorStatus =
        document.getElementById("selectorStatus");

    const forecastCards =
        document.getElementById("forecastCards");

    const forecastEmpty =
        document.getElementById("forecastEmpty");

    const forecastLocation =
        document.getElementById("forecastLocation");

    const forecastError =
        document.getElementById("forecastError");

    const forecastErrorMessage =
        document.getElementById("forecastErrorMessage");

    const tripSection =
        document.getElementById("tripSection");

    const tripSuggestions =
        document.getElementById("tripSuggestions");

    const tripSummary =
        document.getElementById("tripSummary");

    const tripScore =
        document.getElementById("tripScore");

    const tripScoreIcon =
        document.getElementById("tripScoreIcon");

    const placesSection =
        document.getElementById("placesSection");

    const placesGrid =
        document.getElementById("placesGrid");

    const placesLoading =
        document.getElementById("placesLoading");

    const placesEmpty =
        document.getElementById("placesEmpty");

    const travelTipsSection =
        document.getElementById("travelTipsSection");

    const packingTitle =
        document.getElementById("packingTitle");

    const packingAdvice =
        document.getElementById("packingAdvice");

    const themeToggle =
        document.getElementById("themeToggle");


    // =========================================================
    // STATE
    // =========================================================

    let selectedCountry = "";
    let selectedState = "";
    let selectedCity = "";

    let latestWeatherData = null;

    let destinationCoordinates = {
        latitude: null,
        longitude: null
    };


    // =========================================================
    // HELPERS
    // =========================================================

    function addOption(select, value, text) {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = text;

        select.appendChild(option);
    }


    function resetSelect(select, text) {

        select.innerHTML = "";

        addOption(
            select,
            "",
            text
        );

        select.disabled = true;
    }


    function setLoading(select, text) {

        select.innerHTML = "";

        addOption(
            select,
            "",
            text
        );

        select.disabled = true;
    }


    function setStatus(message) {

        if (selectorStatus) {
            selectorStatus.textContent =
                message || "";
        }
    }


    function showError(message) {

        if (!forecastError) {
            return;
        }

        forecastErrorMessage.textContent =
            message || "Something went wrong.";

        forecastError.classList.remove("hidden");
    }


    function hideError() {

        if (forecastError) {
            forecastError.classList.add("hidden");
        }
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatTemperature(value) {

        if (
            value === undefined ||
            value === null ||
            Number.isNaN(Number(value))
        ) {
            return "--";
        }

        return `${Math.round(Number(value))}°`;
    }


    function formatTime(value) {

        if (!value) {
            return "--";
        }

        const parts =
            String(value).split("T");

        if (parts.length < 2) {
            return value;
        }

        return parts[1].slice(0, 5);
    }


    function getDayName(dateString) {

        const date =
            new Date(`${dateString}T12:00:00`);

        return date.toLocaleDateString(
            undefined,
            {
                weekday: "long"
            }
        );
    }


    function formatDate(dateString) {

        const date =
            new Date(`${dateString}T12:00:00`);

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short"
            }
        );
    }


    // =========================================================
    // WEATHER DESCRIPTION
    // =========================================================

    function getWeatherDescription(code) {

        const descriptions = {

            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",

            45: "Fog",
            48: "Rime fog",

            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",

            56: "Freezing drizzle",
            57: "Heavy freezing drizzle",

            61: "Light rain",
            63: "Moderate rain",
            65: "Heavy rain",

            66: "Light freezing rain",
            67: "Heavy freezing rain",

            71: "Light snow",
            73: "Moderate snow",
            75: "Heavy snow",

            77: "Snow grains",

            80: "Light rain showers",
            81: "Moderate rain showers",
            82: "Heavy rain showers",

            85: "Snow showers",
            86: "Heavy snow showers",

            95: "Thunderstorm",
            96: "Thunderstorm with hail",
            99: "Heavy thunderstorm with hail"

        };

        return descriptions[code] ||
            "Variable weather";
    }


    // =========================================================
    // WEATHER ICON
    // =========================================================

    function getWeatherIcon(code) {

        if (code === 0) {
            return "☀️";
        }

        if (
            code === 1 ||
            code === 2
        ) {
            return "🌤️";
        }

        if (code === 3) {
            return "☁️";
        }

        if (
            code === 45 ||
            code === 48
        ) {
            return "🌫️";
        }

        if (
            code >= 51 &&
            code <= 57
        ) {
            return "🌦️";
        }

        if (
            code >= 61 &&
            code <= 67
        ) {
            return "🌧️";
        }

        if (
            code >= 71 &&
            code <= 77
        ) {
            return "🌨️";
        }

        if (
            code >= 80 &&
            code <= 82
        ) {
            return "🌧️";
        }

        if (
            code === 85 ||
            code === 86
        ) {
            return "🌨️";
        }

        if (code >= 95) {
            return "⛈️";
        }

        return "🌤️";
    }


    // =========================================================
    // LOAD COUNTRIES
    // =========================================================

    async function loadCountries() {

        try {

            setLoading(
                countrySelect,
                "Loading countries..."
            );

            const response =
                await fetch(
                    "/api/locations/countries"
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load countries."
                );
            }

            const data =
                await response.json();

            if (
                !Array.isArray(data.countries)
            ) {
                throw new Error(
                    "Invalid country data."
                );
            }

            countrySelect.innerHTML = "";

            addOption(
                countrySelect,
                "",
                "Select a country"
            );

            data.countries.forEach(country => {

                if (!country.name) {
                    return;
                }

                addOption(
                    countrySelect,
                    country.name,
                    country.name
                );

            });

            countrySelect.disabled = false;

            setStatus(
                `${data.countries.length} countries available`
            );

        }

        catch (error) {

            console.error(
                "Country loading error:",
                error
            );

            resetSelect(
                countrySelect,
                "Could not load countries"
            );

            setStatus(
                "Unable to load worldwide location data."
            );
        }
    }


    // =========================================================
    // COUNTRY CHANGE
    // =========================================================

    countrySelect.addEventListener(
        "change",
        async () => {

            selectedCountry =
                countrySelect.value;

            selectedState = "";
            selectedCity = "";

            forecastButton.disabled = true;

            resetSelect(
                stateSelect,
                "Loading states / regions..."
            );

            resetSelect(
                citySelect,
                "Select state / region first"
            );

            clearResults();

            if (!selectedCountry) {

                resetSelect(
                    stateSelect,
                    "Select country first"
                );

                return;
            }

            try {

                setStatus(
                    "Loading states / regions..."
                );

                const response =
                    await fetch(
                        `/api/locations/states?country=${encodeURIComponent(
                            selectedCountry
                        )}`
                    );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load states."
                    );
                }

                const data =
                    await response.json();

                if (
                    !Array.isArray(data.states)
                ) {
                    throw new Error(
                        "Invalid state data."
                    );
                }

                stateSelect.innerHTML = "";

                addOption(
                    stateSelect,
                    "",
                    data.states.length
                        ? "Select a state / region"
                        : "No states / regions"
                );

                data.states.forEach(state => {

                    if (!state.name) {
                        return;
                    }

                    addOption(
                        stateSelect,
                        state.name,
                        state.name
                    );

                });

                /*
                 * Some countries do not have states.
                 * In that situation, enable the city selector.
                 */

                if (data.states.length === 0) {

                    stateSelect.disabled = true;

                    citySelect.innerHTML = "";

                    addOption(
                        citySelect,
                        "",
                        "Select a city"
                    );

                    citySelect.disabled = false;

                    setStatus(
                        "Select a city to continue."
                    );

                    return;
                }

                stateSelect.disabled = false;

                setStatus(
                    `${data.states.length} states / regions available`
                );

            }

            catch (error) {

                console.error(
                    "State loading error:",
                    error
                );

                resetSelect(
                    stateSelect,
                    "Could not load states"
                );

                setStatus(
                    "Unable to load states / regions."
                );
            }
        }
    );


    // =========================================================
    // STATE CHANGE
    // =========================================================

    stateSelect.addEventListener(
        "change",
        async () => {

            selectedState =
                stateSelect.value;

            selectedCity = "";

            forecastButton.disabled = true;

            resetSelect(
                citySelect,
                "Loading cities..."
            );

            clearResults();

            /*
             * Countries without states use an enabled city
             * selector already, so an empty state should not
             * block the city loading logic.
             */

            if (
                !selectedState &&
                stateSelect.disabled
            ) {
                return;
            }

            if (!selectedState) {

                resetSelect(
                    citySelect,
                    "Select state / region first"
                );

                return;
            }

            try {

                setStatus(
                    "Loading cities..."
                );

                const url =
                    `/api/locations/cities?country=${encodeURIComponent(
                        selectedCountry
                    )}&state=${encodeURIComponent(
                        selectedState
                    )}`;

                const response =
                    await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "Unable to load cities."
                    );
                }

                const data =
                    await response.json();

                if (
                    !Array.isArray(data.cities)
                ) {
                    throw new Error(
                        "Invalid city data."
                    );
                }

                citySelect.innerHTML = "";

                addOption(
                    citySelect,
                    "",
                    data.cities.length
                        ? "Select a city"
                        : "No cities found"
                );

                data.cities.forEach(city => {

                    if (!city) {
                        return;
                    }

                    addOption(
                        citySelect,
                        city,
                        city
                    );

                });

                citySelect.disabled =
                    data.cities.length === 0;

                setStatus(
                    `${data.cities.length} cities available`
                );

            }

            catch (error) {

                console.error(
                    "City loading error:",
                    error
                );

                resetSelect(
                    citySelect,
                    "Could not load cities"
                );

                setStatus(
                    "Unable to load cities."
                );
            }
        }
    );


    // =========================================================
    // CITY CHANGE
    // =========================================================

    citySelect.addEventListener(
        "change",
        () => {

            selectedCity =
                citySelect.value;

            forecastButton.disabled =
                !selectedCity;

            clearResults();

            if (selectedCity) {

                const locationText =
                    [
                        selectedCity,
                        selectedState,
                        selectedCountry
                    ]
                        .filter(Boolean)
                        .join(", ");

                setStatus(
                    locationText
                );
            }
        }
    );


    // =========================================================
    // GET FORECAST
    // =========================================================

    forecastButton.addEventListener(
        "click",
        async () => {

            if (!selectedCity) {
                return;
            }

            hideError();

            forecastButton.disabled = true;

            forecastButton.textContent =
                "⏳ Loading forecast...";

            setStatus(
                "Getting weather and travel information..."
            );

            try {

                const locationQuery =
                    [
                        selectedCity,
                        selectedState,
                        selectedCountry
                    ]
                        .filter(Boolean)
                        .join(", ");

                const response =
                    await fetch(
                        `/api/weather?city=${encodeURIComponent(
                            locationQuery
                        )}`
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to load weather."
                    );
                }

                if (data.error) {

                    throw new Error(
                        data.message ||
                        "Unable to load weather."
                    );
                }

                /*
                 * IMPORTANT:
                 *
                 * Your Flask app returns:
                 *
                 * {
                 *   location: {...},
                 *   weather: {
                 *       current: {...},
                 *       daily: {...}
                 *   }
                 * }
                 *
                 * Older forecast.js expected current/daily
                 * directly on the response.
                 */

                const weather =
                    data.weather || data;

                latestWeatherData = {
                    location:
                        data.location || {},
                    current:
                        weather.current || {},
                    daily:
                        weather.daily || {}
                };

                destinationCoordinates = {
                    latitude:
                        Number(
                            data.location?.latitude
                        ),
                    longitude:
                        Number(
                            data.location?.longitude
                        )
                };

                renderForecast(
                    latestWeatherData
                );

                generateTripGuide(
                    latestWeatherData
                );

                generatePackingAdvice(
                    latestWeatherData
                );

                await loadFamousPlaces();

                setStatus(
                    "Forecast and trip guide loaded successfully."
                );

            }

            catch (error) {

                console.error(
                    "Forecast error:",
                    error
                );

                showError(
                    error.message ||
                    "Unable to load forecast."
                );

                clearResults();
            }

            finally {

                forecastButton.disabled =
                    !selectedCity;

                forecastButton.textContent =
                    "🌤️ Show Forecast & Trip Guide";
            }
        }
    );


    // =========================================================
    // RENDER FORECAST
    // =========================================================

    function renderForecast(data) {

        const daily =
            data.daily || {};

        if (
            !Array.isArray(daily.time) ||
            daily.time.length === 0
        ) {

            throw new Error(
                "7-day forecast data is unavailable."
            );
        }

        forecastEmpty.style.display =
            "none";

        forecastCards.innerHTML = "";

        const location =
            data.location || {};

        const city =
            location.name ||
            selectedCity;

        const state =
            location.admin1 ||
            selectedState;

        const country =
            location.country ||
            selectedCountry;

        forecastLocation.textContent =
            [
                city,
                state,
                country
            ]
                .filter(Boolean)
                .join(", ");

        const count =
            Math.min(
                7,
                daily.time.length
            );

        for (
            let index = 0;
            index < count;
            index++
        ) {

            const date =
                daily.time[index];

            const code =
                daily.weather_code?.[index];

            const maxTemp =
                daily.temperature_2m_max?.[index];

            const minTemp =
                daily.temperature_2m_min?.[index];

            const rain =
                daily.precipitation_probability_max?.[index];

            const sunrise =
                daily.sunrise?.[index];

            const sunset =
                daily.sunset?.[index];

            const card =
                document.createElement("article");

            card.className =
                "forecast-day-card";

            card.innerHTML = `

                <div class="forecast-day-name">
                    ${escapeHTML(
                getDayName(date)
            )}
                </div>

                <div class="forecast-date">
                    ${escapeHTML(
                formatDate(date)
            )}
                </div>

                <div class="forecast-icon">
                    ${getWeatherIcon(code)}
                </div>

                <div class="forecast-condition">
                    ${escapeHTML(
                getWeatherDescription(code)
            )}
                </div>

                <div class="forecast-temperature">

                    <span class="forecast-high">
                        ${formatTemperature(maxTemp)}
                    </span>

                    <span class="forecast-low">
                        ${formatTemperature(minTemp)}
                    </span>

                </div>

                <div class="forecast-rain">
                    💧 Rain: ${rain ?? 0}%
                </div>

                <div class="forecast-sun">

                    <div>
                        🌅 Sunrise:
                        ${formatTime(sunrise)}
                    </div>

                    <div>
                        🌇 Sunset:
                        ${formatTime(sunset)}
                    </div>

                </div>
            `;

            forecastCards.appendChild(card);
        }

        document
            .getElementById("forecastSection")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }


    // =========================================================
    // TRIP GUIDE
    // =========================================================

    function generateTripGuide(data) {

        const daily =
            data.daily || {};

        const dates =
            daily.time || [];

        const codes =
            daily.weather_code || [];

        const rain =
            daily.precipitation_probability_max || [];

        const maxTemps =
            daily.temperature_2m_max || [];

        if (!dates.length) {
            return;
        }

        /*
         * Calculate a simple trip score.
         */

        let score = 100;

        let rainyDays = 0;
        let stormDays = 0;
        let pleasantDays = 0;
        let hotDays = 0;
        let coldDays = 0;

        for (
            let i = 0;
            i < dates.length;
            i++
        ) {

            const code =
                Number(codes[i]);

            const rainChance =
                Number(rain[i] || 0);

            const temp =
                Number(maxTemps[i]);

            if (
                code >= 95
            ) {
                stormDays++;
                score -= 12;
            }

            if (
                rainChance >= 60
            ) {
                rainyDays++;
                score -= 5;
            }

            if (
                temp >= 20 &&
                temp <= 30 &&
                rainChance < 40 &&
                code < 80
            ) {
                pleasantDays++;
            }

            if (temp >= 34) {
                hotDays++;
                score -= 2;
            }

            if (temp <= 8) {
                coldDays++;
                score -= 2;
            }
        }

        score =
            Math.max(
                35,
                Math.min(
                    100,
                    score
                )
            );

        tripScore.textContent =
            `${score}/100`;

        if (score >= 85) {

            tripScoreIcon.textContent =
                "🟢";

            tripSummary.textContent =
                "Excellent conditions for exploring this destination.";

        } else if (score >= 70) {

            tripScoreIcon.textContent =
                "🟢";

            tripSummary.textContent =
                "Good conditions overall. A few weather-aware plans will make your trip better.";

        } else if (score >= 55) {

            tripScoreIcon.textContent =
                "🟡";

            tripSummary.textContent =
                "Mixed conditions. Keep your itinerary flexible.";

        } else {

            tripScoreIcon.textContent =
                "🔴";

            tripSummary.textContent =
                "Challenging weather is expected. Indoor activities and flexible plans are recommended.";
        }


        const suggestions = [];

        if (pleasantDays > 0) {

            suggestions.push({
                icon: "🌤️",
                title: "Best for sightseeing",
                text:
                    `${pleasantDays} day(s) look particularly comfortable for walking tours, landmarks, parks and outdoor attractions.`
            });
        }

        if (rainyDays > 0) {

            suggestions.push({
                icon: "☔",
                title: "Keep a rain plan",
                text:
                    `${rainyDays} day(s) have a higher chance of rain. Keep museums, galleries, cafés and indoor attractions as backup options.`
            });
        }

        if (stormDays > 0) {

            suggestions.push({
                icon: "⛈️",
                title: "Watch the weather",
                text:
                    `Thunderstorms may occur. Avoid exposed viewpoints, beaches and long outdoor activities during storm periods.`
            });
        }

        if (hotDays > 0) {

            suggestions.push({
                icon: "🥤",
                title: "Hot-weather planning",
                text:
                    `Some days may be hot. Schedule outdoor sightseeing in the morning or evening and carry water, sunscreen and light clothing.`
            });
        }

        if (coldDays > 0) {

            suggestions.push({
                icon: "🧥",
                title: "Cold-weather planning",
                text:
                    `Some days may be cold. Pack warm layers and consider indoor attractions during the coldest periods.`
            });
        }

        suggestions.push({
            icon: "🗺️",
            title: "Explore famous places",
            text:
                `Check the famous places section below for attractions around ${selectedCity}.`
        });

        tripSuggestions.innerHTML = "";

        suggestions
            .slice(0, 6)
            .forEach(item => {

                const card =
                    document.createElement("div");

                card.className =
                    "trip-card";

                card.innerHTML = `

                    <div class="trip-card-icon">
                        ${item.icon}
                    </div>

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.text)}
                    </p>

                `;

                tripSuggestions.appendChild(card);
            });

        tripSection.classList.remove("hidden");
    }


    // =========================================================
    // PACKING ADVICE
    // =========================================================

    function generatePackingAdvice(data) {

        const daily =
            data.daily || {};

        const codes =
            daily.weather_code || [];

        const rain =
            daily.precipitation_probability_max || [];

        const maxTemps =
            daily.temperature_2m_max || [];

        const minTemps =
            daily.temperature_2m_min || [];

        if (!codes.length) {
            return;
        }

        const highestTemp =
            Math.max(
                ...maxTemps.map(Number)
            );

        const lowestTemp =
            Math.min(
                ...minTemps.map(Number)
            );

        const highestRain =
            Math.max(
                ...rain.map(Number)
            );

        const hasStorm =
            codes.some(
                code => Number(code) >= 95
            );

        const hasSnow =
            codes.some(
                code =>
                    Number(code) >= 71 &&
                    Number(code) <= 86
            );

        const items = [];

        if (highestRain >= 50) {
            items.push(
                "umbrella or light rain jacket"
            );
        }

        if (highestTemp >= 30) {
            items.push(
                "light breathable clothing"
            );
            items.push(
                "sunscreen and sunglasses"
            );
        }

        if (lowestTemp <= 12) {
            items.push(
                "a warm jacket or layers"
            );
        }

        if (hasSnow) {
            items.push(
                "warm waterproof footwear"
            );
        }

        if (hasStorm) {
            items.push(
                "flexible indoor activity options"
            );
        }

        items.push(
            "comfortable walking shoes"
        );

        packingTitle.textContent =
            `What to pack for ${selectedCity}`;

        packingAdvice.textContent =
            `Recommended: ${items.join(", ")}. ` +
            `Forecast range is approximately ` +
            `${Math.round(lowestTemp)}°C to ` +
            `${Math.round(highestTemp)}°C.`;

        travelTipsSection.classList.remove(
            "hidden"
        );
    }


    // =========================================================
    // FAMOUS PLACES
    // =========================================================

    async function loadFamousPlaces() {

        placesSection.classList.remove(
            "hidden"
        );

        placesGrid.innerHTML = "";

        placesEmpty.classList.add(
            "hidden"
        );

        placesLoading.classList.remove(
            "hidden"
        );

        const latitude =
            destinationCoordinates.latitude;

        const longitude =
            destinationCoordinates.longitude;

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            placesLoading.classList.add(
                "hidden"
            );

            placesEmpty.classList.remove(
                "hidden"
            );

            return;
        }

        try {

            /*
             * OpenStreetMap Overpass API
             *
             * We search for:
             * - tourism attractions
             * - museums
             * - historic sites
             * - viewpoints
             * - monuments
             * - castles
             * - zoos
             * - theme parks
             */

            const radius =
                25000;

            const query = `
                [out:json][timeout:25];

                (
                    nwr["tourism"="attraction"]
                        (around:${radius},${latitude},${longitude});

                    nwr["tourism"="museum"]
                        (around:${radius},${latitude},${longitude});

                    nwr["tourism"="viewpoint"]
                        (around:${radius},${latitude},${longitude});

                    nwr["historic"]
                        (around:${radius},${latitude},${longitude});

                    nwr["historic"="monument"]
                        (around:${radius},${latitude},${longitude});

                    nwr["historic"="castle"]
                        (around:${radius},${latitude},${longitude});

                    nwr["tourism"="zoo"]
                        (around:${radius},${latitude},${longitude});

                    nwr["tourism"="theme_park"]
                        (around:${radius},${latitude},${longitude});
                );

                out center tags;
            `;

            const endpoints = [
                "https://overpass-api.de/api/interpreter",
                "https://overpass.kumi.systems/api/interpreter"
            ];

            let data = null;

            for (
                const endpoint of endpoints
            ) {

                try {

                    const response =
                        await fetch(
                            endpoint,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/x-www-form-urlencoded"
                                },

                                body:
                                    "data=" +
                                    encodeURIComponent(query)
                            }
                        );

                    if (!response.ok) {
                        continue;
                    }

                    data =
                        await response.json();

                    break;

                }

                catch (endpointError) {

                    console.warn(
                        "Overpass endpoint failed:",
                        endpointError
                    );
                }
            }

            if (
                !data ||
                !Array.isArray(data.elements)
            ) {

                throw new Error(
                    "No attraction data returned."
                );
            }

            const places =
                processPlaces(
                    data.elements,
                    latitude,
                    longitude
                );

            placesLoading.classList.add(
                "hidden"
            );

            if (!places.length) {

                placesEmpty.classList.remove(
                    "hidden"
                );

                return;
            }

            renderPlaces(places);

        }

        catch (error) {

            console.error(
                "Places loading error:",
                error
            );

            placesLoading.classList.add(
                "hidden"
            );

            placesEmpty.classList.remove(
                "hidden"
            );
        }
    }


    // =========================================================
    // PROCESS PLACES
    // =========================================================

    function processPlaces(
        elements,
        latitude,
        longitude
    ) {

        const unique =
            new Map();

        elements.forEach(element => {

            const tags =
                element.tags || {};

            const name =
                tags.name ||
                tags["name:en"];

            if (!name) {
                return;
            }

            let lat =
                element.lat;

            let lon =
                element.lon;

            if (
                lat === undefined &&
                element.center
            ) {
                lat =
                    element.center.lat;

                lon =
                    element.center.lon;
            }

            if (
                lat === undefined ||
                lon === undefined
            ) {
                return;
            }

            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    Number(lat),
                    Number(lon)
                );

            /*
             * Ignore extremely distant results.
             */

            if (distance > 25) {
                return;
            }

            const type =
                getPlaceType(tags);

            const key =
                name.toLowerCase();

            if (
                !unique.has(key) ||
                distance <
                unique.get(key).distance
            ) {

                unique.set(
                    key,
                    {
                        name,
                        type,
                        distance,
                        latitude: Number(lat),
                        longitude: Number(lon)
                    }
                );
            }

        });

        return Array
            .from(unique.values())
            .sort(
                (a, b) =>
                    a.distance -
                    b.distance
            )
            .slice(0, 12);
    }


    // =========================================================
    // PLACE TYPE
    // =========================================================

    function getPlaceType(tags) {

        if (
            tags.tourism === "museum"
        ) {
            return "Museum";
        }

        if (
            tags.tourism === "viewpoint"
        ) {
            return "Viewpoint";
        }

        if (
            tags.tourism === "zoo"
        ) {
            return "Zoo";
        }

        if (
            tags.tourism === "theme_park"
        ) {
            return "Theme Park";
        }

        if (
            tags.historic === "monument"
        ) {
            return "Monument";
        }

        if (
            tags.historic === "castle"
        ) {
            return "Castle";
        }

        if (tags.historic) {
            return "Historic Site";
        }

        if (
            tags.tourism === "attraction"
        ) {
            return "Tourist Attraction";
        }

        return "Interesting Place";
    }


    // =========================================================
    // RENDER PLACES
    // =========================================================

    function renderPlaces(places) {

        placesGrid.innerHTML = "";

        places.forEach(
            (place, index) => {

                const card =
                    document.createElement("article");

                card.className =
                    "place-card";

                const mapsURL =
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${place.latitude},${place.longitude}`
                    )}`;

                card.innerHTML = `

                    <div class="place-number">
                        ${index + 1}
                    </div>

                    <span class="place-type">
                        ${escapeHTML(place.type)}
                    </span>

                    <h3>
                        ${escapeHTML(place.name)}
                    </h3>

                    <p>
                        Popular or interesting place
                        around ${escapeHTML(selectedCity)}.
                    </p>

                    <div class="place-distance">
                        📍 ${place.distance.toFixed(1)} km from
                        ${escapeHTML(selectedCity)}
                    </div>

                    <a
                        class="place-map-link"
                        href="${mapsURL}"
                        target="_blank"
                        rel="noopener noreferrer">

                        Open in Google Maps →
                    </a>
                `;

                placesGrid.appendChild(card);
            }
        );
    }


    // =========================================================
    // DISTANCE
    // =========================================================

    function calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const earthRadius =
            6371;

        const dLat =
            toRadians(lat2 - lat1);

        const dLon =
            toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(
                toRadians(lat1)
            ) *
            Math.cos(
                toRadians(lat2)
            ) *
            Math.sin(dLon / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    }


    function toRadians(value) {
        return value * Math.PI / 180;
    }


    // =========================================================
    // CLEAR RESULTS
    // =========================================================

    function clearResults() {

        forecastCards.innerHTML = "";

        forecastEmpty.style.display =
            "block";

        forecastLocation.textContent =
            "";

        tripSection.classList.add(
            "hidden"
        );

        placesSection.classList.add(
            "hidden"
        );

        travelTipsSection.classList.add(
            "hidden"
        );

        placesGrid.innerHTML = "";

        hideError();

        latestWeatherData = null;
    }


    // =========================================================
    // THEME
    // =========================================================

    function loadTheme() {

        const theme =
            localStorage.getItem(
                "theme"
            );

        if (theme === "light") {

            document.body.classList.remove(
                "dark"
            );

            themeToggle.textContent =
                "🌙";

        } else {

            document.body.classList.add(
                "dark"
            );

            themeToggle.textContent =
                "☀️";
        }
    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "dark"
                );

                const isDark =
                    document.body.classList.contains(
                        "dark"
                    );

                localStorage.setItem(
                    "theme",
                    isDark
                        ? "dark"
                        : "light"
                );

                themeToggle.textContent =
                    isDark
                        ? "☀️"
                        : "🌙";
            }
        );
    }


    // =========================================================
    // INITIALIZE
    // =========================================================

    loadTheme();

    loadCountries();

});
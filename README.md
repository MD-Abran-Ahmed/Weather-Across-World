# 🌍 Weather Across World

A full-stack weather and travel planning web application that lets users explore weather conditions across the world, view forecasts, plan trips, and interact with an AI-powered weather assistant.

## 🚀 Live Demo

**[Weather Across World](https://weather-across-world.vercel.app/)**

## ✨ Features

* 🌦️ **Current Weather** — Get current weather conditions for locations around the world.
* 📅 **7-Day Forecast** — View upcoming weather conditions for travel and trip planning.
* ✈️ **Trip Planner** — Check forecast conditions before planning a trip.
* 🗺️ **Interactive Weather Map** — Explore locations and weather information using Google Maps.
* 📍 **Location Search** — Search for countries, states, and cities.
* 🤖 **AI Weather Assistant** — Get weather-related information and recommendations through an AI assistant powered by Gemini.
* 🌡️ **Weather Data** — Weather information is provided using the Open-Meteo API.
* 🌓 **Dark / Light Mode** — Switch between themes for a comfortable viewing experience.
* 📱 **Responsive Design** — Designed to work across desktop, tablet, and mobile devices.

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Google Maps JavaScript API

### Backend

* Python
* Flask

### APIs & Services

* Open-Meteo API — Weather data and forecasts
* Google Maps API — Maps and location services
* Google Places API — Location search
* Gemini API — AI weather assistant

### Deployment

* Vercel
* GitHub

## 📂 Project Structure

```text
Weather-Across-World/
│
├── app.py
├── requirements.txt
├── README.md
├── .env.example
├── .gitignore
│
├── static/
│   ├── css/
│   └── js/
│
└── templates/
    ├── index.html
    ├── map.html
    └── forecast.html
```

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/MD-Abran-Ahmed/Weather-Across-World.git
cd Weather-Across-World
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

**Windows:**

```bash
.venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file based on `.env.example`.

Add your own API keys:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_MODELS=gemini_models
```

**Never upload your `.env` file or API keys to GitHub.**

### 6. Run the application

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## 🔐 Environment Variables

The application uses environment variables for API credentials.

| Variable              | Purpose                           |
| --------------------- | --------------------------------- |
| `GEMINI_API_KEY`      | Gemini AI weather assistant       |
| `GOOGLE_MAPS_API_KEY` | Google Maps and location services |

Keep your real API keys private.

## 🌐 Deployment

The application can be deployed using Vercel or another compatible Python hosting platform.

For deployment, configure the required API keys as **environment variables** in the hosting platform rather than committing them to GitHub.

## 📌 Future Improvements

* More advanced weather analytics
* Additional weather visualizations
* Improved travel recommendations
* Saved favorite locations
* More detailed weather alerts
* Additional international location features

## 👨‍💻 Author

**Abran Ahmed**

GitHub: [MD-Abran-Ahmed](https://github.com/MD-Abran-Ahmed)

## 📄 License

This project is licensed under the **MIT License**.

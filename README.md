# Weather Across World 🌍

Weather Across World is a simple web application that helps you check weather information for places around the world.

##### https://weather-across-world-ten.vercel.app/

You can search for a location and see its current weather conditions, temperature, humidity, wind, and other useful weather details. The project also includes an AI Weather Assistant that can help explain the weather and answer questions about it in a more natural way.

The application uses a Flask backend and a web-based frontend, with Google Maps for location/map features and Google Gemini for the AI weather assistant.

## Features

* Search for weather by location
* View current weather information
* Interactive map and location features
* AI Weather Assistant powered by Google Gemini
* Simple and responsive web interface
* Weather information for locations around the world

## Technologies Used

* Python
* Flask
* HTML
* CSS
* JavaScript
* Google Maps
* Google Gemini API
* Weather API

## Project Structure

```text
Weather Across World/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── static/
├── templates/
└── README.md
```

## Running the Project

First, install the required Python packages:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project folder and add your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Then start the application:

```bash
python app.py
```

Open the local address shown by Flask in your browser.

## API Keys

This project uses API keys for services such as Google Gemini and Google Maps.

The `.env.example` file contains placeholders to show which environment variables are required. Your real API keys should only be stored in your local `.env` file or in the environment variables of your hosting service.

## About the Project

Weather Across World was created as a practical web project combining weather data, maps, and AI into one application. The goal is to make checking and understanding weather information simple and easy to use.

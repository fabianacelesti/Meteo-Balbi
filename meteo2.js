// =========================
// ELEMENTI DOM
// =========================
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

const card = document.querySelector(".card");
const weatherSection = document.querySelector(".weather");
const cityElement = document.querySelector(".weather-city");
const tempElement = document.querySelector(".weather-temp");
const descElement = document.querySelector(".weather-desc");
const iconElement = document.querySelector(".weather-icon img");

const loadingElement = document.querySelector(".loading");
const errorElement = document.querySelector(".error");

const humidityElement = document.querySelector(".weather-humidity");
const windElement = document.querySelector(".weather-wind");
const feelsElement = document.querySelector(".weather-feels");

const forecastSection = document.querySelector(".forecast");
const forecastCardsContainer = document.querySelector(".forecast-cards");

// =========================
// CONFIG API
// =========================
const API_KEY = "60d1be78a985ca40d2a2645d670cb44e"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// =========================
// FUNZIONE FETCH METEO OGGI
// =========================
async function fetchWeather(city) {
  // reset stati
  weatherSection.classList.add("hidden");
  forecastSection.classList.add("hidden");
  errorElement.classList.add("hidden");
  loadingElement.classList.remove("hidden");

  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("Città non trovata");

    const data = await response.json();

    // aggiorna UI meteo attuale
    cityElement.textContent = data.name;
    tempElement.textContent = `${Math.round(data.main.temp)}°`;
    descElement.textContent = capitalize(data.weather[0].description);
    searchInput.value = "";
    searchInput.focus();

    // dettagli meteo
    humidityElement.textContent = data.main.humidity + "%";
    windElement.textContent = Math.round(data.wind.speed * 3.6) + " km/h";
    feelsElement.textContent = Math.round(data.main.feels_like) + "°";

    // icona e sfondo dinamico
    const weatherMain = data.weather[0].main.toLowerCase();
    const iconPath = getIcon(weatherMain);
    const cardClass = getCardClass(weatherMain);

    iconElement.src = iconPath;

    card.classList.remove("sunny", "cloudy", "rainy", "snowy");
    card.classList.add(cardClass);

    weatherSection.classList.remove("hidden");

    // FETCH PREVISIONI 3 GIORNI
    fetchForecast(city);

  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.remove("hidden");
  } finally {
    loadingElement.classList.add("hidden");
  }
}

// =========================
// FUNZIONE FETCH FORECAST 3 GIORNI
// =========================
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `${FORECAST_URL}?q=${city}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("Previsioni non disponibili");

    const data = await response.json();

    // pulisco container
    forecastCardsContainer.innerHTML = "";

    // raggruppa tutti i dati per giorno
    const dailyTemps = {};

    data.list.forEach(item => {
      const date = new Date(item.dt_txt);
      const day = date.toLocaleDateString("it-IT", { weekday: "short" });

      if (!dailyTemps[day]) {
        dailyTemps[day] = { 
          min: item.main.temp, 
          max: item.main.temp, 
          icon: item.weather[0].main.toLowerCase() 
        };
      } else {
        dailyTemps[day].min = Math.min(dailyTemps[day].min, item.main.temp);
        dailyTemps[day].max = Math.max(dailyTemps[day].max, item.main.temp);
      }
    });

    // crea le card dei 3 giorni successivi
    Object.entries(dailyTemps).slice(0, 3).forEach(([dayName, temps]) => {
      const icon = getIcon(temps.icon);
      const tempMin = Math.round(temps.min) + "°";
      const tempMax = Math.round(temps.max) + "°";

      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <p>${dayName}</p>
        <img src="${icon}" alt="Icona meteo">
        <p class="temp-range">${tempMin} / ${tempMax}</p>
      `;
      forecastCardsContainer.appendChild(card);
    });

    forecastSection.classList.remove("hidden");

  } catch (err) {
    console.error(err);
  }
}

// =========================
// FUNZIONI HELPER
// =========================
function capitalize(str) {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIcon(weatherMain) {
  if (weatherMain.includes("clear")) return "sun.svg";
  if (weatherMain.includes("cloud")) return "cloud.svg";
  if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) return "rain.svg";
  if (weatherMain.includes("snow")) return "snow.svg";
  return "mist.svg";
}

function getCardClass(weatherMain) {
  if (weatherMain.includes("clear")) return "sunny";
  if (weatherMain.includes("cloud")) return "cloudy";
  if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) return "rainy";
  if (weatherMain.includes("snow")) return "snowy";
  return "cloudy";
}

// =========================
// EVENTI
// =========================
searchButton.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (!city) {
    errorElement.textContent = "Inserisci una città";
    errorElement.classList.remove("hidden");
    return;
  }
  fetchWeather(city);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchButton.click();
});

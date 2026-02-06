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

// =========================
// CONFIG API
// =========================
const API_KEY = "60d1be78a985ca40d2a2645d670cb44e"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// =========================
// FUNZIONE FETCH METEO
// =========================
async function fetchWeather(city) {
  // reset stati
  errorElement.classList.add("hidden");
  weatherSection.classList.add("hidden");
  loadingElement.classList.remove("hidden");

  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&units=metric&lang=it&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("Città non trovata");

    const data = await response.json();

    // aggiorna UI
    cityElement.textContent = data.name;
    tempElement.textContent = `${Math.round(data.main.temp)}°`;
    descElement.textContent = capitalize(data.weather[0].description);

    // =========================
    // ICONA E SFONDO DINAMICO
    // =========================
    const weatherMain = data.weather[0].main.toLowerCase(); // es. "Clear", "Clouds", "Rain"
    let iconPath = "";
    let cardClass = "";

    if (weatherMain.includes("clear")) {
  iconPath = "sun.svg";
  cardClass = "sunny";
} else if (weatherMain.includes("cloud")) {
  iconPath = "cloud.svg";
  cardClass = "cloudy";
} else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
  iconPath = "rain.svg";
  cardClass = "rainy";
} else if (weatherMain.includes("snow")) {
  iconPath = "snow.svg";
  cardClass = "snowy";
} else {
  iconPath = "mist.svg";
  cardClass = "cloudy";
}

    // aggiorna icona
    iconElement.src = iconPath;

    // rimuove tutte le classi sfondo e aggiunge quella giusta
    card.classList.remove("sunny", "cloudy", "rainy", "snowy");
    card.classList.add(cardClass);

    weatherSection.classList.remove("hidden");

  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.remove("hidden");
  } finally {
    loadingElement.classList.add("hidden");
  }
}

// =========================
// UTILITIES
// =========================
function capitalize(str) {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

// invio con tasto ENTER
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") searchButton.click();
});

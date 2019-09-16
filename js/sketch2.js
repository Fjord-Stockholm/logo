var elementsWrapper = document.getElementById("elementsWrapper");
var componentWrapper = document.getElementById("contentWrapper");
var now = new Date();
var sunPosition;

const map = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

// Define elements

var clouds;
var humidity;
var pressure;
var temperature;
var tempMax;
var tempMin;
var visibility;
var windDeg;
var windSpeed;
var lightHours;
var sunColor;
var cloudCoverage;
var currentWeather;

// Define colors

var blue = "#0075DC";
var darkBlue = "#004DD1";
var pink = "#E9AF95";
var darkPink = "#F1579F";
var green = "#9BEBD2";
var darkGreen = "#00B4AB";
var grey = "#E7E6EE";
var darkGrey = "#A2B1C1";

var stockholmLat = 59.32512;
var stockholmLong = 18.07109;

let cityID = "2673730";
let apiKey = "ec6b462b9e2f481b5c7f4d112b811de1";
let units = "&units=metric";
let cors = "https://cors-anywhere.herokuapp.com/";
let apiCall =
  cors +
  "http://api.openweathermap.org/data/2.5/weather?id=" +
  cityID +
  "&APPID=" +
  apiKey +
  units;

let testCall =
  cors +
  "https://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=b6907d289e10d714a6e88b30761fae22";

// Call the weather API

function getWeather() {
  fetch(apiCall, {
    mode: "cors",
    header: {
      "Access-Control-Allow-Origin": "*"
    }
  })
    .then(function(response) {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status Code: " + response.status
        );
        return;
      }

      response.json().then(function(data) {
        currentWeather = data;
        console.log("Made with love in Stockholm 🏰🇪🇺");
        console.log(currentWeather);

        clouds = map(currentWeather.clouds.all, 0, 100, 0, 90);
        cloudCoverage = map(currentWeather.clouds.all, 0, 100, 0, 1);
        humidity = map(currentWeather.main.humidity, 0, 100, 0, 50);
        pressure = map(currentWeather.main.pressure, 800, 1100, 10, 0);
        temperature = map(currentWeather.main.temp, -30, 55, 0, 40);
        tempMax = map(currentWeather.main.temp_max, -30, 55, 0, 4);
        tempMin = map(currentWeather.main.temp_min, -30, 55, 0, 4);
        visibility = map(currentWeather.visibility, 0, 10000, 1, 0);
        windDeg = map(currentWeather.wind.deg, 0, 360, 0, 360);
        windSpeed = map(currentWeather.wind.speed, 0, 14, 0.8, 5);

        drawWeather();
      });
    })
    .catch(function(err) {
      console.log("Fetch Error :-S", err);
    });
}

function drawWeather() {
  elementsWrapper.innerHTML = "";

  var cloudElem = document.createElement("div");
  var humidityElem = document.createElement("div");
  var temperatureElem = document.createElement("div");
  var sun = document.createElement("div");

  // Clouds

  cloudColor = chroma.scale([grey, darkGrey]);

  cloudElem.style.height = clouds + "%";
  cloudElem.style.width = clouds + "%";
  cloudElem.style.backgroundColor = cloudColor(clouds * 2 * 0.01).hex();
  cloudElem.id = "clouds";

  // Humidity

  humidityColor = chroma.scale([blue, darkBlue]);

  humidityElem.style.height = humidity + "%";
  humidityElem.style.width = humidity + "%";
  humidityElem.style.backgroundColor = humidityColor(humidity * 2 * 0.01).hex();
  humidityElem.id = "humidity";

  // Temperature

  tempColor = chroma.scale([blue, darkPink]);

  temperatureElem.style.height = temperature + "%";
  temperatureElem.style.width = temperature + "%";
  temperatureElem.style.backgroundColor = tempColor(pressure * 2 * 0.01).hex();
  temperatureElem.id = "temperature";
  temperatureElem.style.border = tempMax + "px solid #D2129E";
  temperatureElem.style.outline = tempMin + "px solid #389AD9";

  // Sun

  sun.style.backgroundColor = sunColor(lightHours * 2 * 0.01).hex();
  sun.style.height = lightHours + "%";
  sun.style.width = lightHours + "%";
  sun.id = "sun";

  // Pressure

  document.documentElement.style.setProperty(
    "--elementspressure",
    pressure + "%"
  );

  elementsWrapper.style.transform = "rotate(" + windDeg + "deg )";

  elementsWrapper.appendChild(humidityElem);
  elementsWrapper.appendChild(temperatureElem);
  elementsWrapper.appendChild(sun);
  elementsWrapper.appendChild(cloudElem);

  animateElements(windSpeed);
}

function animateElements(windSpeed) {
  var weatherElements = elementsWrapper.children;

  anime({
    targets: weatherElements,
    scale: [
      { value: windSpeed, easing: "easeOutQuad" },
      { value: 1, easing: "easeOutQuad" }
    ],
    duration: 10000 * windSpeed,
    loop: true,
    delay: anime.stagger(500)
  });
}

function download() {
  domtoimage
    .toJpeg(document.getElementById("container"), { quality: 1.0 })
    .then(function(dataUrl) {
      var link = document.createElement("a");
      link.download = "logo-" + now.getDate() + "-" + now.getMonth() + ".jpeg";
      link.href = dataUrl;
      link.click();
    });
}

function getSun() {
  var times = SunCalc.getTimes(new Date(), stockholmLat, stockholmLong);
  var container = document.getElementById("container");

  lightHours = map(
    times.sunset.getHours() - times.sunrise.getHours(),
    6,
    19,
    0,
    60
  );

  if (
    now.getTime() < times.sunset.getTime() &&
    now.getTime() > times.sunrise.getTime()
  ) {
    document.body.style.backgroundColor = "white";
    container.style.backgroundColor = "white";
    sunColor = chroma.scale([pink, darkPink]);

    document.documentElement.style.setProperty("--textColor", "black");
  } else {
    document.body.style.backgroundColor = "black";
    container.style.backgroundColor = "black";
    sunColor = chroma.scale(["#000", "#fff"]);

    document.documentElement.style.setProperty("--textColor", "white");
  }
}

// Function to navigate through date

function fullScreen() {
  var footer = document.getElementsByClassName("footer")[0];

  footer.style.display = "none";

  document.body.addEventListener("keypress", function(e) {
    if (e.key == "Escape") {
      footer.style.display = "block";
    }
  });
}

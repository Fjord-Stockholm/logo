var elementsWrapper = document.getElementById("elementsWrapper");
var componentWrapper = document.getElementById("contentWrapper");
var now = new Date();
var startTime = new Date();
var sunPosition;
var windAnimation;
var initialGradient;
var nightTime;

const map = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

var datePicker = document.getElementById("myDate");
flatpickr(datePicker, {
  onChange: function(selectedDates, dateStr, instance) {
    updateWithDate();
  }
});

var isSafari =
  navigator.vendor &&
  navigator.vendor.indexOf("Apple") > -1 &&
  navigator.userAgent &&
  navigator.userAgent.indexOf("CriOS") == -1 &&
  navigator.userAgent.indexOf("FxiOS") == -1;

if (isSafari) {
  //
} else {
  var svg = document.getElementById("mySVG");
  //svg.setAttributeNS(null, "filter", "url(#displacementFilter)");
}

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

        clouds = map(currentWeather.clouds.all, 0, 100, 0, 90);
        cloudCoverage = map(currentWeather.clouds.all, 0, 100, 0, 1);
        humidity = map(currentWeather.main.humidity, 0, 100, 0, 50);
        pressure = map(currentWeather.main.pressure, 800, 1100, 10, 0);
        temperature = map(currentWeather.main.temp, -30, 55, 0, 40);
        tempMax = map(currentWeather.main.temp_max, -30, 55, 0, 4);
        tempMin = map(currentWeather.main.temp_min, -30, 55, 0, 4);
        visibility = map(currentWeather.visibility, 0, 10000, 0, 4);
        windDeg = map(currentWeather.wind.deg, 0, 360, 0, 360);
        windSpeed = map(currentWeather.wind.speed, 0, 14, 0.8, 5);

        drawSunPath();
      });
    })
    .catch(function(err) {
      console.log("Fetch Error :-S", err);
    });
}

function download() {
  // function filter(node) {
  //   return node.id !== "testText";
  // }
  domtoimage
    .toPng(document.getElementById("container"))
    .then(function(dataUrl) {
      var link = document.createElement("a");
      link.download = "logo-" + now.getDate() + "-" + now.getMonth() + ".png";
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
    nightTime = false;

    document.documentElement.style.setProperty("--textColor", "black");
  } else {
    nightTime = true;

    document.documentElement.style.setProperty("--textColor", "black");
  }
}

function drawSunPath() {
  var points = [];

  function rtd(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
  }

  // Define gradient

  var turquiose = "#11D1C6";
  var green = "#39DD91";
  var darkPink = "#ED145B";
  var orange = "#FF7900";

  var blue = "#234CDF";
  var midnightBlue = "15363F";
  var ash = "#F0EDED";

  var gradient = document.getElementById("gradient");

  var startColorStop = document.getElementById("startColor");
  var middleColorStop = document.getElementById("middleColor");
  var middleColorStop2 = document.getElementById("middleColor2");
  var endColorStop = document.getElementById("endColor");

  var startColor;

  var currentTemperature = currentWeather.main.temp;

  if (currentTemperature > -25 && currentTemperature < -12.5) {
    startColor = turquiose;
  } else if (currentTemperature >= -12.5 && currentTemperature < 0) {
    startColor = green;
  } else if (currentTemperature >= 0 && currentTemperature < 12.5) {
    startColor = orange;
  } else if (currentTemperature >= 12.5) {
    startColor = darkPink;
  }

  var middleColor = chroma.scale([blue, ash]);
  var middleColorNight = chroma.scale([midnightBlue, ash]);

  var currentTime = map(now.getHours(), 0, 24, 0.5, 1);

  gradient.setAttribute("gradientTransform", "rotate(" + windDeg + ")");

  if (nightTime) {
    middleColorStop.setAttributeNS(
      null,
      "stop-color",
      middleColorNight(cloudCoverage).hex()
    );

    middleColorStop2.setAttributeNS(
      null,
      "stop-color",
      middleColorNight(cloudCoverage).hex()
    );
  } else {
    middleColorStop.setAttributeNS(
      null,
      "stop-color",
      middleColor(cloudCoverage).hex()
    );
    middleColorStop2.setAttributeNS(
      null,
      "stop-color",
      middleColor(cloudCoverage).hex()
    );
  }

  startColorStop.setAttributeNS(null, "stop-color", startColor);
  endColorStop.setAttributeNS(null, "stop-color", startColor);

  var mySVGElement = document.getElementById("contentWrapper");
  mySVG = document.getElementById("mySVG").children;

  sunPosition = SunCalc.getPosition(startTime, stockholmLat, stockholmLong);

  currentAzimuth = map(rtd(sunPosition.azimuth), -180, 180, 0, 100);
  currentAltitude = map(rtd(sunPosition.altitude), -180, 180, 0, 100);

  for (let index = 0; index < mySVG.length; index++) {
    var times = SunCalc.getTimes(
      startTime.addDays(index * 5),
      stockholmLat,
      stockholmLong
    );

    var nightEnd = SunCalc.getPosition(
      times.nightEnd,
      stockholmLat,
      stockholmLong
    );
    var dawn = SunCalc.getPosition(times.dawn, stockholmLat, stockholmLong);
    var sunrise = SunCalc.getPosition(
      times.sunrise,
      stockholmLat,
      stockholmLong
    );
    var noon = SunCalc.getPosition(
      times.solarNoon,
      stockholmLat,
      stockholmLong
    );
    var sunset = SunCalc.getPosition(times.sunset, stockholmLat, stockholmLong);
    var dusk = SunCalc.getPosition(times.dusk, stockholmLat, stockholmLong);

    points[0] = map(rtd(dawn.azimuth), -180, 180, 0, 500);
    points[1] = map(rtd(dawn.altitude), -180, 180, 0, 500);
    points[2] = map(rtd(sunrise.azimuth), -180, 180, 0, 500);
    points[3] = map(rtd(sunrise.altitude), -180, 180, 0, 500);
    points[4] = map(rtd(noon.azimuth), -180, 180, 0, 500);
    points[5] = map(rtd(noon.altitude), -180, 180, 0, 500);
    points[6] = map(rtd(sunset.azimuth), -180, 180, 0, 500);
    points[7] = map(rtd(sunset.altitude), -180, 180, 0, 500);
    points[8] = map(rtd(dusk.azimuth), -180, 180, 0, 500);
    points[9] = map(rtd(dusk.altitude), -180, 180, 0, 500);

    var initialPosition = 500 - 10 * index;
    var maxHeight = points[5] - 10 * index;

    mySVG[index].setAttributeNS(
      null,
      "d",
      "M0," +
        initialPosition +
        " C" +
        points[2] +
        "," +
        initialPosition +
        " " +
        points[2] +
        "," +
        maxHeight +
        " 250," +
        maxHeight +
        " C" +
        points[6] +
        "," +
        maxHeight +
        " " +
        points[6] +
        "," +
        initialPosition +
        " " +
        "500," +
        initialPosition
    );
  }

  windAnimation = anime({
    targets: mySVG,
    translateY: [0, windSpeed, 0],
    translateX: [0, map(windDeg, 0, 360, 0, 4), 0],
    opacity: [1, 0.6, 1],
    duration: 1500,
    loop: true,
    direction: "alternate",
    delay: anime.stagger(30, { from: "center" }),
    easing: "easeOutQuad"
  });

  windAnimation.start;
}

// Function to navigate through date

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function fullScreen() {
  var nav = document.getElementById("nav");

  nav.style.opacity = 0;

  setTimeout(() => {
    nav.style.zIndex = -1000;
  }, 400);

  document.body.addEventListener("keypress", function(e) {
    if (e.key == "Escape") {
      nav.style.zIndex = 2;
      nav.style.opacity = 1;
    }
  });
}

var isPlaying = false;
var timer;

function updateWithDate() {
  var myDate = document.getElementById("myDate").value;
  var dateEntered = new Date(myDate);
  startTime = dateEntered;
  drawSunPath();
}

function animateThrough(elem) {
  if (isPlaying) {
    clearTimeout(timer);
    isPlaying = false;
    elem.innerHTML = "Play";
    windAnimation.start;
  } else {
    isPlaying = true;
    elem.innerHTML = "Pause";
    windAnimation.stop;

    animate();
    function animate() {
      timer = setTimeout(() => {
        startTime = startTime.addDays(1);
        drawSunPath();

        datePicker.value =
          startTime.getUTCFullYear() +
          "-" +
          startTime.getUTCMonth() +
          "-" +
          startTime.getUTCDate();
        animate();
      }, 10);
    }
  }
}

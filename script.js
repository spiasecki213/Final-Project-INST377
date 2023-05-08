function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

/* injects the list into HTML */
function injectHTML(list) {
  console.log("fired indexHTML");
  const target = document.querySelector("#crimes_list"); // selects text in crimes_list
  target.innerHTML = ""; // makes sure crimes_list is blank
  list.forEach((item) => {
    const str = `<li>${
      item.incident_case_id +
      ", " +
      item.date +
      ", " +
      item.clearance_code_inc_type
    }</li>`;
    target.innerHTML += str;
  });
}

/* cuts the list down to 20 */
function cutCrimesList(list) {
  console.log("fired cut list");
  const range = [...Array(50).keys()];
  return (newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length - 1);
    return list[index];
  }));
}

/* filters API based on parameters */
function filterListCrimeType(list, query) {
  return list.filter((item) => {
    const inputCT = item.clearance_code_inc_type.toLowerCase();
    const queryCT = query.toLowerCase();
    return inputCT.includes(queryCT);
  });
}

/* initializes map */
function initMap() {
  const carto = L.map("map").setView([38.9, -76.871], 10); //PG County coords: 38.7849° N, 76.8721° W
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(carto);
  return carto;
}

/* marks the coordinates on the map */
function markerPlace(array, map) {
  //console.log("array for markers", array);

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
  array.forEach((item) => {
    //console.log("markerPlace", item);
    const { latitude } = item.location;
    const { longitude } = item.location;
    L.marker([latitude, longitude]).addTo(map);
  });
}

/* gets the current date */
function getDate() {
  // variables
  var todaysDate = new Date(); // gets the current date
  var day = todaysDate.getDate(); // gets the day from the current date
  var month = todaysDate.getMonth() + 1; // gets the month from the current date
  var year = todaysDate.getFullYear(); // gets the year from the current date

  // if date # is less than 10, add a '0' in front of the number
  if (day < 10) {
    day = "0" + day;
  }
  // if month # is less than 10, add a '0' in front of the number
  if (month < 10) {
    month = "0" + month;
  }

  todaysDate = year + "-" + month + "-" + day; // formats as a string
  console.log("Today's Date: " + todaysDate); // prints the date out to the console
  document.getElementById("date_start").value = "2017-02-02";
  //document.getElementById("date-end").value = todaysDate; // sets the date inputs to equal today's date
  document.getElementById("date_end").value = "2017-02-28";
}

/* filters based on the start and end date */
function filterDate(list, startQuery, endQuery) {
  return list.filter((item) => {
    return (
      new Date(item.date) >= new Date(startQuery) &&
      new Date(item.date) <= new Date(endQuery)
    );
  });
}

/* filters based on the radio buttons */
function filterCrimeType(list, query) {
  const radioBtns = document.querySelectorAll('input[name="crime_type"]');
  let selectedCrimeType;
  for (const radioBtn of radioBtns) {
    if (radioBtn.checked) {
      selectedCrimeType = radioBtn.value;
      break;
    }
  }
  return list.filter((item) => {
    return(item.clearance_code_inc_type) === (selectedCrimeType);
  })
}

/* filters based on the lat/long input */
function filterAddress(list) {
  return "none";
}

async function mainEvent() {
  getDate();
  const mainForm = document.querySelector(".main_form");
  // buttons
  const loadDataButton = document.querySelector("#data_load");
  const clearDataButton = document.querySelector("#data_clear");
  const generateListButton = document.querySelector("#generate");
  const filterListButton = document.querySelector("#filter");

  // map
  const carto = initMap();

  // localStorage
  const storedData = localStorage.getItem("storedData");
  let parsedData = JSON.parse(storedData);

  // list arrays
  let currentList = [];
  let newList = [];

  /* LOAD DATA */
  loadDataButton.addEventListener("click", async (submitEvent) => {
    console.log("Loading Data");

    const results = await fetch(
      "https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json"
    ); // fetches the api data
    // ?$limit=150000

    const storedList = await results.json(); // changes the response from the GET into an object/data we can use
    localStorage.setItem("storedData", JSON.stringify(storedList));
    parsedData = storedList;
  });

  /* GENERATE LIST */
  generateListButton.addEventListener("click", (event) => {
    console.log("generate new list");
    currentList = cutCrimesList(parsedData);
    console.log(currentList);
    injectHTML(currentList);
    markerPlace(currentList, carto);
  });

  /* FILTER DATA */
  filterListButton.addEventListener("click", (event) => {
    console.log("Clicked Filter Button");
    const formData = new FormData(mainForm); // turns the HTML form into a FormData object
    const formProps = Object.fromEntries(formData); // creates an object from all entries
    console.log(formProps);
    console.log("Crime Types: ", formProps.crime_type);
    
    /* Filter by Date */
    newList = filterDate(parsedData, formProps.date_start, formProps.date_end); // uses filterList function to filter the list using start and end dates from mainForm

    /* Filter by Crime Type */
    newList = filterCrimeType(newList, formProps.crime_type)

    /* Filter by Address */


    injectHTML(newList);
    markerPlace(newList, carto);
  });
  /* CLEAR DATA */
  clearDataButton.addEventListener("click", (event) => {
    console.log("clear browser data");
    localStorage.clear();
    console.log("localStorage Check", localStorage.getItem("storedData"));
  });
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests

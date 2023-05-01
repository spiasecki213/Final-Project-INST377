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
    const str = `<li>${item.incident_case_id + ", " + item.date + ", " + item.clearance_code_inc_type}</li>`;
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

/* gets the current date 
function getDate() {
  // variables
  var todaysDate = new Date();
  var day = todaysDate.getDate();
  var month = todaysDate.getMonth() + 1;
  var year = todaysDate.getFullYear();

  // if date # is less than 10, add a '0' in front of the number
  if (day < 10) {
    day = "0" + day;
  }
  // if month # is less than 10, add a '0' in front of the number
  if (month < 10) {
    month = "0" + month;
  }

  todaysDate = year + "-" + month + "-" + day;
  console.log("Today's Date: " + todaysDate);
  document.getElementById("date-start").value = todaysDate;
  document.getElementById("date-end").value = todaysDate;
}
*/
async function mainEvent() {
  //getDate();
  const mainForm = document.querySelector(".main_form");
  const loadDataButton = document.querySelector("#data_load");
  const clearDataButton = document.querySelector("#data_clear");
  const generateListButton = document.querySelector("#generate");
  const crimeTypeField = document.querySelector("#crime-type");
  //const dateField = document.querySelector("#date-start");
  //const endDateField = document.querySelector("#date-end");

  const carto = initMap();

  const storedData = localStorage.getItem("storedData");
  let parsedData = JSON.parse(storedData);

  let currentList = [];

  // load data button
  loadDataButton.addEventListener("click", async (submitEvent) => {
    console.log("Loading Data");

    const results = await fetch(
      "https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json"
    );

    const storedList = await results.json();
    localStorage.setItem("storedData", JSON.stringify(storedList));
    parsedData = storedList;
    injectHTML(parsedData);
  });

  // generate list button
  generateListButton.addEventListener("click", (event) => {
    console.log("generate new list");
    currentList = cutCrimesList(parsedData);
    console.log(currentList);
    injectHTML(currentList);
    markerPlace(currentList, carto);
  });
  /*
  startDateField.addEventListener("change", (event) => {
    console.log("input", event.target.value);
    const sd = new Date(event.target.value).getTime();
    console.log(sd)
    const newList = currentList.filter((d) => {
      const time = new Date(d.date).getTime();
      console.log(time)
      return (sd <= time);
    })
    console.log(newList);
    injectHTML(newList);
    markerPlace(newList, carto);
  });
  */
  crimeTypeField.addEventListener("input", (event) => {
    console.log("input", event.target.value);
    const newList = filterListCrimeType(parsedData, event.target.value);
    injectHTML(newList);
    markerPlace(newList, carto);
  });

  // clear data button
  clearDataButton.addEventListener("click", (event) => {
    console.log("clear browser data");
    localStorage.clear();
    console.log("localStorage Check", localStorage.getItem("storedData"));
  });
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests

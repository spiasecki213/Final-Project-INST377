/* injects the list into HTML */
function injectHTML(list) {
  console.log("fired indexHTML");
  const target = document.querySelector("#crimes_list"); // selects text in crimes_list
  target.innerHTML = ""; // makes sure crimes_list is blank
  if (list.length == 0){
    target.innerHTML += "No Records Found!<br>Please use different parameters.";
  }
  else {
    list.forEach((item) => {
      const str = `<li>${
        "ID: " +
        item.incident_case_id +
        "<br>" +
        "Date: " +
        formatMonth(item.date.substring(5, 7)) +
        " " +
        formatDay(item.date.substring(8, 10)) +
        ", " +
        item.date.substring(0, 4) +
        "<br>" +
        "Crime Type: " +
        item.clearance_code_inc_type
      }</li>`;
      target.innerHTML += str;
    });
  }
}

/* formats the month by taking the numerical
day and replacing it with the corresponding
abbreviated month */
function formatMonth(month, day) {
  month = String(month);
  if (String(month) == "01") {
    return "Jan";
  } else if (String(month) == "02") {
    return "Feb";
  } else if (String(month) == "03") {
    return "Mar";
  } else if (String(month) == "04") {
    return "Apr";
  } else if (String(month) == "05") {
    return "May";
  } else if (String(month) == "06") {
    return "Jun";
  } else if (String(month) == "07") {
    return "Jul";
  } else if (String(month) == "08") {
    return "Aug";
  } else if (String(month) == "09") {
    return "Sept";
  } else if (String(month) == "10") {
    return "Oct";
  } else if (moString(month) == "11") {
    return "Nov";
  } else if (String(month) == "12") {
    return "Dec";
  } else {
    month == month;
  }
}

/* formats the day to omit the 0 if the
day is one digit */
function formatDay(day) {
  if (String(day).substring(0, 1) == "0") {
    return day.substring(1);
  } else {
    return day;
  }
}

/* initializes map */
function initMap() {
  const carto = L.map("map").setView([38.9, -76.871], 10); //PG County coords: 38.7849° N, 76.8721° W
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 25,
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
    L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(
      "ID: " +
        item.incident_case_id +
        "<br>" +
        "Date: " +
        formatMonth(item.date.substring(5, 7)) +
        " " +
        formatDay(item.date.substring(8, 10)) +
        ", " +
        item.date.substring(0, 4)
    );
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
  document.getElementById("date_start").value = "2023-04-22";
  //document.getElementById("date-end").value = todaysDate; // sets the date inputs to equal today's date
  document.getElementById("date_end").value = todaysDate;
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
  if (selectedCrimeType == "Select All") {
    console.log("Select All Selected")
    return list;
  } else {
    return list.filter((item) => {
      return item.clearance_code_inc_type === selectedCrimeType;
    });
  }
}

/* filters based on the lat/long input */
function filterAddress(map, lat, long) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
  if (lat == "" && long == "") {
    lat = 38.9;
    long = -76.871;
  } // checks if the lat/long filters are blank and doesn't change anything if they are empty
  else {
    L.marker([lat, long]).addTo(map).bindPopup("Your Address").openPopup();
    map.setView([lat, long], 11);
  }
}

async function mainEvent() {
  getDate();
  const mainForm = document.querySelector(".main_form");
  // buttons
  const refreshDataButton = document.querySelector("#data_refresh");
  const filterListButton = document.querySelector("#filter");

  // map
  const carto = initMap();

  // localStorage
  const storedData = localStorage.getItem("storedData");
  let parsedData = JSON.parse(storedData);

  // list arrays
  let currentList = [];
  let newList = [];

  /* ########## REFRESH DATA EVENT LISTENER ########## */
  refreshDataButton.addEventListener("click", async (submitEvent) => {
    localStorage.clear();
    console.log("localStorage Check", localStorage.getItem("storedData"));
    console.log("Cleared Data");
    const results = await fetch(
      "https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json?$order=date DESC"
    ); // fetches the api data in descending order to get the most recent results

    const storedList = await results.json(); // changes the response from the GET into an object/data we can use
    localStorage.setItem("storedData", JSON.stringify(storedList));
    parsedData = storedList;
    console.log("Refreshed Data");
  });

  /* ########## FILTER DATA EVENT LISTENER ########## */
  filterListButton.addEventListener("click", (event) => {
    console.log("Clicked Filter Button");
    const formData = new FormData(mainForm); // turns the HTML form into a FormData object
    const formProps = Object.fromEntries(formData); // creates an object from all entries
    console.log("Form Data: ", formProps);

    /* Filter by Date */
    newList = filterDate(parsedData, formProps.date_start, formProps.date_end); // uses filterList function to filter the list using start and end dates from mainForm

    /* Filter by Crime Type */
    newList = filterCrimeType(newList, formProps.crime_type);

    /* Filter by Address */
    formLat = formProps.lat;
    formLong = formProps.long;
    filterAddress(carto, formLat, formLong);
    if (newList.length === 0) {
      console.log("Error message sent");
      injectHTML(newList);
      alert("No Records Found! Try using different parameters.")
    }
    else{
      injectHTML(newList);
      markerPlace(newList, carto);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests

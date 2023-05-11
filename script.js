/**
 * @file JavaScript file for index.html
 * @author Sam Piasecki <spiaseck@terpmail.umd.edu>
 */

/*****************************************************************************/

/**
 * Injects the list into the HTML file
 * @param {Object} list - The list of filtered crime instances to be displayed on the website
 * @return: none
 */
function injectHTML(list) {
  console.log("fired indexHTML");
  const target = document.querySelector("#crimes_list"); // Selects text in crimes_list
  target.innerHTML = ""; // Makes sure crimes_list is blank
  // If the list of filtered results is blank, the text is changed to the above string
  if (list.length == 0) {
    target.innerHTML += "No Records Found!<br>Please use different parameters.";
  }
  // Else, displays the crime data for each filtered crime instance to display ID, Date, and Crime Type
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

/*******************************/
/*        DATE FUNCTIONS       */
/*******************************/

/**
 * Formats the month by taking the month number and replaces it with the corresponding abbreviated month name (ex: "01" => "Jan")
 * @param {String} month - The numerical month
 * @return {String} The abbreviated name of the month
 */
function formatMonth(month) {
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

/**
 * Formats the day to omit the 0 if the day is a single digit (ex: "01" => "1")
 * @param {String} day - The day from the JSON file
 * @return {String} The formatted day
 */
function formatDay(day) {
  if (String(day).substring(0, 1) == "0") {
    return day.substring(1); // Returns a single digit at index 1 (the number after the 0)
  } else {
    return day; // Returns the original day string
  }
}

/**
 * Gets the current date and displays it in the end_date element
 * @param: none
 * @return: none;
 */
function getDate() {
  // variables
  var todaysDate = new Date(); // Gets the current date
  var day = todaysDate.getDate(); // Gets the day from the current date
  var month = todaysDate.getMonth() + 1; // Gets the month from the current date
  var year = todaysDate.getFullYear(); // Gets the year from the current date

  // If the date number is less than 10, add a '0' in front of the number
  if (day < 10) {
    day = "0" + day;
  }
  // If the month number is less than 10, add a '0' in front of the number
  if (month < 10) {
    month = "0" + month;
  }

  todaysDate = year + "-" + month + "-" + day; // Formats as a string
  console.log("Today's Date: " + todaysDate); // Prints the date out to the console
  document.getElementById("date_start").value = "2023-04-22"; // Sets the date_start element to April 22, 2023
  document.getElementById("date_end").value = todaysDate; // Sets the date_end element to todaysDate
}

/*******************************/
/*        MAP FUNCTIONS        */
/*******************************/

/**
 * Initializes the map
 * @param: none
 * @return: none
 */
function initMap() {
  const carto = L.map("map").setView([38.9, -76.871], 10); //PG County coords: 38.7849° N, 76.8721° W
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 25,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(carto);
  return carto;
}

/**
 * Marks the coordinates on the map
 * @param {Object} array - The array of crime instances
 * @param {Object} map - The map where the markers will be displayed
 * @return: none
 */
function markerPlace(array, map) {
  // If there are any layers with markers present on the map, remove them
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
  // For each item in the array, place a marker at that item's latitude and longitude
  array.forEach((item) => {
    const { latitude } = item.location;
    const { longitude } = item.location;
    // Adds the marker on the map with a popup containing information specific to that marker
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

/*******************************/
/*       FILTER FUNCTIONS      */
/*******************************/

/**
 * Filters the list using the start date and end date from the form
 * @param {Object} list - The list of crime instances
 * @param {String} startQuery - The starting date to filter list
 * @param {String} endQuery - The ending date to filter list
 * @return {String} - // List of crimes where the data is less than the start date AND greater than the end date
 */
function filterDate(list, startQuery, endQuery) {
  return list.filter((item) => {
    return (
      new Date(item.date) >= new Date(startQuery) &&
      new Date(item.date) <= new Date(endQuery)
    );
  });
}

/**
 * Filters the list using the input from the crime type radio buttons from the form
 * @param {Object} list - The list of crime instances
 * @return {String} - // List of crimes where the data is less than the start date AND greater than the end date
 */
function filterCrimeType(list, query) {
  const radioBtns = document.querySelectorAll('input[name="crime_type"]');
  let selectedCrimeType;
  for (const radioBtn of radioBtns) {
    // During the loop, if one of the radio buttons is found to be checked, set selectedCrimeType to that selected value
    if (radioBtn.checked) {
      selectedCrimeType = radioBtn.value;
      break; // Stop the loop when one button is found to be checked
    }
  }
  // Checks if the "Select All" radio button is selected
  if (selectedCrimeType == "Select All") {
    console.log("Select All Radio Button Selected");
    return list; // Returns the unfiltered list
  } else {
    // Returns the filtered list using selectedCrimeType as the filter
    return list.filter((item) => {
      return item.clearance_code_inc_type === selectedCrimeType;
    });
  }
}

/**
 * Filters the list using the Latitude and Longitude input from the form
 * @param {Object} list - The list of crime instances
 * @param {String} lat - The latitude input from the form
 * @param {String} long - The longitude input from the form
 * @return: none
 */
function filterAddress(map, lat, long) {
  // If there are any layers with markers present on the map, remove them
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
  // If the inputs are blank, the values are set to the default values (PG County coords)
  if (lat == "" && long == "") {
    lat = 38.9;
    long = -76.871;
  }
  // Else, set the view to the inputted latitude and longitude and zoom in by one level
  else {
    map.setView([lat, long], 11);
  }
}

/******************************/
/*    MAIN EVENT FUNCTION     */
/******************************/

async function mainEvent() {
  getDate();
  /* Query Selectors */
  const mainForm = document.querySelector(".main_form");
  const refreshDataButton = document.querySelector("#data_refresh");
  const filterListButton = document.querySelector("#filter");

  /* Map */
  const carto = initMap();

  /* localStorage */
  const storedData = localStorage.getItem("storedData");
  let parsedData = JSON.parse(storedData);

  /* List Array */
  let newList = []; // The list of filtered data

  /***************************************/
  /*    REFRESH BUTTON EVENT LISTENER    */
  /***************************************/
  refreshDataButton.addEventListener("click", async (submitEvent) => {
    localStorage.clear(); // Clears local storage
    console.log("localStorage Check", localStorage.getItem("storedData"));
    console.log("Cleared Data");
    const results = await fetch(
      "https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json?$order=date DESC"
    ); // Fetches the api data in descending order to get the most recent results

    const storedList = await results.json(); // Changes the response from the GET into an object/data we can use
    localStorage.setItem("storedData", JSON.stringify(storedList));
    parsedData = storedList;
    console.log("Refreshed Data");
  });

  /***************************************/
  /*    FILTER BUTTON EVENT LISTENER     */
  /***************************************/
  filterListButton.addEventListener("click", (event) => {
    console.log("Clicked Filter Button");
    const formData = new FormData(mainForm); // Turns the HTML form into a FormData object
    const formProps = Object.fromEntries(formData); // Creates an object from all entries
    console.log("Form Data: ", formProps);

    /* Filter by Date */
    newList = filterDate(parsedData, formProps.date_start, formProps.date_end); // Uses filterList function to filter the list using start and end dates from mainForm
    /* Filter by Crime Type */
    newList = filterCrimeType(newList);
    /* Filter by Address */
    formLat = formProps.lat;
    formLong = formProps.long;
    filterAddress(carto, formLat, formLong);
    
    // If the list is empty (i.e. no results are found using the filters) put out error message
    if (newList.length === 0) {
      console.log("Error message sent");
      injectHTML(newList);
      alert("No Records Found! Try using different parameters.");
    } 
    // Else, injects list and adds markers of list
    else {
      injectHTML(newList);
      markerPlace(newList, carto);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests
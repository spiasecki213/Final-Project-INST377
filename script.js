//38.7849° N, 76.8721° W
var map = L.map('map').setView([38.784, -76.872], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function getDate () {
    // variables
    var todaysDate = new Date();
    var day = todaysDate.getDate();
    var month = todaysDate.getMonth() + 1;
    var year = todaysDate.getFullYear();

    // if date # is less than 10, add a '0' in front of the number
    if(day < 10) {
        day = "0" + day
    }
    // if month # is less than 10, add a '0' in front of the number
    if(month < 10) {
        month = '0' + month
    }

    todaysDate = year + '-' + month + '-' + day;
    console.log(todaysDate);
    document.getElementById('date-start').value = todaysDate;
    document.getElementById('date-end').value = todaysDate;
}

async function mainEvent() {
    getDate();
}


document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests

// this file is intended for downloading historical weather data
// and persisting it to a file called `weather-data.json`
const config = require( "../config" );
const got = require( "got" );
const pfs = require( "promised-io/fs" );
const when = require( "when" );

const months = [ "10", "11" ];
const days = [ "20", "21", "22", "23", "23", "25", "26", "27", "28", "29", "30", "31", "01", "02", "03", "04", "05" ];

let historyData = {};

function url( { year, month, day } ) {
  return `http://api.wunderground.com/api/${ config.weatherUndergroundApiKey }/history_${ year }${ month }${ day }/q/CO/somerset.json`;
}

function saveData() {
  pfs.writeFile( "./weather-data.json", JSON.stringify( historyData, null, 2 ), "utf-8" ).then( () => {
    console.log( "Data successfully written to file weather-data.json" );
  } );
}

function fetchData() {
  const dateParts = { year: "2015", month: "10", day: "25" };
  const dataKey = `${ dateParts.year }${ dateParts.month }${ dateParts.day }`;

  got( url( dateParts ) )
    .then( response => {
    historyData[ dataKey ] = JSON.parse( response.body );
    } )
    .then( saveData )
    .catch( err => {
      historyData[ dataKey ] = {
        message: `Error fetching data for ${ dataKey }`,
        error: err
      }
    } );
}

fetchData();

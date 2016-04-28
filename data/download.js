// this file is intended for downloading historical weather data
// and persisting it to a file called `weather-data.json`
const config = require( "../config" );
const got = require( "got" );
const pfs = require( "promised-io/fs" );
const when = require( "when" );
const sequence = require( "when/sequence" );

const years = 30;
const months = [ "10", "11" ];
const days = [ "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "01", "02", "03", "04", "05" ];

let historyData = {};

function url( { year, month, day } ) {
  return `http://api.wunderground.com/api/${ config.weatherUndergroundApiKey }/history_${ year }${ month }${ day }/q/CO/somerset.json`;
}

function saveData() {
  pfs.writeFile( `${ __dirname }/weather-data.json`, JSON.stringify( historyData, null, 2 ), "utf-8" ).then( () => {
    console.log( "Data successfully written to file weather-data.json" );
  } );
}

function fetchDataFor( { year, month, day } ) {
  // const dateParts = { year: "2015", month: "10", day: "25" };
  // const dataKey = `${ dateParts.year }${ dateParts.month }${ dateParts.day }`;

  return when.promise( ( resolve, reject ) => {
    setTimeout( () => {
      console.log( `Fetching data for ${ year }${ month }${ day }` );
      const result = {
        date: {
          year,
          month,
          day
        },
        data: {}
      }
      historyData[ `${ year }${ month }${ day }`] = result;
      resolve( result );
    }, 2000 );
    // }, 10000 );
  } );

  // got( url( { year, month, day } ) )
  //   .then( response => {
  //   historyData[ dataKey ] = JSON.parse( response.body );
  //   } )
  //   .then( saveData )
  //   .catch( err => {
  //     historyData[ dataKey ] = {
  //       message: `Error fetching data for ${ dataKey }`,
  //       error: err
  //     }
  //   } );
}

function fetchData( dates ) {
  let results = [];

  dates.forEach( date => {
    results.push( fetchDataFor.bind( null, date ) );
  } );

  return sequence( results );
}

function calculateDatesToFetch() {
  return new Promise( ( resolve, reject ) => {
    const currentYear = new Date().getFullYear();
    let dates = [];
    let startYear = ( currentYear - ( years + 1 ) );
    let year = startYear;
    let octoberDay, novemberDay;

    while( startYear < currentYear ) {
      year = startYear;

      months.forEach( month => {
        days.forEach( day => {
          octoberDay = ( month === "10" && parseInt( day, 10 ) > 5 );
          novemberDay = ( month === "11" && parseInt( day, 10 ) < 20 );

          if( octoberDay || novemberDay ) {
            dates.push( { year, month, day } );
          }
        } );
      } );

      startYear = ( startYear + 1 );
    }

    console.log( "how many dates do we have to fetch?", dates.length );
    resolve( dates );
  } );
}

function downloadData() {
  calculateDatesToFetch()
    .then( dates => {
      fetchData( dates )
        .then( data => {
          console.log( "did we get some data??", data );
        } )
        .catch( err => {
          console.log( "OOPS", err );
        } )
      } )
    .catch( err => {
      console.log( "what is happening?", err );
    } );
}

downloadData();

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
let apiCalls = {};

function url( { year, month, day } ) {
  return `http://api.wunderground.com/api/${ config.weatherUndergroundApiKey }/history_${ year }${ month }${ day }/q/CO/somerset.json`;
}

function timeFormat( diff ) {
  const LN1000 = Math.log( 1000 );
  const UNIT_LABELS = [ " ns", " μs", " ms" ];
  let minutes, seconds;

  if ( diff[ 0 ] ) {
    let s = diff[ 0 ] + diff[ 1 ] / 1e9;
    let seconds = ( Math.round( s * 100 ) / 100 );

    if( seconds >= 60 ) {
      minutes = Math.round( seconds / 60 );
      seconds = Math.round( ( ( seconds % 60 ) * 100 ) / 100 );
      return `${ minutes }m ${ seconds }s`;
    }

    return `${ seconds }s`;
  } else {
    let magnitude = Math.floor( Math.log( diff[ 1 ] ) / LN1000 );
    return Math.round( diff[ 1 ] / Math.pow( 1000, magnitude ) ) + UNIT_LABELS[ magnitude ];
  }
}

function saveData( data ) {
  return pfs.writeFile( `${ __dirname }/weather-data.json`, JSON.stringify( historyData, null, 2 ), "utf-8" ).then( () => {
    console.log( "Data successfully written to file weather-data.json" );
  } );
}

function fetchDataFor( { year, month, day } ) {
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
      console.log( "\tresult:", result );
      resolve( result );
    // }, 205 );
    }, 7000 );
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

  // TODO: iterate through the data that has not been fetched yet, and
  // fetch 17 records (dates) at a time, until the data for all dates
  // has been downloaded and populated

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

    console.log( `Fetching historical weather data for ${ dates.length } days over the past ${ years } years...\n` );
    resolve( dates );
  } );
}

function downloadData() {
  const startTime = process.hrtime();

  // TODO: open/load existing `weather-data.json` file if it exists
  // if it exists, we don't need to `calculateDatesToFetch`, just
  // use the data already loaded/saved in that file, and start
  // processing/fetching data for dates that have not been fetched yet
  // (need to make this an iterative process to prevent API abuse)

  calculateDatesToFetch()
    .then( dates => {
      fetchData( dates )
        .then( data => {
          saveData( data ).then( () => {
            const diff = process.hrtime( startTime )
            const time = timeFormat( diff );
            console.log( "Process completed in ", time );
          } );
        } )
        .catch( err => {
          console.log( "Error fetching data", err );
        } )
      } )
    .catch( err => {
      console.log( "Error calculating dates to fetch data for", err );
    } );
}

downloadData();

// this file is intended for downloading historical weather data
// and persisting it to a file called `weather-data.json`
const _ = require( "lodash" );
const config = require( "../config" );
const got = require( "got" );
const pfs = require( "promised-io/fs" );
const when = require( "when" );
const sequence = require( "when/sequence" );

const years = 30;
const months = [ "10", "11" ];
const days = [ "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "01", "02", "03", "04", "05" ];
const runLimit = 17;
const dailyApiCallLimit = 500;

let startTime = {};
let historyData = {};
let apiCalls = {};
let runIndex = 0;

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
  const fileContents = _.extend( {}, { apiCalls: apiCalls }, historyData );

  return pfs.writeFile( `${ __dirname }/weather-data.json`, JSON.stringify( fileContents, null, 2 ), "utf-8" ).then( () => {
    console.log( "Data successfully written to file weather-data.json" );
  } );
}

function fetchDataFor( { year, month, day } ) {
  return when.promise( ( resolve, reject ) => {
    setTimeout( () => {
      const key = `${ year }${ month }${ day }`;
      let result = {};
      console.log( `Fetching data for ${ key }` );

      got( url( { year, month, day } ) )
        .then( response => {
          result = {
            parts: {
              year,
              month,
              day
            },
            data: JSON.parse( response.body )
          };

          historyData.dates[ key ] = result;
          resolve( result );
        } )
        .catch( err => {
          historyData.dates[ key ] = {
            message: `Error fetching data for ${ key }`,
            error: err
          }
        } );
    }, 7000 );
  } );
}

function fetchData( dates ) {
  let results = [];
  const dateKeys = Object.keys( dates );
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = ( "0" + ( now.getMonth() + 1 ) ).slice( -2 );
  const currentDay = ( "0" + ( now.getDate() ) ).slice( -2 );
  const currentDate = `${ currentYear }${ currentMonth }${ currentDay }`;

  dateKeys.forEach( key => {
    const date = historyData.dates[ key ];

    if( _.isEmpty( date.data ) ) {
      if( runIndex < runLimit ) {
        let apiCallsForCurrentDate = apiCalls[ currentDate ] || 0;
        apiCalls[ currentDate ] = apiCallsForCurrentDate + 1;

        if( apiCalls[ currentDate ] >= dailyApiCallLimit ) {
          console.log( "Daily API call limit reached, aborting. Please try again tomorrow" );
          process.exit();
        } else {
          results.push( fetchDataFor.bind( null, date.parts ) );
          runIndex = ( runIndex + 1 );
        }
      }
    } else {
      console.log( `Data already fetched for ${ key }, skipping` );
    }
  } );

  return sequence( results );
}

function runLimitHit( data ) {
  const datesThatRemainToBeFetched = _.filter( historyData.dates, date => {
    return _.isEmpty( date.data );
  } ).length;
  console.log( `Run limit hit for this session. ${ datesThatRemainToBeFetched } remain to be fetched.` );
  saveData( data ).then( () => {
    const diff = process.hrtime( startTime )
    const time = timeFormat( diff );
    console.log( "Process completed in ", time );
  } ).then( () => {
    process.exit();
  } );
}

function calculateDatesToFetch() {
  return new Promise( ( resolve, reject ) => {
    const currentYear = new Date().getFullYear();
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
            const key = `${ year }${ month }${ day }`;
            historyData[ key ] = {
              date: { year, month, day },
              data: {}
            };
          }
        } );
      } );

      startYear = ( startYear + 1 );
    }

    resolve( historyData );
  } );
}

function downloadData() {
  startTime = process.hrtime();
  historyData = require( `${ __dirname }/weather-data.json` );

  if( !_.isEmpty( historyData ) ) {
    console.log( `Fetching historical weather data for ${ Object.keys( historyData.dates ).length } days over the past ${ years } years...\n` );
    apiCalls = historyData.apiCalls;

    fetchData( historyData.dates )
      .then( data => {
        runLimitHit( data );
      } );
  } else {
    calculateDatesToFetch()
      .then( dates => {
        console.log( `Fetching historical weather data for ${ Object.keys( historyData.dates ).length } days over the past ${ years } years...\n` );
        fetchData( dates )
          .then( data => {
            runLimitHit( data );
          } )
          .catch( err => {
            console.log( "Error fetching data", err );
          } )
        } )
      .catch( err => {
        console.log( "Error calculating dates to fetch data for", err );
      } );
  }
}

downloadData();

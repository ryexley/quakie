import { extend, get, template } from "lodash";
import when from "when";
import pipeline from "../js/util/pipeline"; // "when/pipeline";
import axios from "axios";
import messenger from "../js/mixins/messenger";

const localizationFunctions = {
  translate( target, data ) {
    return template( target )( data );
  },

  t( target, data ) {
    return this.translate( target, data );
  },

  localizedNumber( value ) {
    return parseInt( value, 10 ).toLocaleString();
  },

  ln( value ) {
    return this.localizedNumber( value );
  }
};

function getLanguage( options ) {
  return when.promise( ( resolve, reject ) => {
    const language = options.language || ( navigator ? navigator.language.toLowerCase() : "en-us" ) || "en-us";
    resolve( extend( options, { language: language } ) );
  } );
}

function getLocalizedData( options ) {
  return when.promise( ( resolve, reject ) => {
    const localesPath = options.localesPath || "/locales/";
    const localizationDataUrl = `${ options.serverRoot }${ localesPath }/${ options.language }.json`;

    axios.get( localizationDataUrl )
      .then( result => {
        resolve( result.data );
      } )
      .catch( err => {
        reject( new Error( "Error fetching locale data", err ) );
      } );
  } );
}

export default {
  load( options = {} ) {
    return pipeline( [ getLanguage, getLocalizedData ], options ).then( localizationData => {
      return extend( localizationFunctions, {
        data: localizationData
      } );
    } );
  }
};

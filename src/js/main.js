import React from "react";
import ReactDOM from "react-dom";
import config from "../../config/";
import i18n from "../i18n";
import DataClient from "./data/client";
import AppState from "./state";
import App from "./app";

( function() {

  i18n.load( { serverRoot: config.server.root } ).then( localizationData => {
    const options = { i18n: localizationData };

    new DataClient( config.server.api );
    new AppState( options );

    ReactDOM.render( <App { ...options } />, document.getElementById( "root" ) );
  } );

}() );


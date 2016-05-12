import React from "react";
import ReactDOM from "react-dom";
import config from "../../config/";
import i18n from "../i18n";
import DataClient from "./data/client";
import AppState from "./state";
import App from "./app";

( function() {

  new DataClient( config.server.api );
  new AppState();

  i18n.load( { serverRoot: config.server.root } ).then( localizationData => {
    const props = { i18n: localizationData };
    ReactDOM.render( <App { ...props } />, document.getElementById( "root" ) );
  } );

}() );


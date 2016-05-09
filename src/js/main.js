import React from "react";
import ReactDOM from "react-dom";
import config from "../../config/";
import DataClient from "./data/client";
import AppState from "./state";
import App from "./app";

new DataClient( config.api );
new AppState();

ReactDOM.render( <App />, document.getElementById( "root" ) );

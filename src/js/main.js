import React from "react";
import ReactDOM from "react-dom";
import config from "../../config/";
import DataClient from "./data/client";
import App from "./app";

new DataClient( config.api );

ReactDOM.render( <App />, document.getElementById( "root" ) );

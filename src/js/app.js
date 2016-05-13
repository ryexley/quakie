import { extend } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import messenger from "./mixins/messenger";
import AnnualAveragesChart from "./components/charts/annual-averages-chart";
import AnnualWeatherSelectorChart from "./components/charts/annual-weather-selector";
import "../css/app.global.css";

class App extends React.Component {
  constructor() {
    super();
    this.actions = new Actions();
    this.initState();
    this.setupSubscriptions();
  }

  initState() {
    this.state = {
      annualAveragesData: null,
      AnnualWeatherSelectorChartData: null
    };
  }

  setupSubscriptions() {
    this.subscribe( { topic: "state.changed", handler: this.onStateChanged } );
  }

  onStateChanged( data, env ) {
    this.setState( data );
  }

  componentWillMount() {
    this.startWiretap( {} );
  }

  componentDidMount() {
    this.actions.requestWeatherData();
  }

  render() {
    return (
      <section>
        <AnnualAveragesChart i18n={ this.props.i18n } data={ this.state.annualAveragesData } />
        <AnnualWeatherSelectorChart i18n={ this.props.i18n } data={ this.state.annualWeatherSelectorChartData } />
      </section>
    );
  }
};

extend( App.prototype, messenger );

export default App;

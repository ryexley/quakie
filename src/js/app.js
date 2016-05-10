import { extend } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import messenger from "./mixins/messenger";
import AnnualAveragesChart from "./components/charts/annual-averages-chart";
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
      annualAveragesData: { labels: [], datasets: [] }
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
        <AnnualAveragesChart data={ this.state.annualAveragesData } />
      </section>
    );
  }
};

extend( App.prototype, messenger );

export default App;

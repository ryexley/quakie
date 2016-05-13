import { merge, clone } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "../../../actions";
import LineChart from "../line-chart";
import styles from "./style.css";

class AnnualWeatherSelectorChart extends React.Component {
  constructor() {
    super();
    this.actions = new Actions();
  }

  render() {
    let { data, i18n } = this.props;
    let chartOptions = {};

    const localizationData = i18n.data.annualWeatherSelectorChart;

    if( data ) {
      // apply some styling to the datasets
      // TODO: try to figure out why this works...it *works*, but I don't really understand how or why
      merge( clone( data.selectedYearData.datasets ), [ {
          // wind speeds
          pointBackgroundColor: "rgba( 235, 235, 235, 1 )",
          borderColor: "rgba( 235, 235, 235, 1 )",
          backgroundColor: "rgba( 235, 235, 235, 0.5 )",
          borderWidth: 1
        }, {
         // average
          pointBackgroundColor: "rgba( 70, 70, 70, 1 )",
          borderColor: "rgba( 70, 70, 70, 1 )",
          backgroundColor: "rgba( 165, 165, 165, 0.3 )",
          borderWidth: 1
        }, {
          // highs
          pointBackgroundColor: "rgba( 255, 0, 0, 1 )",
          borderColor: "rgba( 255, 0, 0, 1 )",
          backgroundColor: "rgba( 255, 0, 0, 0.1 )",
          borderWidth: 1
        }, {
          // lows
          pointBackgroundColor: "rgba( 0, 105, 205, 1 )",
          borderColor: "rgba( 0, 105, 205, 1 )",
          backgroundColor: "rgba( 0, 105, 205, 0.1 )",
          borderWidth: 1
        } ] );

      chartOptions = {
        attributes: {
          width: "500"
        },
        chartData: data.selectedYearData
      };

      return (
        <div className={ styles.annualWeatherSelectorChart }>
        <div className={ styles.selectedYear }>{ data.selectedYear }</div>
          <LineChart { ...chartOptions } />
          <ul className={ styles.yearList }>
            { data.years.map( year => {
              return <li key={ year }><a href="#" onClick={ this.selectYear.bind( this ) } data-year={ year }>{ year }</a></li>
            } ) }
          </ul>
          <div className={ styles.description }>{ localizationData.description }</div>
        </div>
      );
    } else {
      return <div>{ localizationData.loadingMessage }</div>;
    }
  }

  selectYear( event ) {
    event.preventDefault();
    const selectedYear = event.currentTarget.getAttribute( "data-year" );
    this.actions.selectYear( selectedYear );
  }
};

AnnualWeatherSelectorChart.propTypes = {};

AnnualWeatherSelectorChart.defaultProps = {};

export default AnnualWeatherSelectorChart;

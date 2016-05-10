import React from "react";
import ReactDOM from "react-dom";
import LineChart from "../line-chart";
import styles from "./style.css";

class AnnualAveragesChart extends React.Component {
  render() {
    const chartOptions = {
      attributes: {
        width: "500"
      },
      chartData: {
        labels: [ "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010" ],
        datasets: [ {
          label: "Sample Data",
          data: [ 30, 25, 30, 35, 40, 45, 40, 35, 30, 35, 40 ]
        } ]
      }
    };

    return (
      <div className={ styles.annualAveragesChart }>
        <LineChart { ...chartOptions } />
      </div>
    );
  }
};

AnnualAveragesChart.propTypes = {};

AnnualAveragesChart.defaultProps = {};

export default AnnualAveragesChart;

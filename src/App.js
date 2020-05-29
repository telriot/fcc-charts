import React from "react"
import BarChart from "./components/BarChart"
import styles from "./App.module.scss"
import ScatterPlot from "./components/ScatterPlot"
import HeatMap from "./components/HeatMap"
import Choropleth from "./components/Choropleth"
import TreeMap from "./components/TreeMap"

function App() {
  return (
    <div className={styles.container}>
      <TreeMap />
    </div>
  )
}

export default App

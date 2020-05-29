import React from "react"
import BarChart from "./components/BarChart"
import styles from "./App.module.scss"
import ScatterPlot from "./components/ScatterPlot"
import HeatMap from "./components/HeatMap"
import Choropleth from "./components/Choropleth"

function App() {
  return (
    <div className={styles.container}>
      <BarChart />
      <ScatterPlot />
      <HeatMap />
      <Choropleth />
    </div>
  )
}

export default App

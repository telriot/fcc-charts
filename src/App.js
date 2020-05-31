import React from "react"
import BarChart from "./components/BarChart"
import styles from "./App.module.scss"
import ScatterPlot from "./components/ScatterPlot"
import HeatMap from "./components/HeatMap"
import Choropleth from "./components/Choropleth"
import TreeMap from "./components/TreeMap"
import ForceChart from "./components/ForceChart"
import Meteorites from "./components/Meteorites"

function App() {
  return (
    <div className={styles.container}>
      <BarChart />
      <ScatterPlot />
      <HeatMap />
      <Choropleth />
      <TreeMap />
      <ForceChart />
      <Meteorites />
    </div>
  )
}

export default App

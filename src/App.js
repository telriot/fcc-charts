import React from "react"
import BarChart from "./components/BarChart"
import styles from "./App.module.scss"
import ScatterPlot from "./components/ScatterPlot"
import HeatMap from "./components/HeatMap"

function App() {
  return (
    <div className={styles.container}>
      <HeatMap />
    </div>
  )
}

export default App

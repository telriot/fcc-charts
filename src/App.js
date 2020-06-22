import React from "react"
import { Switch, Route } from "react-router-dom"

import BarChart from "./components/BarChart"
import styles from "./App.module.scss"
import ScatterPlot from "./components/ScatterPlot"
import HeatMap from "./components/HeatMap"
import Choropleth from "./components/Choropleth"
import TreeMap from "./components/TreeMap"
import ForceChart from "./components/ForceChart"
import Meteorites from "./components/Meteorites"
import Navbar from "./components/layout/Navbar"
import Landing from "./components/Landing"

function App() {
  return (
    <div className={styles.container}>
      <Route exact path="/*">
        <Navbar />
      </Route>
      <Switch>
        <Route exact path="/">
          <Landing />
        </Route>
        <Route exact path="/bar">
          <BarChart />
        </Route>

        <Route exact path="/heat">
          <HeatMap />
        </Route>
        <Route exact path="/choropleth">
          <Choropleth />
        </Route>
        <Route exact path="/tree">
          <TreeMap />
        </Route>
        <Route exact path="/force">
          <ForceChart />
        </Route>
        <Route exact path="/meteorites">
          <Meteorites />
        </Route>
      </Switch>
    </div>
  )
}

export default App

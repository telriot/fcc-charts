import React from "react"
import styles from "./Landing.module.scss"
import reactD3 from "../img/reactd3.png"
function Landing() {
  return (
    <div className={styles.container}>
      <div className={styles.jumbotron}>
        <h1 className={styles.header}>D3 Charts</h1>
        <h3 className={styles.sub}>
          A collection of D3 charts for the FCC Coding Challenge, <br /> created
          with D3.js and rendered via React
        </h3>
        <img className={styles.image} src={reactD3} />
      </div>
    </div>
  )
}

export default Landing

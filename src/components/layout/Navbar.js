import React from "react"
import styles from "./Navbar.module.scss"
import { Link } from "react-router-dom"
function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.brand}>Charts</h1>
      <ul className={styles.nav}>
        <li>
          <Link to="/bar">Bar</Link>
        </li>
        <li>
          <Link to="/scatter">Scatter</Link>
        </li>
        <li>
          <Link to="/heat">Heat</Link>
        </li>
        <li>
          <Link to="/choropleth">Choropleth</Link>
        </li>
        <li>
          <Link to="/tree">Treemap</Link>
        </li>
        <li>
          <Link to="/force">Force</Link>
        </li>
        <li>
          <Link to="/meteorites">Choropleth 2</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar

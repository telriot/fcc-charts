import React from "react"
import styles from "./Navbar.module.scss"
import { Link } from "react-router-dom"

function HamburgerDropdown(props) {
  const { isOpen, toggleHamburger } = props

  return (
    <div>
      <ul
        onClick={toggleHamburger}
        className={isOpen ? styles.dropdown : styles.dropdownClosed}
      >
        <li>
          <Link to="/bar">Bar</Link>
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
    </div>
  )
}

export default HamburgerDropdown

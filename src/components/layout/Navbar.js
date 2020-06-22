import React, { useState } from "react"
import HamburgerMenu from "./HamburgerMenu"
import styles from "./Navbar.module.scss"
import { Link } from "react-router-dom"
import HamburgerDropdown from "./HamburgerDropdown"
function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleHamburger = () => {
    setIsOpen((prevState) => (prevState ? false : true))
  }
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.brand}>
        <Link to="/"> D3 Charts</Link>
      </h1>

      <ul className={styles.nav}>
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
      <HamburgerMenu isOpen={isOpen} toggleHamburger={toggleHamburger} />
      <HamburgerDropdown isOpen={isOpen} toggleHamburger={toggleHamburger} />
    </nav>
  )
}

export default Navbar

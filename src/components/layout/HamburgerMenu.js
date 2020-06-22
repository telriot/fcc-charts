import React from "react"
import styles from "./Navbar.module.scss"

function HamburgerMenu(props) {
  const { isOpen } = props
  const { toggleHamburger } = props
  return (
    <div className={styles.hamburger}>
      <button
        onClick={toggleHamburger}
        className={
          isOpen
            ? "hamburger hamburger--slider is-active"
            : "hamburger hamburger--slider"
        }
        type="button"
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>
    </div>
  )
}

export default HamburgerMenu

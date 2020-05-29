import React, { useRef, useEffect } from "react"
import { select } from "d3"
import useResizeObserver from "../hooks/useResizeObserver"

function BoilerPlate({ data }) {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)

  useEffect(() => {
    const svg = select(svgRef.current)
    if (!dimensions) return
  }, [data, dimensions])

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default BoilerPlate

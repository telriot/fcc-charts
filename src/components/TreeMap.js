import React, { useRef, useEffect } from "react"
import {
  select,
  treemap,
  hierarchy,
  scaleBand,
  min,
  max,
  scaleOrdinal,
} from "d3"
import useResizeObserver from "../hooks/useResizeObserver"
import movieData from "../datasets/movie-data.json"

function TreeMap() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)

  useEffect(() => {
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    if (!dimensions) return
    const { width, height } = dimensions
    const root = hierarchy(movieData).sum((d) => d.value)
    treemap().size([width, height]).padding(2)(root)

    const colors = [
      "#ff595eff",
      "#ffca3aff",
      "#8ac926ff",
      "#1982c4ff",
      "#6a4c93ff",
      "#2e294e",
      "#f18701",
      "#0b445b",
      "#612216",
      "#24201f",
      "#054d52",
    ]

    const legendKeys = movieData.children.map((children, index) => ({
      children,
      index,
    }))

    const colorScale = scaleOrdinal()
      .domain(movieData.children.map((children, index) => index))
      .range(colors)

    svg.selectAll("g").remove()
    const leaf = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .on("mouseenter", (value, index) => {
        wrapper
          .selectAll(".tooltip-tree")
          .data([value])
          .join("div")
          .attr("class", "tooltip-tree")
          .html(
            (data) =>
              `<h5>${data.data.name}</h5><p>${data.data.category}</p><p>${data.data.value} $</p>`
          )
          .style("top", (d) => {
            return window.event.pageY + height / 100 + "px"
          })
          .style("left", window.event.pageX - width / 10 + "px")
      })
      .on("mouseleave", () => wrapper.select(".tooltip-tree").remove())

    leaf
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent
        const parent = d.parent.children
        for (let i = 0; i < parent.length; i++) {
          if (parent[i].data.name === d.data.name) return colorScale(i)
        }
      })

    leaf
      .append("text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
      .join("tspan")
      .attr("x", 3)
      .attr(
        "y",
        (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
      )
      .text((d) => d)
      .style("fill", "white")
      .style("font-size", "10px")
    svg
      .selectAll(".legendDot-tree")
      .data(legendKeys)
      .join("rect")
      .attr("class", "legendDot-tree")
      .style("fill", (d) => colorScale(d.index))
      .attr("x", (data, index) => 150 + (index % 3) * 120)
      .attr(
        "y",
        (data, index) => dimensions.height + 30 + Math.floor(index / 3) * 35
      )
      .attr("width", 20)
      .attr("height", 20)
    svg
      .selectAll(".legendText-tree")
      .data(legendKeys)
      .join("text")
      .text((data, index) => data.children.name)
      .attr("class", "legendText-tree")
      .attr("x", (data, index) => 180 + (index % 3) * 120)
      .attr(
        "y",
        (data, index) => dimensions.height + 46 + Math.floor(index / 3) * 35
      )
  }, [dimensions])

  return (
    <div
      className="wrapper-tree"
      ref={wrapperRef}
      style={{ marginBottom: "20rem" }}
    >
      <svg className="chart-tree" ref={svgRef}>
        <g className="legend-tree"></g>
      </svg>
    </div>
  )
}

export default TreeMap

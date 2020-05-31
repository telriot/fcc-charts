import React, { useRef, useEffect, useState } from "react"
import { select, treemap, hierarchy, scaleOrdinal, mouse } from "d3"
import useResizeObserver from "../hooks/useResizeObserver"
import movieData from "../datasets/movie-data.json"
import kickstarterData from "../datasets/kickstarter-funding-data.json"
import data from "../datasets/video-game-sales-data.json"

const dataObj = {
  movies: movieData,
  kickstarters: kickstarterData,
  games: data,
}
const datasets = [
  { label: "Top Grossing Movies by Genre", value: "movies" },
  { label: "Most funded Kickstarters by Category", value: "kickstarters" },
  { label: "Most sold Video Games by Platform", value: "games" },
]

const colors = [
  "#ff595eff",
  "#ffca3aff",
  "#8ac926ff",
  "#1982c4ff",
  "#d0f4de",
  "#f3ca40",
  "#e4c1f9",
  "#ff69eb",
  "#f15bb5ff",
  "#5f0f40ff",
  "#00bbf9ff",
  "#00f5d4ff",
  "#86bbbd",
  "#fb8b24ff",
  "#e36414ff",
  "#dcb8cb",
  "#c0c0c0",
  "#d81159",
  "#006ba6",
  "#0ead69",
  "#f4d35e",
  "#d9dbbc",
  "#86bbbd",
  "#a6808c",
]

function TreeMap() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)
  const [options, setOptions] = useState("movies")
  const [data, setData] = useState(movieData)
  const [mB, setMB] = useState("15rem")
  const handleSelect = (e) => {
    setOptions(e.target.value)
    setData(dataObj[e.target.value])
  }
  useEffect(() => {
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    if (!dimensions) return
    const { width, height } = dimensions
    //Parse raw data
    const root = hierarchy(data).sum((d) => d.value)
    treemap().size([width, height]).padding(1)(root)

    const legendKeys = data.children.map((children, index) => ({
      children,
      index,
    }))

    //Define scales
    const colorScale = scaleOrdinal()
      .domain(data.children.map((child, index) => child.name))
      .range(colors)
    const legendItemWidth = 130
    const legendItemsPerRow = Math.floor(width / legendItemWidth)
    const legendRows = Math.floor(legendKeys.length / legendItemsPerRow)
    setMB(`${legendRows * 35 + 50}px`)

    //Create items
    svg.selectAll("g").remove()
    const leaf = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .on("mousemove", (value, index) => {
        const [x, y] = mouse(svgRef.current)
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
            return y - 100 + "px"
          })
          .style("left", (d) => {
            return x + 20 + "px"
          })
      })
      .on("mouseleave", () => wrapper.select(".tooltip-tree").remove())

    leaf
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent
        return colorScale(d.data.name)
      })
    leaf
      .append("clipPath")
      .attr("id", (d) => d.data.value)
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)

    leaf
      .append("text")
      .attr("clip-path", (d) => `url(#${d.data.value})`)
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
      .join("tspan")
      .attr("x", 3)
      .attr(
        "y",
        (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
      )
      .text((d) => d)
      .style("fill", "#222")
      .style("font-size", "9px")

    svg
      .selectAll(".legend-dot-tree")
      .data(legendKeys)
      .join("rect")
      .attr("class", "legend-dot-tree")
      .style("fill", (d) => colorScale(d.children.name))
      .attr(
        "x",
        (data, index) => 20 + (index % legendItemsPerRow) * legendItemWidth
      )
      .attr(
        "y",
        (data, index) =>
          dimensions.height + 30 + Math.floor(index / legendItemsPerRow) * 35
      )
      .attr("width", 20)
      .attr("height", 20)
    svg
      .selectAll(".legend-text-tree")
      .data(legendKeys)
      .join("text")
      .text((data, index) => data.children.name)
      .attr("class", "legend-text-tree")
      .attr(
        "x",
        (data, index) => 50 + (index % legendItemsPerRow) * legendItemWidth
      )
      .attr(
        "y",
        (data, index) =>
          dimensions.height + 46 + Math.floor(index / legendItemsPerRow) * 35
      )
  }, [dimensions, data])

  return (
    <React.Fragment>
      <div className="header">
        <h1>Treemap Charted Data</h1>
        <select className="select-tree" onChange={handleSelect} value={options}>
          {datasets.map((dataset) => (
            <option key={dataset.label} value={dataset.value}>
              {dataset.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className="wrapper-tree"
        ref={wrapperRef}
        style={{
          marginBottom: mB,
        }}
      >
        <svg className="chart-tree" ref={svgRef}>
          <g className="legend-tree"></g>
        </svg>
      </div>
    </React.Fragment>
  )
}

export default TreeMap

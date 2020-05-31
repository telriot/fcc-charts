import React, { useRef, useEffect } from "react"
import {
  select,
  mouse,
  geoPath,
  scaleSqrt,
  scaleLinear,
  min,
  max,
  zoom,
  event,
  zoomIdentity,
  zoomTransform,
} from "d3"
import { geoNaturalEarth } from "d3-geo-projection"
import useResizeObserver from "../hooks/useResizeObserver"
import meteoriteData from "../datasets/meteorite-strike-data.json"
import mapData from "../datasets/world-110m.json"

function Meteorites() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)

  useEffect(() => {
    if (!dimensions) return
    const { height, width } = dimensions
    //Define elements
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    //Define projection ratios
    const projection = geoNaturalEarth()
      .scale(width / 1.9 / Math.PI)
      .translate([width / 2, height / 2])
    const path = geoPath().projection(projection)

    //Define scales
    const massScale = scaleSqrt()
      .domain([
        min(meteoriteData.features, (d) =>
          d.properties.mass ? parseInt(d.properties.mass) : 0
        ),
        max(meteoriteData.features, (d) =>
          d.properties.mass ? parseInt(d.properties.mass) : 0
        ),
      ])
      .range([0, width / 20])

    const colorScale = scaleLinear()
      .domain([0, 1000, 1500, 1800, 1900, 1950, 2000, 2020])
      .range([
        "#ef233c",
        "#f20089",
        "#6a00f4",
        "#2d00f7",
        "#0077b6",
        "#37ff8b",
        "#1b512d",
        "#2d3a3a",
      ])

    const onZoom = zoom().scaleExtent([1, 8]).on("zoom", zoomed)

    svg.selectAll(".features").remove()
    svg.selectAll(".meteo-circle").remove()
    //Create items
    const g = svg
      .append("g")
      .selectAll("path")
      .data(mapData.features)
      .join("path")
      .attr("class", "features")
      .attr("fill", "#f3a738")
      .attr("d", path)
      .style("stroke", "#333")
      .style("stroke-width", 0.5)

    const circle = svg
      .selectAll(".meteo-circle")
      .attr("class", "bubble-meteo")
      .data(
        meteoriteData.features.sort(
          (a, b) => b.properties.mass - a.properties.mass
        )
      )
      .join("circle")
      .attr("class", "meteo-circle")
      .on("click", clicked)
      .attr("d", path)
      .attr("r", 5)
      .attr("r", (d) => massScale(parseInt(d.properties.mass)))
      .attr("cx", (d) => {
        const coordinates = projection(
          d.geometry ? d.geometry.coordinates : [0, 0]
        )
        return coordinates[0]
      })
      .attr("cy", (d) => {
        const coordinates = projection(
          d.geometry ? d.geometry.coordinates : [0, 0]
        )
        return coordinates[1]
      })
      .style("fill", (d) =>
        d.properties.year
          ? colorScale(parseInt(d.properties.year.slice(0, 4)))
          : "transparent"
      )
      .style("stroke", "#fff")
      .style("fill-opacity", 0.5)
      .on("mousemove", (value, index) => {
        const [x, y] = mouse(svgRef.current)
        wrapper
          .selectAll(".tooltip-meteo")
          .data([value])
          .join("div")
          .attr("class", "tooltip-meteo")
          .html((d) => {
            const date = new Date(d.properties.year)

            return `<h5>${d.properties.name}</h5><p>Mass: ${
              d.properties.mass
            }</p><p>Class: ${d.properties.recclass}</p><p>Lat: ${
              d.properties.reclat
            }</p><p>Year: ${date.getFullYear()}</p>`
          })
          .style("top", `${y + 10}px`)
          .style("left", `${x + 10}px`)
      })
      .on("mouseleave", () => wrapper.select(".tooltip-meteo").remove())

    svg.call(onZoom)
    wrapper.on("click", reset)

    //Zoom related functions
    function reset() {
      svg
        .transition()
        .duration(750)
        .call(
          onZoom.transform,
          zoomIdentity,
          zoomTransform(svg.node()).invert([width / 2, height / 2])
        )
    }
    function clicked(d) {
      const [[x0, y0], [x1, y1]] = path.bounds(d)
      event.stopPropagation()
      svg
        .transition()
        .duration(750)
        .call(
          onZoom.transform,
          zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
              Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          mouse(svg.node())
        )
    }
    function zoomed() {
      const { transform } = event
      g.attr("transform", transform)
      circle.attr("transform", transform)
    }
  }, [mapData, meteoriteData, dimensions])

  return (
    <React.Fragment>
      <div className="header">
        <h1>Meteorite Strikes Across the Globe</h1>
      </div>

      <div className="wrapper-meteo" ref={wrapperRef}>
        <svg className="chart-meteo" ref={svgRef}></svg>
      </div>
    </React.Fragment>
  )
}

export default Meteorites

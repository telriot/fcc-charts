import React, { useRef, useEffect, useState } from "react"
import { select, geoPath, scaleLinear, min, max, axisBottom, mouse } from "d3"
import { feature, mesh } from "topojson"
import useResizeObserver from "../hooks/useResizeObserver"
import { useScrollPosition } from "../hooks/useScrollPosition"
import countiesData from "../datasets/counties.json"
import education from "../datasets/education.json"

function Choropleth({ data }) {
  const [width, setWidth] = useState(0)
  const svgRef = useRef()
  const wrapperRef = useRef()

  const dimensions = useResizeObserver(wrapperRef)

  const usCounties = feature(countiesData, countiesData.objects.counties)
  const usStates = mesh(
    countiesData,
    countiesData.objects.states,
    (a, b) => a !== b
  )
  const path = geoPath()

  const colors = [
    "rgb(220, 250, 220)",
    "rgb(50, 150, 38)",
    "rgb(0, 50, 4)",
    "rgb(0, 20, 4)",
  ]

  useEffect(() => {
    if (!dimensions) return
    const { height, width } = dimensions
    setWidth(width)
    //SELECTORS
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    //STYLE VARIABLES
    const legendWidth = parseInt(width / 3)
    const legendHeight = parseInt(30 * height) / 800
    const scaleRatio = width / 1075
    const translateXRatio = (72 * width) / 1075
    //SCALES
    const colorScale = scaleLinear()
      .domain([
        min(education, (education) => education.bachelorsOrHigher),
        min(education, (education) => education.bachelorsOrHigher) +
          (max(education, (education) => education.bachelorsOrHigher) -
            min(education, (education) => education.bachelorsOrHigher)) /
            3,
        min(education, (education) => education.bachelorsOrHigher) +
          ((max(education, (education) => education.bachelorsOrHigher) -
            min(education, (education) => education.bachelorsOrHigher)) /
            3) *
            2,
        max(education, (education) => education.bachelorsOrHigher),
      ])
      .range(colors)
    const legendScale = scaleLinear()
      .domain([
        min(education, (education) => education.bachelorsOrHigher),
        max(education, (education) => education.bachelorsOrHigher),
      ])
      .range([0, legendWidth])
    const legendColorScale = scaleLinear()
      .domain([0, 100, 200, 300])
      .range(colors)
    const legendAxis = axisBottom(legendScale).tickSizeOuter([0])
    //ELEMENTS
    //Map
    svg
      .selectAll(".path-choro")
      .data(usCounties.features)
      .join("path")
      .attr("d", path)
      .attr("class", "path-choro")
      .style("stroke", "white")
      .style("stroke-width", ".3")
      .style(
        "transform",
        `scale(${scaleRatio}, ${scaleRatio}) translateX(${translateXRatio}px)`
      )
      .attr("fill", (data) => {
        const target = education.filter((obj) => obj.fips === data.id) || 0
        return colorScale(target[0].bachelorsOrHigher)
      })
      .on("mouseenter", (value, index) => {
        const [x, y] = mouse(svgRef.current)
        wrapper
          .selectAll(".tooltip-choro")
          .data([value])
          .join("div")
          .attr("class", "tooltip-choro")
          .html((data) => {
            const target = education.filter((obj) => obj.fips === data.id) || 0
            return `<h5>${target[0].area_name}, ${target[0].state}</h5><p>${target[0].bachelorsOrHigher} %</p>`
          })
          .style("top", `${y - 80}px`)
          .style("left", `${x}px`)
      })
      .on("mouseleave", () => wrapper.select(".tooltip-choro").remove())
    //State lines
    svg.selectAll(".state-path").remove()
    svg
      .append("path")
      .data([usStates])
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("class", "state-path")
      .attr("stroke-linejoin", "round")
      .attr("d", path)
      .style(
        "transform",
        `scale(${scaleRatio}, ${scaleRatio}) translateX(${translateXRatio}px)`
      )
    //Legend
    svg
      .select(".legend-choro")
      .style(
        "transform",
        `translate( ${width / 2 - legendWidth / 2}px,  ${height - 30}px)`
      )
      .call(legendAxis)

    svg
      .selectAll(".color-choro")
      .data(Array(legendWidth))
      .join("rect")
      .attr("class", "color-choro")
      .attr("x", (data, index) => `${index - legendWidth / 2 + width / 2}px`)
      .attr("y", `${height - 30 - legendHeight}px`)
      .attr("height", legendHeight)
      .attr("width", 1)
      .attr("fill", (data, index) => legendColorScale(index))
  }, [data, dimensions])

  return (
    <React.Fragment>
      <div className="header">
        <h1>United States Educational Attainment</h1>
        <h5>
          Percentage of adults age 25 and older with a bachelor's degree or
          higher (2010-2014)
        </h5>
      </div>

      <div
        className="wrapper-choro"
        style={{ height: `${width * 0.75}px` }}
        ref={wrapperRef}
      >
        <svg className="chart-choro" ref={svgRef}>
          {" "}
          <g className="legend-choro"></g>
        </svg>
      </div>
    </React.Fragment>
  )
}

export default Choropleth

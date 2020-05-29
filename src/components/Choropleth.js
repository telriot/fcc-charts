import React, { useRef, useEffect, useState } from "react"
import { select, geoPath, scaleLinear, min, max, axisBottom } from "d3"
import { feature, mesh } from "topojson"
import useResizeObserver from "../hooks/useResizeObserver"
import { useScrollPosition } from "../hooks/useScrollPosition"
import countiesData from "../datasets/counties.json"
import education from "../datasets/education.json"

function Choropleth({ data }) {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const [wrapperPos, setWrapperPos] = useState({ x: 10, y: 0 })

  let wrapperPosition = useScrollPosition(
    ({ currPos }) => {
      setWrapperPos(currPos)
    },
    [window.scroll],
    wrapperRef,
    undefined,
    500,
    true
  )

  const colors = [
    "rgb(207, 246, 201)",
    "rgb(115, 248, 63)",
    "rgb(49, 170, 38)",
    "rgb(0, 82, 4)",
  ]
  const dimensions = useResizeObserver(wrapperRef)
  const usCounties = feature(countiesData, countiesData.objects.counties)
  const usStates = mesh(
    countiesData,
    countiesData.objects.states,
    (a, b) => a !== b
  )
  const [width, setWidth] = useState(800)
  const path = geoPath()
  useEffect(() => {
    if (!dimensions) return
    const { height, width } = dimensions

    setWidth(width)
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
      .range([0, 300])
    const legendColorScale = scaleLinear()
      .domain([0, 100, 200, 300])
      .range(colors)
    const legendAxis = axisBottom(legendScale).tickSizeOuter([0])
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    svg
      .selectAll(".path-choro")
      .data(usCounties.features)
      .join("path")
      .attr("d", path)
      .attr("class", "path-choro")
      .style("stroke", "white")
      .style("stroke-width", ".3")
      .style("transform", `scale(${width / 1000}, ${width / 1000})`)
      .attr("fill", (data) => {
        const target = education.filter((obj) => obj.fips === data.id) || 0
        return colorScale(target[0].bachelorsOrHigher)
      })
      .on("mouseenter", function (value, index) {
        wrapper
          .selectAll(".tooltip-choro")
          .data([value])
          .join("div")
          .attr("class", "tooltip-choro")
          .html((data) => {
            const target = education.filter((obj) => obj.fips === data.id) || 0
            return `<p>${target[0].area_name}, ${target[0].state}</p><p>${target[0].bachelorsOrHigher} %</p>`
          })
          .style("top", `${window.event.clientY - wrapperPos.y - 60}px`)
          .style("left", `${window.event.clientX - wrapperPos.x + 20}px`)
      })
      .on("mouseleave", () => wrapper.select(".tooltip-choro").remove())

    svg.selectAll(".country-path").remove()
    svg
      .append("path")
      .data([usStates])
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("class", "country-path")
      .attr("stroke-linejoin", "round")
      .attr("d", path)
      .style("transform", `scale(${width / 1000}, ${width / 1000})`)

    svg
      .select(".legend-choro")
      .style("transform", `translate( ${width / 4}px,  ${height - 50}px)`)
      .call(legendAxis)

    svg
      .selectAll(".color-choro")
      .data(Array(300))
      .join("rect")
      .attr("class", "color-choro")
      .attr("x", (data, index) => `${index + width / 4}px`)
      .attr("y", `${height - 80}px`)
      .attr("height", 30)
      .attr("width", 1)
      .attr("fill", (data, index) => legendColorScale(index))
  }, [data, dimensions, wrapperPos])

  return (
    <React.Fragment>
      <h1>United States Educational Attainment</h1>
      <h5>
        Percentage of adults age 25 and older with a bachelor's degree or higher
        (2010-2014)
      </h5>
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

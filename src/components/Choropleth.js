import React, { useRef, useEffect } from "react"
import { select, geoAlbers, geoPath, scaleLinear } from "d3"
import { feature, mesh } from "topojson"
import useResizeObserver from "../hooks/useResizeObserver"
import countiesData from "../datasets/counties.json"
import education from "../datasets/education.json"

const { counties } = countiesData.objects

function Choropleth({ data }) {
  const svgRef = useRef()

  const wrapperRef = useRef()
  const colors = ["#cae6f1", "#5bc3eb", "#1688b6", "#0b445b"]
  const dimensions = useResizeObserver(wrapperRef)
  const usCounties = feature(countiesData, countiesData.objects.counties)
  const usStates = mesh(
    countiesData,
    countiesData.objects.states,
    (a, b) => a !== b
  )
  const path = geoPath()
  useEffect(() => {
    if (!dimensions) return
    const { height, width } = dimensions
    const colorScale = scaleLinear().domain([0, 25, 50, 100]).range(colors)
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
      .style("transform", "translate(300px, 75px)")
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
          .style("top", window.event.pageY - 70 + "px")
          .style("left", window.event.pageX - 230 + "px")
      })
      .on("mouseleave", () => wrapper.select(".tooltip-choro").remove())
    console.log(usStates)
    svg
      .append("path")
      .data([usStates])
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path)
      .style("transform", "translate(300px, 75px)")
  }, [data, dimensions])

  return (
    <div className="wrapper-choro" ref={wrapperRef}>
      <svg className="chart-choro" ref={svgRef}></svg>
      <g className="legend-choro"></g>
    </div>
  )
}

export default Choropleth

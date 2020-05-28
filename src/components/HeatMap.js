import React, { useRef, useEffect } from "react"
import {
  select,
  axisBottom,
  axisLeft,
  scaleBand,
  min,
  max,
  scaleLinear,
} from "d3"
import useResizeObserver from "../hooks/useResizeObserver"
import heatData from "../datasets/global-temperature.json"

function HeatMap() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)
  const data = heatData.monthlyVariance
  const base = heatData.baseTemperature

  const getParsedTime = (el) => {
    const date = new Date(el.toString())
    return date
  }
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const parseMonths = (time) => {
    const options = { month: "long" }
    return new Intl.DateTimeFormat(undefined, options).format(time)
  }

  const colors = ["#1688b6", "#cae6f1", "#ff8555", "#e6152e"]
  useEffect(() => {
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    if (!dimensions) return
    //SCALES
    const xScale = scaleBand()
      .domain(data.map((el) => getParsedTime(el.year)))
      .range([0, dimensions.width])
    const yScale = scaleBand()
      .domain(months.map((el) => getParsedTime(el)))
      .range([dimensions.height, 0])
    const xTickScale = scaleBand()
      .domain(
        data
          .filter((el) => el.year % 10 === 0 && el.month === 1)
          .map((el) => el.year)
      )
      .range([0, dimensions.width])
    const colorScale = scaleLinear()
      .domain([
        min(data, (data) => data.variance),
        min(data, (data) => data.variance) +
          (max(data, (data) => data.variance) -
            min(data, (data) => data.variance)) /
            3,
        min(data, (data) => data.variance) +
          (max(data, (data) => data.variance) -
            min(data, (data) => data.variance) / 3) *
            2,
        max(data, (data) => data.variance),
      ])
      .range(colors)
    const legendScale = scaleLinear()
      .domain([
        min(data, (data) => data.variance),
        max(data, (data) => data.variance),
      ])
      .range([0, 300])
    const legendColorScale = scaleLinear()
      .domain([0, 100, 200, 300])
      .range(colors)

    //AXES
    const xAxis = axisBottom(xTickScale)
    const yAxis = axisLeft(yScale).tickFormat((time) => parseMonths(time))
    const legendAxis = axisBottom(legendScale)
    //SVGS
    svg
      .select(".x-axis")
      .style("transform", `translateY(${dimensions.height}px)`)

      .call(xAxis)
    svg.select(".y-axis").call(yAxis)
    svg
      .select(".legend-heat")
      .style("transform", `translate( 30px, ${dimensions.height + 100}px)`)
      .call(legendAxis)

    svg
      .selectAll(".cell-heat")
      .data(data)
      .join("rect")
      .attr("class", "cell-heat")
      .attr("x", (data) => `${xScale(getParsedTime(data.year))}px`)
      .attr("y", (data) => `${yScale(getParsedTime(data.month))}px`)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (data) => colorScale(data.variance))
      .on("mouseenter", (value, index) => {
        wrapper
          .selectAll(".tooltip-heat")
          .data([value])
          .join("div")
          .attr("class", "tooltip-heat")
          .html(
            `<p>${value.year} - ${parseMonths(
              getParsedTime(value.month)
            )}</p><p>${(value.variance + base).toFixed(3)}</p><p>Variance: ${
              value.variance
            }</p>`
          )
          .style("top", (data) => `${yScale(getParsedTime(data.month)) - 85}px`)
          .style("left", (data) => `${xScale(getParsedTime(data.year)) - 30}px`)
      })
      .on("mouseleave", () => wrapper.select(".tooltip-heat").remove())

    svg
      .selectAll(".color-heat")
      .data(Array(300))
      .join("rect")
      .attr("class", "color-heat")
      .attr("x", (data, index) => `${index + 30}px`)
      .attr("y", `${dimensions.height + 70}px`)
      .attr("height", 30)
      .attr("width", 1)
      .attr("fill", (data, index) => legendColorScale(index))
    svg
      .selectAll(".legend-text")
      .data(["Temperature variation scale"])
      .join("text")
      .text((data) => data)
      .attr("class", "legend-text")
      .attr("x", 110)
      .attr("y", dimensions.height + 50)
      .style("font-weight", "300")
      .style("font-size", ".75rem")
  }, [data, dimensions])

  return (
    <React.Fragment>
      <h1>Monthly Global Land-Surface Temperature</h1>
      <h2>1753 - 2015: base temperature 8.66℃</h2>
      <div ref={wrapperRef} className="wrapper-heat">
        <svg ref={svgRef} className="chart-heat">
          <g className="x-axis"></g>
          <g className="y-axis"></g>
          <g className="legend-heat"></g>
        </svg>
      </div>
    </React.Fragment>
  )
}

export default HeatMap

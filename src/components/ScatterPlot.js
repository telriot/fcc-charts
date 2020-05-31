import React, { useRef, useEffect } from "react"
import { select, scaleTime, axisBottom, axisLeft, min, max } from "d3"
import useResizeObserver from "../hooks/useResizeObserver"
import data from "../datasets/scatterPlotData"

function ScatterPlot() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)
  const getSeconds = (el) => {
    const time = new Date(1970, 0, 1)
    time.setSeconds(el)
    return time
  }
  const getYears = (el) => {
    const date = new Date(el.toString())
    return date
  }
  const colorScheme = ["#f20089", "#29bf12"]

  const legendKeys = ["Riders with doping allegations", "No doping allegations"]
  useEffect(() => {
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    if (!dimensions) return

    const xScale = scaleTime()
      .domain([
        min(data, (el) => getYears(el.Year - 1)),
        max(data, (el) => getYears(el.Year + 1)),
      ])
      .range([0, dimensions.width])
    const yScale = scaleTime()
      .domain([
        max(data, (el) => getSeconds(el.Seconds + 7)),
        min(data, (el) => getSeconds(el.Seconds - 10)),
      ])
      .range([dimensions.height, 0])

    const xAxis = axisBottom(xScale)
    const yAxis = axisLeft(yScale).tickFormat((time) => {
      return time.toLocaleTimeString(undefined, {
        minute: "2-digit",
        second: "2-digit",
      })
    })
    const getX = (dimensions) => dimensions.width - 50

    svg
      .select(".x-axis")
      .style("transform", `translateY(${dimensions.height}px)`)
      .call(xAxis)
    svg.select(".y-axis").call(yAxis)

    svg
      .selectAll(".circle")
      .data(data)
      .join("circle")
      .attr("class", "circle")
      .attr("r", 12)
      .attr("stroke", "#222")
      .attr("stroke-width", 0.5)
      .attr("cx", (el) => xScale(getYears(el.Year)))
      .attr("cy", (el) => yScale(getSeconds(el.Seconds)))
      .style("fill", (el) => (el.Doping ? colorScheme[0] : colorScheme[1]))
      .on("mouseenter", (value, index) => {
        wrapper
          .selectAll(".tooltip-scatter")
          .data([value])
          .join("div")
          .attr("class", "tooltip-scatter")
          .html(
            `<h5>${value.Name}: ${value.Nationality}</h5><p>Year: ${
              value.Year
            }, Time: ${value.Time}</p>${
              value.Doping ? "<p>" + value.Doping + "</p>" : ""
            }`
          )
          .style("top", `${yScale(getSeconds(value.Seconds)) - 110}px`)
          .style("left", `${xScale(getYears(value.Year)) + 5}px`)
      })
      .on("mouseleave", () => wrapper.select(".tooltip-scatter").remove())

    svg
      .selectAll(".timeLegend")
      .data(["Time in Minutes"])
      .join("text")
      .text((data) => data)
      .attr("class", "timeLegend")
      .attr("x", -200)
      .attr("y", -60)
      .style("transform", "rotate(-90deg)")
      .style("font-weight", "300")

    svg
      .selectAll(".legendDot")
      .data(legendKeys)
      .join("rect")
      .attr("class", "legendDot")
      .style("fill", (data, index) => colorScheme[index])
      .attr("x", dimensions.width - 50)
      .attr("y", (data, index) => dimensions.height / 4 + index * 25)
      .attr("width", 20)
      .attr("height", 20)
    svg
      .selectAll(".legendText")
      .data(legendKeys)
      .join("text")
      .attr("class", "legendDot")
      .text((data, index) => legendKeys[index])
      .attr("x", dimensions.width - 60)
      .attr("y", (data, index) => dimensions.height / 4 + index * 25 + 14)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#222")
      .style("font-size", "12px")
      .style("font-weight", "300")
      .attr("text-anchor", "end")
  }, [data, dimensions])

  return (
    <React.Fragment>
      <div className="header">
        <h1>Doping in Professional Bicycle Racing</h1>
        <h5>35 Fastest times up Alpe d'Huez</h5>
      </div>

      <div className="wrapper-scatter" ref={wrapperRef}>
        <svg className="chart-scatter" ref={svgRef}>
          <g className="x-axis"></g>
          <g className="y-axis"></g>
        </svg>
      </div>
    </React.Fragment>
  )
}

export default ScatterPlot

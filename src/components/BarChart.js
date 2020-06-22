import React, { useRef, useEffect } from "react"
import {
  select,
  scaleLinear,
  scaleBand,
  min,
  max,
  axisBottom,
  axisLeft,
} from "d3"
import useResizeObserver from "../hooks/useResizeObserver"
import fedData from "../datasets/barChartData"

function BarChart() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)
  const { data } = fedData

  const convertToQuarter = (date) => {
    let month = date.slice(5, 7)
    let year = date.slice(0, 4)
    return month === "01"
      ? `Q-${1} ${year}`
      : month === "04"
      ? `Q-${2} ${year}`
      : month === "07"
      ? `Q-${3} ${year}`
      : month === "10"
      ? `Q-${4} ${year}`
      : null
  }
  useEffect(() => {
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    if (!dimensions) return
    const isSM = dimensions.width < 500
    const tickScale = scaleBand()
      .domain(
        data
          .map((el) => el[0].slice(0, 4))
          .filter((el) => (isSM ? el % 10 === 0 : el % 5 === 0))
      )
      .range([0, dimensions.width])

    const xScale = scaleBand()
      .domain(data.map((value, index) => index))
      .range([0, dimensions.width])
    const yScale = scaleLinear()
      .domain([0, max(data, (quarter) => quarter[1])])
      .range([dimensions.height, 0])
    const colorScale = scaleLinear()
      .domain([
        min(data, (quarter) => quarter[1]),
        max(data, (quarter) => quarter[1]),
      ])
      .range(["orange", "red"])

    const xAxis = axisBottom(tickScale)

    svg
      .select(".x-axis")
      .style("transform", `translateY(${dimensions.height}px)`)
      .call(xAxis)
    const yAxis = axisLeft(yScale)
    svg.select(".y-axis").call(yAxis)
    svg
      .selectAll(".info")
      .data([fedData.source_name])
      .join("text")
      .text(fedData.source_name)
      .attr("class", "info")
      .attr("x", -275)
      .attr("y", 25)
      .style("transform", "rotate(-90deg)")
      .style("font-weight", "300")
      .style("font-size", ".825rem")
    svg
      .selectAll(".link")
      .data([fedData.description])
      .join("text")
      .text("More info at http://www.bea.gov/national/pdf/nipaguid.pdf")
      .attr("class", "info")
      .attr("x", isSM ? dimensions.width - 220 : dimensions.width - 350)
      .attr("y", dimensions.height + 40)
      .style("font-weight", "300")
      .style("font-size", ".75rem")
    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .style("transform", "scale(1,-1)")
      .attr("x", (value, index) => xScale(index))
      .attr("y", -dimensions.height)
      .attr("width", xScale.bandwidth())
      .on("mouseenter", (value, index) => {
        wrapper
          .selectAll(".tooltip")
          .data([value])
          .join("div")
          .attr("class", "tooltip")
          .html(
            `<h5>${convertToQuarter(value[0])}</h5><p>$ ${value[1]} Billion</p>`
          )
          .style("top", `${yScale(value[1]) - 100}px`)
          .style("left", `${xScale(index) + xScale.bandwidth() / 2}px`)
      })
      .on("mouseleave", () => wrapper.select(".tooltip").remove())

      .attr("fill", (value) => colorScale(value[1]))
      .attr("height", (value) => dimensions.height - yScale(value[1]))
  }, [data, dimensions])

  return (
    <React.Fragment>
      <div className="header">
        <h1>United States GDP</h1>
      </div>

      <div className="wrapper-bar" ref={wrapperRef}>
        <svg className="chart-bar" ref={svgRef}>
          <g className="x-axis"></g>
          <g className="y-axis"></g>
        </svg>
      </div>
    </React.Fragment>
  )
}

export default BarChart

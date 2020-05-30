import React, { useRef, useEffect } from "react"
import {
  select,
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceLink,
  mouse,
  drag,
  event,
} from "d3"
import data from "../datasets/countries.json"

var context = require.context("../img/separate", true, /\.(png)$/)
var images = {}

context.keys().forEach((filename) => {
  images[filename] = context(filename)
})

function ForceChart() {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = { width: window.innerWidth, height: window.innerHeight }
  function getBB(selection) {
    selection.each(function (d) {
      d.bbox = this.getBBox()
    })
  }
  useEffect(() => {
    const svg = select(svgRef.current)
    if (!dimensions) return

    const { width, height } = dimensions

    svg.attr("viewBox", [0, 0, width, height])

    const links = data.links.map((d) => ({ ...d }))
    const nodes = data.nodes.map((d) => ({ ...d }))

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(data.links).id((d) => d.index)
      )
      .force(
        "charge",
        forceManyBody()
          .strength(-10)
          .distanceMax(width / 5)
      )

      .force("center", forceCenter(width / 2, height / 2))

    const dragHasStarted = (d, simulation) => {
      if (!event.active) simulation.restart().alpha(0.7)
      d.fx = d.x
      d.fy = d.y
      svg.select(".flag-tooltip").remove()
    }
    const isDragging = (d) => {
      d.fx = event.x
      d.fy = event.y
    }
    const dragHasStopped = (d, simulation) => {
      if (!event.active) simulation.alphaTarget(0.0)
      d.fx = null
      d.fy = null
    }

    const link = svg
      .selectAll(".link")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "black")
      .attr("fill", "none")

    const label = svg
      .selectAll("image")
      .data(nodes)
      .join("image")
      .attr("xlink:href", (d) => images[`./${d.code}.png`])
      .attr("class", (d) => d.code)
      .attr("height", 40)
      .attr("width", 40)
      .call(
        drag()
          .on("start", (d) => dragHasStarted(d, simulation))
          .on("drag", (d) => isDragging(d))
          .on("end", (d) => dragHasStopped(d, simulation))
      )
      .on("mousemove", (value, index) => {
        const [x, y] = mouse(svgRef.current)
        svg.select(".flag-tooltip").remove()
        const tooltip = svg
          .selectAll(".flag-tooltip")
          .data([value])
          .join("g")
          .attr("class", "flag-tooltip")
        tooltip
          .append("text")
          .text((d) => d.country)
          .style("font-size", "16px")
          .attr("fill", "transparent")
          .call(getBB)
        tooltip
          .append("rect")
          .attr("class", "flag-text-bg")
          .attr("width", function (d) {
            return d.bbox.width + 16
          })
          .attr("height", function (d) {
            return d.bbox.height + 10
          })
          .attr("x", x + 11)
          .attr("y", y - 39)
          .attr("fill", "#222")
          .attr("opacity", 0.8)
        tooltip
          .append("text")
          .attr("class", "flag-text")
          .text((d) => d.country)
          .style("font-size", "16px")
          .attr("fill", "#fff")
          .attr("x", x + 20)
          .attr("y", y - 20)
      })
      .on("mouseleave", () => svg.select(".flag-tooltip").remove())

    simulation.on("tick", () => {
      link
        .attr("x1", (link) => nodes[link.source].x)
        .attr("y1", (link) => nodes[link.source].y)
        .attr("x2", (link) => nodes[link.target].x)
        .attr("y2", (link) => nodes[link.target].y)

      label.attr("x", (node) => node.x - 20).attr("y", (node) => node.y - 20)
    })
  }, [data])

  return (
    <div className="wrapper-force" ref={wrapperRef}>
      <svg className="chart-force" ref={svgRef}></svg>
    </div>
  )
}

export default ForceChart

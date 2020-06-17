import React, { useRef, useEffect, useState } from "react"
import {
  select,
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceLink,
  mouse,
  drag,
  event,
  zoom,
} from "d3"
import data from "../datasets/countries.json"

//bulk import for the flag pngs
let context = require.context("../img/separate", true, /\.(png)$/)
let images = {}
context.keys().forEach((filename) => {
  images[filename] = context(filename)
})

function ForceChart() {
  let svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = { width: window.innerWidth, height: window.innerHeight }
  const [isRunning, setIsRunning] = useState(false)
  function getBB(selection) {
    selection.each(function (d) {
      d.bbox = this.getBBox()
    })
  }
  const deepCopy = (inObject) => {
    let outObject, value, key

    if (typeof inObject !== "object" || inObject === null) {
      return inObject // Return the value if inObject is not an object
    }

    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {}

    for (key in inObject) {
      value = inObject[key]

      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepCopy(value)
    }

    return outObject
  }

  useEffect(() => {
    console.log("effect")
    if (!dimensions) return
    let svg = select(svgRef.current)
    const { width, height } = dimensions

    svg.attr("viewBox", [0, 0, width, height])
    //parse data for use
    let dataCopy = deepCopy(data)
    let links = dataCopy.links.map((d) => ({ ...d }))
    let nodes = dataCopy.nodes.map((d) => ({ ...d }))
    //create forces

    let simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(dataCopy.links).id((d) => d.index)
      )
      .force(
        "charge",
        forceManyBody()
          .strength(-10)
          .distanceMax(width / 5)
      )
      .force("center", forceCenter(width / 2, height / 2))
    //handle drag
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
    //create items
    const link = svg
      .selectAll(".link")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#ddd")
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
        //create transparent text element to get size for the bg
        tooltip
          .append("text")
          .text((d) => d.country)
          .style("font-size", "16px")
          .attr("fill", "transparent")
          .call(getBB)
        //bg
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
        //actual text
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
    //determine changes when forces are active

    simulation.on("tick", () => {
      link
        .attr("x1", (link, index) => nodes[link.source].x)
        .attr("y1", (link) => nodes[link.source].y)
        .attr("x2", (link) => nodes[link.target].x)
        .attr("y2", (link) => nodes[link.target].y)
      label.attr("x", (node) => node.x - 20).attr("y", (node) => node.y - 20)
    })

    const onZoom = zoom().scaleExtent([1, 8]).on("zoom", zoomed)
    svg.call(onZoom)
    function zoomed() {
      const { transform } = event
      label.attr("transform", transform)
      link.attr("transform", transform)
    }
    return () => {}
  }, [data])

  return (
    <React.Fragment>
      <div className="header">
        <h1>National Contiguity with a Force Directed Graph</h1>
      </div>

      <div className="wrapper-force" ref={wrapperRef}>
        <svg className="chart-force" ref={svgRef}></svg>
      </div>
    </React.Fragment>
  )
}

export default ForceChart

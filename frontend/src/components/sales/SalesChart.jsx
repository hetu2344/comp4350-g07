"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

function SalesChart({ type, data, options, height = "300px" }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    if (chartRef.current && data) {
      chartInstance.current = new Chart(chartRef.current, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options,
        },
      })
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, type, options])

  return (
    <div style={{ height }}>
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default SalesChart


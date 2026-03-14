"use client"

import { useEffect, useRef } from "react"


export default function DrawingBoard() {
const canvasRef = useRef<HTMLCanvasElement | null>(null)
const toolbarRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
const canvas = canvasRef.current
const toolbar = toolbarRef.current
if (!canvas || !toolbar) return



const ctx = canvas.getContext("2d")
if (!ctx) return

const canvasOffsetX = canvas.offsetLeft
const canvasOffsetY = canvas.offsetTop

canvas.width = window.innerWidth - canvasOffsetX
canvas.height = window.innerHeight - canvasOffsetY

let isPainting = false
let lineWidth = 5
let startX = 0
let startY = 0

const draw = (e: MouseEvent) => {
  if (!isPainting) return

  ctx.lineWidth = lineWidth
  ctx.lineCap = "round"

  ctx.lineTo(e.clientX - canvasOffsetX, e.clientY - canvasOffsetY)
  ctx.stroke()
}

const mouseDown = (e: MouseEvent) => {
  isPainting = true

  startX = e.clientX
  startY = e.clientY

  ctx.beginPath()
  ctx.moveTo(startX - canvasOffsetX, startY - canvasOffsetY)
}

const mouseUp = () => {
  if (!isPainting) return

  isPainting = false
  ctx.stroke()
  ctx.beginPath()
}

const toolbarClick = (e: Event) => {
  const target = e.target as HTMLElement

  if (target.id === "clear") {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const toolbarChange = (e: Event) => {
  const target = e.target as HTMLInputElement

  if (target.id === "stroke") {
    ctx.strokeStyle = target.value
  }

  if (target.id === "lineWidth") {
    lineWidth = Number(target.value)
  }
}

canvas.addEventListener("mousedown", mouseDown)
canvas.addEventListener("mouseup", mouseUp)
canvas.addEventListener("mousemove", draw)

toolbar.addEventListener("click", toolbarClick)
toolbar.addEventListener("change", toolbarChange)

return () => {
  canvas.removeEventListener("mousedown", mouseDown)
  canvas.removeEventListener("mouseup", mouseUp)
  canvas.removeEventListener("mousemove", draw)

  toolbar.removeEventListener("click", toolbarClick)
  toolbar.removeEventListener("change", toolbarChange)

}


}, [])

  return (
    <section className="h-screen flex text-white overflow-hidden">
      <div
        id="toolbar"
        ref={toolbarRef}
        className="flex flex-col gap-[6px] p-4 w-48 bg-neutral-900"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#91EAE4] via-[#86A8E7] to-[#7F7FD5] bg-clip-text text-transparent">
          Draw.
        </h1>
    
        <label htmlFor="stroke" className="text-[12px]">Stroke</label>
        <input id="stroke" type="color" className="w-full" />
    
        <label htmlFor="lineWidth" className="text-[12px]">Line Width</label>
        <input
          id="lineWidth"
          type="number"
          defaultValue={5}
          className="w-full text-black px-1"
        />
    
        <button
          id="clear"
          className="bg-blue-500 rounded-[4px] text-white px-[2px] py-[2px] hover:bg-blue-600"
        >
          Clear
        </button>
      </div>
      
      <div className="flex-1 bg-white">
        <canvas
          id="drawing-board"
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
    </section>
  )
}

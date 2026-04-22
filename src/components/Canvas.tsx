import { useRef, useEffect, useCallback, useState } from 'react'
import { Point } from '../types'
import './Canvas.css'

interface CanvasProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

const Canvas = ({ onCanvasReady }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(5)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = color
    context.lineWidth = lineWidth

    contextRef.current = context

    saveToHistory()

    if (onCanvasReady) {
      onCanvasReady(canvas)
    }
  }, [])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(prev => [...prev.slice(0, historyIndex + 1), imageData])
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    const newIndex = historyIndex - 1
    const imageData = history[newIndex]
    if (imageData && typeof imageData === 'object' && 'width' in imageData && 'height' in imageData) {
      context.putImageData(imageData, 0, 0)
      setHistoryIndex(newIndex)
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    const newIndex = historyIndex + 1
    const imageData = history[newIndex]
    if (imageData && typeof imageData === 'object' && 'width' in imageData && 'height' in imageData) {
      context.putImageData(imageData, 0, 0)
      setHistoryIndex(newIndex)
    }
  }, [historyIndex, history])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }, [saveToHistory])

  const getCoordinates = (event: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    if ('touches' in event) {
      const touch = event.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  const startDrawing = (event: MouseEvent | TouchEvent) => {
    const coordinates = getCoordinates(event)
    if (!coordinates) return

    const context = contextRef.current
    if (!context) return

    context.beginPath()
    context.moveTo(coordinates.x, coordinates.y)
    setIsDrawing(true)
  }

  const draw = (event: MouseEvent | TouchEvent) => {
    if (!isDrawing) return

    const coordinates = getCoordinates(event)
    if (!coordinates) return

    const context = contextRef.current
    if (!context) return

    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    context.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth
    context.lineTo(coordinates.x, coordinates.y)
    context.stroke()
  }

  const stopDrawing = () => {
    const context = contextRef.current
    if (!context) return

    context.closePath()
    setIsDrawing(false)
    saveToHistory()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('mousedown', startDrawing as any)
    canvas.addEventListener('mousemove', draw as any)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    canvas.addEventListener('touchstart', startDrawing as any)
    canvas.addEventListener('touchmove', draw as any)
    canvas.addEventListener('touchend', stopDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing as any)
      canvas.removeEventListener('mousemove', draw as any)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseout', stopDrawing)

      canvas.removeEventListener('touchstart', startDrawing as any)
      canvas.removeEventListener('touchmove', draw as any)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [isDrawing, color, lineWidth, tool])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    setTool('brush')
  }

  const handleLineWidthChange = (newWidth: number) => {
    setLineWidth(newWidth)
  }

  const handleToolChange = (newTool: 'brush' | 'eraser') => {
    setTool(newTool)
  }

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#ff6b00', '#ffff00', 
    '#00ff00', '#00ffff', '#0000ff', '#8b00ff', '#ff69b4'
  ]

  return (
    <div className="canvas-container">
      <div className="toolbar">
        <div className="tool-section">
          <span className="tool-label">工具</span>
          <div className="tool-buttons">
            <button 
              className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
              onClick={() => handleToolChange('brush')}
              title="画笔"
            >
              🖌️
            </button>
            <button 
              className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => handleToolChange('eraser')}
              title="橡皮擦"
            >
              🧹
            </button>
          </div>
        </div>

        <div className="tool-section">
          <span className="tool-label">颜色</span>
          <div className="color-palette">
            {colors.map((c) => (
              <button
                key={c}
                className={`color-btn ${color === c && tool === 'brush' ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => handleColorChange(c)}
              />
            ))}
          </div>
        </div>

        <div className="tool-section">
          <span className="tool-label">粗细: {lineWidth}px</span>
          <input
            type="range"
            min="1"
            max="30"
            value={lineWidth}
            onChange={(e) => handleLineWidthChange(Number(e.target.value))}
            className="line-width-slider"
          />
        </div>

        <div className="tool-section">
          <div className="action-buttons">
            <button 
              className="action-btn" 
              onClick={undo}
              disabled={historyIndex <= 0}
              title="撤销"
            >
              ↩️ 撤销
            </button>
            <button 
              className="action-btn" 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="重做"
            >
              ↪️ 重做
            </button>
            <button 
              className="action-btn clear" 
              onClick={clearCanvas}
              title="清空"
            >
              🗑️ 清空
            </button>
          </div>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
        />
      </div>
    </div>
  )
}

export default Canvas

import { useState, useRef, useCallback } from 'react'
import Canvas from '../components/Canvas'
import GuessResultComponent from '../components/GuessResult'
import { GuessResult } from '../types'
import './Game.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const Game = () => {
  const [isGuessing, setIsGuessing] = useState(false)
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas
  }, [])

  const handleGuess = async () => {
    if (!canvasRef.current) {
      setError('画布未准备好')
      return
    }

    setIsGuessing(true)
    setError(null)
    setGuessResult(null)

    try {
      const imageData = canvasRef.current.toDataURL('image/png')
      
      const response = await fetch(`${API_URL}/api/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setGuessResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '猜测失败，请重试')
    } finally {
      setIsGuessing(false)
    }
  }

  return (
    <div className="game">
      <header className="game-header">
        <h1>🎨 AI 你画我猜</h1>
        <p>在画布上作画，让 AI 猜猜你画的是什么！</p>
      </header>

      <div className="game-content">
        <div className="canvas-section">
          <Canvas onCanvasReady={handleCanvasReady} />
        </div>

        <div className="result-section">
          <GuessResultComponent 
            result={guessResult} 
            isLoading={isGuessing} 
          />

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            className="guess-button"
            onClick={handleGuess}
            disabled={isGuessing}
          >
            {isGuessing ? '猜测中...' : '🤖 让 AI 猜猜'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Game

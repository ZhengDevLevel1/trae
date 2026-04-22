import { GuessResult } from '../types'
import './GuessResult.css'

interface GuessResultProps {
  result: GuessResult | null
  isLoading: boolean
}

const GuessResultComponent = ({ result, isLoading }: GuessResultProps) => {
  if (isLoading) {
    return (
      <div className="guess-result loading">
        <div className="loading-spinner"></div>
        <p>AI 正在猜测中...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="guess-result empty">
        <p>🎨 画完后点击"让 AI 猜猜"按钮</p>
      </div>
    )
  }

  return (
    <div className="guess-result">
      <div className="result-header">
        <h3>🤖 AI 的猜测</h3>
      </div>
      
      <div className="main-guess">
        <span className="guess-label">主要猜测</span>
        <span className="guess-value">{result.mainGuess}</span>
      </div>

      <div className="confidence-bar">
        <span className="confidence-label">置信度</span>
        <div className="confidence-track">
          <div 
            className="confidence-fill"
            style={{ width: `${result.confidence}%` }}
          />
        </div>
        <span className="confidence-value">{result.confidence}%</span>
      </div>

      {result.otherGuesses.length > 0 && (
        <div className="other-guesses">
          <span className="guess-label">其他可能</span>
          <div className="guess-tags">
            {result.otherGuesses.map((guess, index) => (
              <span key={index} className="guess-tag">
                {guess}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GuessResultComponent

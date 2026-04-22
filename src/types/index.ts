export interface Point {
  x: number
  y: number
}

export interface DrawingState {
  isDrawing: boolean
  color: string
  lineWidth: number
  tool: 'brush' | 'eraser'
}

export interface GuessResult {
  mainGuess: string
  confidence: number
  otherGuesses: string[]
  rawResponse: string
}

export interface GameState {
  isGuessing: boolean
  guessResult: GuessResult | null
  error: string | null
}

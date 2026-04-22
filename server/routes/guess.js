import express from 'express'
import { guessDrawing } from '../services/openai.js'

const router = express.Router()

router.post('/guess', async (req, res) => {
  try {
    const { image } = req.body
    
    if (!image) {
      return res.status(400).json({ error: '请提供图片数据' })
    }

    const result = await guessDrawing(image)
    res.json(result)
  } catch (error) {
    console.error('猜测错误:', error)
    res.status(500).json({ 
      error: '猜测失败', 
      message: error.message 
    })
  }
})

export default router

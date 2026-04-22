import OpenAI from 'openai'

const getOpenAIClient = () => {
  if (!process.env.ZHIPU_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4'
  })
}

export async function guessDrawing(base64Image) {
  const client = getOpenAIClient()
  
  if (!client) {
    return {
      mainGuess: 'API Key 未配置',
      confidence: 0,
      otherGuesses: ['请在 server/.env 文件中配置 ZHIPU_API_KEY'],
      rawResponse: '请在 server/.env 文件中配置 ZHIPU_API_KEY 环境变量'
    }
  }

  let imageUrl = base64Image
  if (base64Image.startsWith('data:image')) {
    imageUrl = base64Image.split(',')[1]
  }

  const response = await client.chat.completions.create({
    model: process.env.ZHIPU_MODEL || 'glm-4v-flash',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          },
          {
            type: 'text',
            text: `这是一个"你画我猜"游戏的画作。请仔细观察这幅画，猜测画的是什么内容。

请用中文回答，格式如下：
1. 首先给出你最确定的猜测（一个词或短语）
2. 然后给出你的置信度（0-100%）
3. 最后给出其他可能的猜测（最多3个）

回答格式示例：
主要猜测：苹果
置信度：85%
其他可能：橙子、桃子、西红柿`
          }
        ]
      }
    ],
    max_tokens: 300
  })

  const content = response.choices[0].message.content
  
  const mainGuessMatch = content.match(/主要猜测[：:]\s*(.+)/)
  const confidenceMatch = content.match(/置信度[：:]\s*(\d+)/)
  const otherGuessesMatch = content.match(/其他可能[：:]\s*(.+)/)

  return {
    mainGuess: mainGuessMatch ? mainGuessMatch[1].trim() : '无法识别',
    confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
    otherGuesses: otherGuessesMatch 
      ? otherGuessesMatch[1].split(/[,、，]/).map(s => s.trim()).filter(Boolean)
      : [],
    rawResponse: content
  }
}

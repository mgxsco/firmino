// Helper for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type EmbeddingTask = 'retrieval.passage' | 'retrieval.query'

/**
 * Generate embedding using Jina AI
 * Uses jina-embeddings-v3 model which produces 1024-dimensional embeddings
 * Free tier: 1M tokens/month
 * Includes retry logic with exponential backoff for rate limit errors
 *
 * @param text - The text to embed
 * @param task - 'retrieval.passage' for documents, 'retrieval.query' for search queries
 * @param retries - Number of retries on rate limit
 */
export async function generateEmbedding(
  text: string,
  task: EmbeddingTask = 'retrieval.passage',
  retries = 3
): Promise<number[]> {
  const apiKey = process.env.JINA_API_KEY

  if (!apiKey) {
    throw new Error('JINA_API_KEY is not configured')
  }

  console.log('[Embeddings] Generating embedding for text of length:', text.length, 'task:', task)

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: [text],
        model: 'jina-embeddings-v3',
        dimensions: 1024,
        task,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('[Embeddings] Generated embedding with', data.data[0].embedding.length, 'dimensions')
      return data.data[0].embedding
    }

    const errorText = await response.text()

    // Check if it's a rate limit error
    if (response.status === 429) {
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt + 1) * 1000 // 2s, 4s, 8s
        console.log(`[Embeddings] Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`)
        await delay(waitTime)
        continue
      }
    }

    console.error('[Embeddings] Jina AI error:', errorText)
    throw new Error(`Jina AI error: ${errorText}`)
  }

  throw new Error('Failed to generate embedding after retries')
}

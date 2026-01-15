import { searchSimilarChunks, buildContext } from './rag'
import { generateResponse } from './client'
import { ChatMessage, SearchResult } from '@/lib/types'
import { getCampaignSettings, DEFAULT_PROMPTS } from '@/lib/campaign-settings'
import type { CampaignSettings } from '@/lib/db/schema'
import { getModelProvider } from '@/lib/db/schema'

export interface ChatOptions {
  isDM: boolean
  campaignName?: string
  settings?: CampaignSettings | null
}

export interface ChatResponse {
  content: string
  sources: SearchResult[]
}

/**
 * Generate a chat response using RAG with Claude or Gemini
 */
export async function generateChatResponse(
  campaignId: string,
  userMessage: string,
  history: ChatMessage[],
  options: ChatOptions
): Promise<ChatResponse> {
  // Get campaign settings with defaults
  const settings = getCampaignSettings(options.settings)
  const provider = getModelProvider(settings.model.chatModel)

  // Check if API key is configured for the selected provider
  if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    return {
      content: 'Chat is not configured. Please add ANTHROPIC_API_KEY to your environment variables.',
      sources: [],
    }
  }
  if (provider === 'google' && !process.env.GOOGLE_API_KEY) {
    return {
      content: 'Gemini is not configured. Please add GOOGLE_API_KEY to your environment variables.',
      sources: [],
    }
  }

  // Search for relevant chunks using campaign settings
  const chunks = await searchSimilarChunks(campaignId, userMessage, {
    limit: settings.search.resultLimit,
    threshold: settings.search.similarityThreshold,
    excludeDmOnly: !options.isDM,
  })

  // Build context from chunks
  const context = buildContext(chunks)

  // Get the custom or default system prompt
  const baseSystemPrompt = settings.prompts.chatSystemPrompt || DEFAULT_PROMPTS.chatSystemPrompt

  // Build the system prompt with context
  const systemPrompt = `${baseSystemPrompt}

Campaign: ${options.campaignName || 'Unknown Campaign'}

Context from campaign knowledge base:
${context}`

  // Prepare messages
  const messages = [
    // Include recent history
    ...history.slice(-10).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: userMessage,
    },
  ]

  // Generate response using unified client
  const result = await generateResponse({
    model: settings.model.chatModel,
    systemPrompt,
    messages,
    maxTokens: settings.model.maxTokens,
    temperature: settings.model.temperature,
  })

  return {
    content: result.content || 'I apologize, but I was unable to generate a response.',
    sources: chunks,
  }
}

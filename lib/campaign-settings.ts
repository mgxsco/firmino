import type { CampaignSettings } from '@/lib/db/schema'

/**
 * Default prompts for AI operations
 */
export const DEFAULT_PROMPTS = {
  chatSystemPrompt: `You are Firmino, a helpful AI assistant for organizing ideas, projects, and creative work. You help users find and connect information in their workspace.

Your task: Answer questions based ONLY on the context provided from the knowledge base.

Guidelines:
- Answer ONLY with information from the provided context
- If you don't have the information, say so clearly
- Be concise (maximum 100 words)
- Mention the source of information (entity name and type)
- Use wikilinks [[Entity Name]] when mentioning entities from the workspace
- For general knowledge outside the workspace, you can use your knowledge but make it clear it's not from the workspace`,

  extractionConservativePrompt: `You are a careful wiki curator. Extract clearly identified entities from this content. Focus on entities that are explicitly named and have significant information.

RELATIONSHIPS: related_to, part_of, created_by, inspired_by, references, contains, used_in, similar_to

Return ONLY valid JSON:
{
  "entities": [{
    "name": "Exact Name",
    "type": "most_specific_type",
    "aliases": ["other names"],
    "description": "Key facts only (1-2 sentences)",
    "confidence": 0.7-1.0
  }],
  "relationships": [{
    "sourceEntity": "Name",
    "targetEntity": "Name",
    "relationshipType": "type",
    "reverseLabel": "reverse",
    "excerpt": "context"
  }]
}

Focus on quality over quantity. Only extract entities you're confident about.`,

  extractionBalancedPrompt: `You are a thorough wiki curator. Extract entities from this content. Include both major and minor entities.

RELATIONSHIPS: related_to, part_of, created_by, inspired_by, references, contains, used_in, similar_to, belongs_to, features, depicts, commissioned_by, for_client

Return ONLY valid JSON:
{
  "entities": [{
    "name": "Exact Name",
    "type": "most_specific_type",
    "aliases": ["other names"],
    "description": "Key information (2-3 sentences)",
    "confidence": 0.5-1.0
  }],
  "relationships": [{
    "sourceEntity": "Name",
    "targetEntity": "Name",
    "relationshipType": "type",
    "reverseLabel": "reverse",
    "excerpt": "context"
  }]
}

Aim for 10-20 entities from typical notes. Use the most specific type for each entity.`,

  extractionObsessivePrompt: `You are an OBSESSIVE wiki curator. Extract ABSOLUTELY EVERYTHING from this content. Miss NOTHING.

EXTRACT EVERYTHING - Examples by type:
- artwork: Finished pieces, portfolio items, commissions, sketches, studies
- character: Character designs, OCs, personas, figures in artwork
- reference: Visual references, mood boards, color palettes, photo references
- technique: Methods, processes, tutorials, tips, tools used
- client: Clients, commissioners, collaborators, patrons
- style: Art styles, aesthetics, movements, influences
- idea: Concepts, brainstorms, rough ideas, "what if" notes
- task: To-dos, action items, deadlines, reminders
- milestone: Project phases, goals achieved, version releases
- asset: Resources, brushes, textures, fonts, stock images
- note: General notes, observations, feedback, critiques
- inspiration: Artists, works, media that inspire

EXAMPLE - "Working on the fantasy portrait commission for Sarah. Using the Frazetta-inspired style with dramatic lighting. Need to reference the armor studies from last month. Deadline is Friday."
Extract: Fantasy Portrait Commission (artwork), Sarah (client), Frazetta-inspired style (style), Dramatic Lighting (technique), Armor Studies (reference), Friday Deadline (task)

RELATIONSHIPS: related_to, part_of, created_by, inspired_by, references, contains, used_in, similar_to, belongs_to, features, depicts, commissioned_by, for_client, evolved_from, leads_to, depends_on, influences, taught_by, learned_from

Return ONLY valid JSON:
{
  "entities": [{
    "name": "Exact Name",
    "type": "most_specific_type",
    "aliases": ["other names"],
    "description": "All known information (2-4 sentences)",
    "confidence": 0.5-1.0
  }],
  "relationships": [{
    "sourceEntity": "Name",
    "targetEntity": "Name",
    "relationshipType": "type",
    "reverseLabel": "reverse",
    "excerpt": "context"
  }]
}

CRITICAL: Extract 20-50+ entities from typical notes. Use the MOST SPECIFIC type for each entity. If you extract fewer than 10, you are missing things. Every noun could be an entity!`,
}

/**
 * Default campaign settings
 * These values are used when settings are not explicitly configured
 */
export const DEFAULT_SETTINGS: Required<{
  model: Required<NonNullable<CampaignSettings['model']>>
  extraction: Required<NonNullable<CampaignSettings['extraction']>>
  visibility: Required<NonNullable<CampaignSettings['visibility']>>
  search: Required<NonNullable<CampaignSettings['search']>>
  graph: Required<NonNullable<CampaignSettings['graph']>>
  prompts: Required<NonNullable<CampaignSettings['prompts']>>
}> = {
  model: {
    chatModel: 'claude-sonnet-4-20250514',
    extractionModel: 'claude-3-5-haiku-20241022',
    temperature: 0.7,
    maxTokens: 1024,
  },
  extraction: {
    aggressiveness: 'obsessive',
    chunkSize: 6000,
    confidenceThreshold: 0.5,
    enableAutoMerge: false,
    enableRelationships: true,
  },
  visibility: {
    defaultDmOnly: false,
    dmOnlyEntityTypes: [],
  },
  search: {
    similarityThreshold: 0.15,
    resultLimit: 8,
    enablePlayerChat: false,
  },
  graph: {
    maxNodes: 500,
    showLinkLabels: 'on-hover',
  },
  prompts: {
    chatSystemPrompt: DEFAULT_PROMPTS.chatSystemPrompt,
    extractionConservativePrompt: DEFAULT_PROMPTS.extractionConservativePrompt,
    extractionBalancedPrompt: DEFAULT_PROMPTS.extractionBalancedPrompt,
    extractionObsessivePrompt: DEFAULT_PROMPTS.extractionObsessivePrompt,
  },
}

/**
 * Get campaign settings with defaults merged in
 */
export function getCampaignSettings(settings?: CampaignSettings | null): typeof DEFAULT_SETTINGS {
  if (!settings) return DEFAULT_SETTINGS

  return {
    model: {
      ...DEFAULT_SETTINGS.model,
      ...(settings.model || {}),
    },
    extraction: {
      ...DEFAULT_SETTINGS.extraction,
      ...(settings.extraction || {}),
    },
    visibility: {
      ...DEFAULT_SETTINGS.visibility,
      ...(settings.visibility || {}),
    },
    search: {
      ...DEFAULT_SETTINGS.search,
      ...(settings.search || {}),
    },
    graph: {
      ...DEFAULT_SETTINGS.graph,
      ...(settings.graph || {}),
    },
    prompts: {
      ...DEFAULT_SETTINGS.prompts,
      ...(settings.prompts || {}),
    },
  }
}

/**
 * Extraction aggressiveness descriptions
 */
export const AGGRESSIVENESS_OPTIONS = [
  {
    value: 'conservative' as const,
    label: 'Conservative',
    description: 'Fewer entities, only confident extractions. Best for focused projects.',
  },
  {
    value: 'balanced' as const,
    label: 'Balanced',
    description: 'Moderate extraction. Good balance of coverage and accuracy.',
  },
  {
    value: 'obsessive' as const,
    label: 'Obsessive',
    description: 'Extract everything possible. Best for comprehensive idea capture.',
  },
]

/**
 * Chunk size options
 */
export const CHUNK_SIZE_OPTIONS = [
  {
    value: 3000,
    label: 'Small (3000 chars)',
    description: 'More detailed extraction, slower processing',
  },
  {
    value: 6000,
    label: 'Medium (6000 chars)',
    description: 'Recommended balance of detail and speed',
  },
  {
    value: 10000,
    label: 'Large (10000 chars)',
    description: 'Faster processing, may miss subtle connections',
  },
]

/**
 * Link label visibility options
 */
export const LINK_LABEL_OPTIONS = [
  { value: 'always' as const, label: 'Always visible' },
  { value: 'on-hover' as const, label: 'Show on hover' },
  { value: 'never' as const, label: 'Never show' },
]

/**
 * Available AI models for chat
 */
export const CHAT_MODEL_OPTIONS = [
  {
    value: 'claude-sonnet-4-20250514' as const,
    label: 'Claude Sonnet 4',
    description: 'Balanced performance and speed',
  },
  {
    value: 'claude-3-5-haiku-20241022' as const,
    label: 'Claude Haiku 3.5',
    description: 'Fastest Claude, lower cost',
  },
  {
    value: 'claude-opus-4-20250514' as const,
    label: 'Claude Opus 4',
    description: 'Best reasoning, highest quality',
  },
  {
    value: 'gemini-3-flash-preview' as const,
    label: 'Gemini 3 Flash',
    description: 'Google AI, latest and fastest',
  },
  {
    value: 'gemini-2.5-flash' as const,
    label: 'Gemini 2.5 Flash',
    description: 'Google AI, stable version',
  },
]

/**
 * Available AI models for extraction
 */
export const EXTRACTION_MODEL_OPTIONS = [
  {
    value: 'claude-3-5-haiku-20241022' as const,
    label: 'Claude Haiku 3.5',
    description: 'Fast extraction, good for large documents',
  },
  {
    value: 'claude-sonnet-4-20250514' as const,
    label: 'Claude Sonnet 4',
    description: 'More accurate, slower processing',
  },
  {
    value: 'gemini-3-flash-preview' as const,
    label: 'Gemini 3 Flash',
    description: 'Google AI, latest and fastest',
  },
  {
    value: 'gemini-2.5-flash' as const,
    label: 'Gemini 2.5 Flash',
    description: 'Google AI, stable version',
  },
]

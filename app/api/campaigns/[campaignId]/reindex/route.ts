import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db, campaigns, campaignMembers, entities } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { syncEntityEmbeddings } from '@/lib/ai/entity-embeddings'

// Regenerate embeddings for all entities in a campaign
export async function POST(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if JINA_API_KEY is configured
  if (!process.env.JINA_API_KEY) {
    return NextResponse.json({
      error: 'JINA_API_KEY is not configured. Embeddings cannot be generated.',
    }, { status: 400 })
  }

  // Check ownership/membership
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, params.campaignId),
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const membership = await db.query.campaignMembers.findFirst({
    where: and(
      eq(campaignMembers.campaignId, params.campaignId),
      eq(campaignMembers.userId, session.user.id)
    ),
  })

  const isDM = membership?.role === 'dm' || campaign.ownerId === session.user.id
  if (!isDM) {
    return NextResponse.json({ error: 'Only DMs can regenerate embeddings' }, { status: 403 })
  }

  const results: Array<{
    id: string
    name: string
    success: boolean
    error?: string
  }> = []

  // Reindex all entities
  const allEntities = await db
    .select()
    .from(entities)
    .where(eq(entities.campaignId, params.campaignId))

  console.log(`[Reindex] Found ${allEntities.length} entities to process`)

  for (const entity of allEntities) {
    try {
      console.log(`[Reindex] Processing entity: ${entity.name}`)

      await syncEntityEmbeddings(
        entity.id,
        params.campaignId,
        entity.name,
        entity.content || ''
      )

      results.push({ id: entity.id, name: entity.name, success: true })
    } catch (error) {
      console.error(`[Reindex] Failed to process entity ${entity.id}:`, error)
      results.push({
        id: entity.id,
        name: entity.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const successCount = results.filter((r) => r.success).length

  return NextResponse.json({
    success: true,
    message: `Processed ${successCount} of ${allEntities.length} entities`,
    entities: {
      total: allEntities.length,
      success: successCount,
    },
    results,
  })
}

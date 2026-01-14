'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CampaignSidebar } from '@/components/campaigns/campaign-sidebar'
import { KnowledgeGraph } from '@/components/graph/knowledge-graph'
import { ErrorBoundary, GraphErrorFallback } from '@/components/ui/error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Filter, RotateCcw } from 'lucide-react'
import { getEntityTypeColor } from '@/lib/entity-colors'

interface GraphNode {
  id: string
  name: string
  canonicalName: string
  type: string
  group: number
}

interface GraphLink {
  id: string
  source: string
  target: string
  type: string
  label: string
  reverseLabel?: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface GraphStats {
  totalNodes: number
  totalLinks: number
  nodesByType: Record<string, number>
  linksByType: Record<string, number>
}

function getTypeColor(type: string): string {
  return getEntityTypeColor(type).hex
}

function formatEntityType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function GraphPage() {
  const params = useParams<{ campaignId: string }>()
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [stats, setStats] = useState<GraphStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDM, setIsDM] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [centerId, setCenterId] = useState<string | null>(null)
  const router = useRouter()
  const campaignId = params.campaignId

  useEffect(() => {
    loadGraphData()
  }, [campaignId])

  const loadGraphData = async (centerEntity?: string, filterType?: string) => {
    setLoading(true)
    try {
      let url = `/api/campaigns/${campaignId}/graph?source=entities`
      if (centerEntity) url += `&center=${centerEntity}&depth=2`
      if (filterType) url += `&type=${filterType}`

      const response = await fetch(url)
      if (!response.ok) {
        console.error('Graph API error:', response.status)
        setGraphData(null)
        setStats(null)
        return
      }
      const data = await response.json()
      // Ensure graphData has required structure
      if (data.graphData && Array.isArray(data.graphData.nodes) && Array.isArray(data.graphData.links)) {
        setGraphData(data.graphData)
        setStats(data.stats)
        setIsDM(data.isDM)
      } else {
        console.error('Invalid graph data structure:', data)
        setGraphData(null)
        setStats(null)
      }
    } catch (error) {
      console.error('Failed to load graph data:', error)
      setGraphData(null)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleNodeClick = (nodeId: string) => {
    router.push(`/campaigns/${campaignId}/entities/${nodeId}`)
  }

  const handleNodeDoubleClick = (nodeId: string) => {
    setCenterId(nodeId)
    loadGraphData(nodeId)
  }

  const toggleTypeFilter = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  const resetGraph = () => {
    setCenterId(null)
    setSelectedTypes(new Set())
    loadGraphData()
  }

  // Filter graph data based on selected types
  const filteredData = graphData && graphData.nodes && graphData.links ? {
    nodes: selectedTypes.size > 0
      ? graphData.nodes.filter(n => selectedTypes.has(n.type))
      : graphData.nodes,
    links: selectedTypes.size > 0
      ? graphData.links.filter(l => {
          const sourceNode = graphData.nodes.find(n => n.id === l.source || (l.source as any).id === n.id)
          const targetNode = graphData.nodes.find(n => n.id === l.target || (l.target as any).id === n.id)
          return sourceNode && targetNode && selectedTypes.has(sourceNode.type) && selectedTypes.has(targetNode.type)
        })
      : graphData.links,
  } : null

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <CampaignSidebar campaignId={campaignId} isDM={isDM} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Graph</h1>
            {stats && (
              <p className="text-muted-foreground">
                {stats.totalNodes} entities, {stats.totalLinks} connections
              </p>
            )}
          </div>
          {(centerId || selectedTypes.size > 0) && (
            <Button variant="outline" size="sm" onClick={resetGraph}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          )}
        </div>

        {/* Type filters - dynamically generated from available types */}
        {stats && Object.keys(stats.nodesByType).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2 mr-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            {Object.entries(stats.nodesByType)
              .sort(([, a], [, b]) => b - a) // Sort by count descending
              .map(([typeValue, count]) => {
                const isSelected = selectedTypes.has(typeValue)
                return (
                  <Badge
                    key={typeValue}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTypeFilter(typeValue)}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1 bg-foreground"
                    />
                    {formatEntityType(typeValue)} ({count})
                  </Badge>
                )
              })}
          </div>
        )}

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="h-[calc(100vh-280px)] md:h-[600px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredData && filteredData.nodes.length > 0 ? (
              <div className="h-[calc(100vh-280px)] md:h-[600px]">
                <ErrorBoundary fallback={<GraphErrorFallback onRetry={resetGraph} />}>
                  <KnowledgeGraph
                    data={filteredData}
                    onNodeClick={handleNodeClick}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    centerId={centerId}
                  />
                </ErrorBoundary>
              </div>
            ) : (
              <div className="h-[calc(100vh-280px)] md:h-[600px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No entities yet</p>
                  <p className="text-sm">
                    Upload documents to automatically extract entities and see the knowledge graph.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend - dynamically generated from available types */}
        {stats && Object.keys(stats.nodesByType).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {Object.keys(stats.nodesByType)
              .sort()
              .map((typeValue) => (
                <div key={typeValue} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/60" />
                  <span className="text-muted-foreground">{formatEntityType(typeValue)}</span>
                </div>
              ))}
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          Click a node to view the entity. Double-click to center the graph on that entity.
        </p>
      </div>
    </div>
  )
}

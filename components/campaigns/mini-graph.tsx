'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Network, Loader2, Maximize2 } from 'lucide-react'
import { getEntityTypeColor } from '@/lib/entity-colors'

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface GraphNode {
  id: string
  title: string
  note_type: string
}

interface GraphLink {
  source: string
  target: string
}

interface MiniGraphProps {
  campaignId: string
}

export function MiniGraph({ campaignId }: MiniGraphProps) {
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 })

  useEffect(() => {
    fetchGraphData()
  }, [campaignId])

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 200,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    // Zoom to fit after data loads
    if (graphRef.current && graphData && graphData.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current?.zoomToFit(300, 20)
      }, 300)
    }
  }, [graphData])

  const fetchGraphData = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/graph`)
      if (res.ok) {
        const data = await res.json()
        const graph = data.graphData

        if (!graph || !graph.nodes || !graph.links) {
          setGraphData({ nodes: [], links: [] })
          return
        }

        // Limit to top 30 most connected nodes
        const nodeConnections = new Map<string, number>()

        // Count connections per node
        for (const link of graph.links) {
          nodeConnections.set(link.source, (nodeConnections.get(link.source) || 0) + 1)
          nodeConnections.set(link.target, (nodeConnections.get(link.target) || 0) + 1)
        }

        // Get top connected nodes
        const sortedNodes = [...graph.nodes].sort((a, b) =>
          (nodeConnections.get(b.id) || 0) - (nodeConnections.get(a.id) || 0)
        )

        const topNodes = sortedNodes.slice(0, 30)
        const topNodeIds = new Set(topNodes.map((n: any) => n.id))

        // Filter links to only include those between top nodes
        const filteredLinks = graph.links.filter(
          (link: GraphLink) => topNodeIds.has(link.source) && topNodeIds.has(link.target)
        )

        setGraphData({
          nodes: topNodes.map((node: any) => ({
            id: node.id,
            title: node.title || node.name,
            note_type: node.note_type || node.type,
          })),
          links: filteredLinks,
        })
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err)
    } finally {
      setLoading(false)
    }
  }

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const nodeColor = getEntityTypeColor(node.note_type).hex

      // Draw node circle (smaller for mini view)
      ctx.beginPath()
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false)
      ctx.fillStyle = nodeColor
      ctx.fill()

      // Draw border
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 0.5 / globalScale
      ctx.stroke()
    },
    []
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-foreground" />
            Knowledge Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[200px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-foreground" />
            Knowledge Graph
          </CardTitle>
          <CardDescription>Entity relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No connections yet</p>
            <p className="text-xs mt-1">Add entities to see relationships</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-foreground" />
            Knowledge Graph
          </CardTitle>
          <CardDescription>{graphData.nodes.length} entities</CardDescription>
        </div>
        <Link href={`/campaigns/${campaignId}/graph`}>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-1" />
            Expand
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full h-[200px] overflow-hidden bg-background border border-border"
        >
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={200}
            nodeCanvasObject={nodeCanvasObject}
            linkColor={() => 'rgba(255, 255, 255, 0.2)'}
            linkWidth={0.5}
            backgroundColor="#000000"
            enableZoomInteraction={false}
            enablePanInteraction={false}
            enableNodeDrag={false}
            cooldownTime={1000}
            d3AlphaDecay={0.05}
            d3VelocityDecay={0.3}
          />
        </div>
      </CardContent>
    </Card>
  )
}

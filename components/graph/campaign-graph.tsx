'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { GraphData, GraphNode } from '@/lib/types'
import { getEntityTypeColor } from '@/lib/entity-colors'

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
})

interface CampaignGraphProps {
  data: GraphData
  onNodeClick: (nodeId: string) => void
}

export function CampaignGraph({ data, onNodeClick }: CampaignGraphProps) {
  const graphRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('graph-container')
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: 600,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    // Zoom to fit after data loads
    if (graphRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current?.zoomToFit(400, 50)
      }, 500)
    }
  }, [data])

  const handleNodeClick = useCallback(
    (node: any) => {
      onNodeClick(node.id)
    },
    [onNodeClick]
  )

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.title || ''
      const fontSize = 12 / globalScale
      ctx.font = `${fontSize}px Tomorrow, system-ui, sans-serif`

      const nodeColor = getEntityTypeColor(node.note_type).hex

      // Draw node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false)
      ctx.fillStyle = nodeColor
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5 / globalScale
      ctx.stroke()

      // Draw label
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(label, node.x, node.y + 16)
    },
    []
  )

  // Transform data for the graph library
  const graphData = {
    nodes: data.nodes.map((node) => ({
      id: node.id,
      title: node.title,
      note_type: node.note_type,
      slug: node.slug,
    })),
    links: data.links.map((link) => ({
      source: link.source,
      target: link.target,
    })),
  }

  return (
    <div id="graph-container" className="w-full h-[600px] bg-background">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.beginPath()
          ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false)
          ctx.fillStyle = color
          ctx.fill()
        }}
        onNodeClick={handleNodeClick}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        linkWidth={1}
        backgroundColor="#000000"
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
      />
    </div>
  )
}

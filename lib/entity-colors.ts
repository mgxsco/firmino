import {
  Palette,
  User,
  Image,
  Lightbulb,
  Briefcase,
  Sparkles,
  CheckSquare,
  Target,
  FolderOpen,
  FileText,
  Heart,
  Layers,
  PenTool,
} from 'lucide-react'

/**
 * Centralized entity type color definitions
 * MGXS monochrome palette with subtle differentiation
 */
export const ENTITY_TYPE_COLORS: Record<string, {
  bg: string
  text: string
  border: string
  hex: string
}> = {
  artwork: {
    bg: 'bg-foreground/5',
    text: 'text-foreground',
    border: 'border-foreground/20',
    hex: '#ffffff',
  },
  character: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/90',
    border: 'border-foreground/15',
    hex: '#e5e5e5',
  },
  reference: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/80',
    border: 'border-foreground/15',
    hex: '#d4d4d4',
  },
  technique: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/70',
    border: 'border-foreground/15',
    hex: '#a3a3a3',
  },
  client: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/90',
    border: 'border-foreground/15',
    hex: '#fafafa',
  },
  style: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/80',
    border: 'border-foreground/15',
    hex: '#d4d4d4',
  },
  idea: {
    bg: 'bg-foreground/5',
    text: 'text-foreground',
    border: 'border-foreground/20',
    hex: '#ffffff',
  },
  task: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/70',
    border: 'border-foreground/15',
    hex: '#a3a3a3',
  },
  milestone: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/80',
    border: 'border-foreground/15',
    hex: '#d4d4d4',
  },
  asset: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/70',
    border: 'border-foreground/15',
    hex: '#a3a3a3',
  },
  note: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/60',
    border: 'border-foreground/10',
    hex: '#737373',
  },
  inspiration: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/90',
    border: 'border-foreground/15',
    hex: '#e5e5e5',
  },
  freeform: {
    bg: 'bg-foreground/5',
    text: 'text-foreground/50',
    border: 'border-foreground/10',
    hex: '#525252',
  },
}

/**
 * Entity type icons mapping
 */
export const ENTITY_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  all: Layers,
  artwork: Palette,
  character: User,
  reference: Image,
  technique: PenTool,
  client: Briefcase,
  style: Sparkles,
  idea: Lightbulb,
  task: CheckSquare,
  milestone: Target,
  asset: FolderOpen,
  note: FileText,
  inspiration: Heart,
  freeform: FileText,
}

/**
 * Entity type display labels
 */
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  all: 'All',
  artwork: 'Artworks',
  character: 'Characters',
  reference: 'References',
  technique: 'Techniques',
  client: 'Clients',
  style: 'Styles',
  idea: 'Ideas',
  task: 'Tasks',
  milestone: 'Milestones',
  asset: 'Assets',
  note: 'Notes',
  inspiration: 'Inspiration',
  freeform: 'Other',
}

/**
 * Get color classes for an entity type
 */
export function getEntityTypeColor(type: string) {
  return ENTITY_TYPE_COLORS[type] || ENTITY_TYPE_COLORS.freeform
}

/**
 * Get icon component for an entity type
 */
export function getEntityTypeIcon(type: string) {
  return ENTITY_TYPE_ICONS[type] || ENTITY_TYPE_ICONS.freeform
}

/**
 * Get display label for an entity type
 */
export function getEntityTypeLabel(type: string) {
  return ENTITY_TYPE_LABELS[type] || type.replace('_', ' ')
}

/**
 * Get combined class string for entity type badge
 */
export function getEntityTypeBadgeClasses(type: string) {
  const colors = getEntityTypeColor(type)
  return `${colors.bg} ${colors.text} ${colors.border}`
}

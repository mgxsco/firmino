import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Brain, MessageSquare, Network, Lightbulb } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/mgxs-logo.png"
              alt="MGXS"
              width={80}
              height={80}
              className="dark:invert"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Firmino
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI assistant for capturing ideas, organizing projects,
            and connecting your creative work.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-16">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Create Account</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Lightbulb className="h-8 w-8" />}
            title="Capture Ideas"
            description="Store and organize your ideas, references, and inspirations with [[wikilinks]]."
          />
          <FeatureCard
            icon={<Network className="h-8 w-8" />}
            title="Knowledge Graph"
            description="Visualize connections between your ideas with an interactive graph."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8" />}
            title="AI-Powered Search"
            description="Ask questions about your ideas and get answers with source citations."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Smart Extraction"
            description="Automatically extract and link concepts from your documents."
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

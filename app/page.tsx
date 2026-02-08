import { Button } from '@/app/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Gear Journey
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Plan your best-in-slot gear progression for World of Warcraft Classic (1-60)
        </p>
        <div className="flex gap-4">
          <Button>Items</Button>
          <Button variant="outline">Progression</Button>
        </div>
      </main>
    </div>
  )
}

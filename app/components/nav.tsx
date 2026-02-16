'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { useBisList } from '@/app/hooks/use-bis-list'

const links = [
  { href: '/items', label: 'Items' },
  { href: '/progression', label: 'Progression' },
  { href: '/character', label: 'Character' },
] as const

export function Nav() {
  const pathname = usePathname()
  const { items } = useBisList()

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold">Gear Journey</h1>
        <nav className="flex gap-2">
          {links.map(({ href, label }) => (
            <Button
              key={href}
              variant={pathname === href ? 'default' : 'outline'}
              asChild
            >
              <Link href={href}>
                {label}
                {href === '/progression' && items.length > 0 && ` (${items.length})`}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}

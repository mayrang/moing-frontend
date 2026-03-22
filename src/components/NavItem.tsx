'use client'
import React, { FunctionComponent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItemProps {
  url: string
  Icon: FunctionComponent<React.SVGProps<SVGSVGElement>>
  text: string
}

export default function NavItem({ url, Icon, text }: NavItemProps) {
  const pathname = usePathname()
  const isURLMatched = pathname === url

  return (
    <Link href={url}>
      <Icon
        stroke={isURLMatched ? "var(--color-text-base)" : "var(--color-muted3)"}
        fill={isURLMatched ? "var(--color-text-base)" : "var(--color-muted3)"}
      />
      <p>{text}</p>
    </Link>
  )
}

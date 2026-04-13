'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <Link href="/" className="header-logo">
            thehamanars
          </Link>
        </div>
      </div>
    </header>
  )
}

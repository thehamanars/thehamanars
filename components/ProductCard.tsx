'use client'

import Link from 'next/link'

interface ProductCardProps {
  id: string
  title: string
  image: string
}

export default function ProductCard({ id, title, image }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card-image-wrap">
        <img
          src={image}
          alt={`Produktbild: ${title}`}
          className="product-card-image"
          onError={(e) => {
            const target = e.currentTarget
            target.src = 'https://placehold.co/600x480?text=Kein+Bild+verfuegbar'
          }}
        />
      </div>
      <div className="product-card-body">
        <div className="product-card-badge">
          <span style={{ letterSpacing: '0.06em' }}>&#9670;</span>
          thehamanars
        </div>
        <h2 className="product-card-title">{title}</h2>
        <Link href={`/product/${id}`} className="btn btn-primary btn-full">
          Jetzt ansehen
        </Link>
      </div>
    </article>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Product {
  id: string
  title: string
  image: string
  link: string
}

export default function ProductPage() {
  const params = useParams()
  const id = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return

    async function fetchProduct() {
      try {
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) })
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('[thehamanars] Fehler beim Laden des Produkts:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return (
    <div className="page-wrapper">
      <Header />

      <main style={{ flex: 1 }}>
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <span className="loading-text">Produkt wird geladen…</span>
          </div>
        ) : notFound || !product ? (
          <div className="product-not-found container">
            <h2>Produkt nicht gefunden</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px' }}>
              Dieses Produkt existiert leider nicht oder wurde entfernt.
            </p>
            <Link href="/" className="btn btn-primary">
              Zurück zur Startseite
            </Link>
          </div>
        ) : (
          <div className="product-detail-page">
            {/* Full-width hero image */}
            <div className="product-detail-image-hero">
              <img
                src={product.image}
                alt={`Produktbild: ${product.title}`}
                onError={(e) => {
                  const target = e.currentTarget
                  target.src = 'https://placehold.co/1200x900?text=Kein+Bild+verfuegbar'
                }}
              />
            </div>

            {/* Content below image */}
            <div className="product-detail-content">
              <div className="product-detail-inner">
                <Link href="/" className="product-detail-back">
                  &#8592; Zurück zur Übersicht
                </Link>

                <span className="product-detail-label">thehamanars</span>
                <h1 className="product-detail-title">{product.title}</h1>
                <p className="product-detail-tagline">
                  Entdecke dieses exklusive Produkt — sorgfältig ausgewählt für dich.
                </p>

                <div className="product-detail-cta-wrap">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-cta"
                  >
                    Jetzt kaufen
                  </a>
                  <div className="product-detail-trust">
                    <span className="product-detail-trust-dot" />
                    Externer Shop — öffnet in neuem Tab
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

interface Product {
  id: string
  title: string
  image: string
  link: string
  createdAt?: unknown
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, 'id'>),
        }))
        setProducts(data)
      } catch {
        // If createdAt index doesn't exist yet, fall back to unordered
        try {
          const snapshot = await getDocs(collection(db, 'products'))
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Product, 'id'>),
          }))
          setProducts(data)
        } catch (err) {
          console.error('[thehamanars] Fehler beim Laden der Produkte:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="page-wrapper">
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="home-hero">
          <h1 className="home-title">thehamanars</h1>
          <p className="home-tagline">Unsere liebsten Produkte</p>

          <div className="home-divider">
            <span className="home-divider-line" />
            <span className="home-divider-dot" />
            <span className="home-divider-line" />
          </div>

          <div className="profile-image-wrap">
            <img
              src="/profile.jpg"
              alt="thehamanars Profilbild – Paar Illustration mit Herz-Hintergrund"
              className="profile-image"
            />
          </div>
        </section>

        {/* Products Section */}
        <section className="container" style={{ paddingBottom: '0' }}>
          <div className="products-section-header">
            <span className="section-label">Entdecke</span>
            <h2 className="section-title">Unsere Produkte</h2>
            <p className="section-subtitle">Handverlesen mit Liebe — nur das Beste für euch</p>
            <div className="section-ornament">
              <span className="section-ornament-line" />
              <span className="section-ornament-diamond" />
              <span className="section-ornament-line" />
            </div>
          </div>

          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <span className="loading-text">Wird geladen</span>
            </div>
          ) : (
            <div className="product-grid">
              {products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">&#9670;</div>
                  <p>Noch keine Produkte vorhanden.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '6px', color: 'var(--color-text-light)' }}>
                    Produkte können im Admin-Bereich hinzugefügt werden.
                  </p>
                </div>
              ) : (
                products.map((product, i) => (
                  <div
                    key={product.id}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      image={product.image}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ── Types ──────────────────────────────────────────────
interface Product {
  id: string
  title: string
  image: string
  link: string
  createdAt?: unknown
}

interface EditState {
  title: string
  image: string
  link: string
}

// ── Constants ──────────────────────────────────────────
const ADMIN_EMAIL = 'the.hamanars@web.de'
const ADMIN_PASSWORD = 'Banane100-!'
const LS_KEY = 'thehamanars_admin_logged_in'

// ══════════════════════════════════════════════════════
// LOGIN FORM COMPONENT
// ══════════════════════════════════════════════════════
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Small delay for UX feel
    setTimeout(() => {
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem(LS_KEY, 'true')
        onLogin()
      } else {
        setError('E-Mail oder Passwort ist falsch. Bitte versuche es erneut.')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="login-page">
        <div className="login-card">
        <div className="login-logo">
          <span>thehamanars</span>
        </div>
        <h1 className="login-title">Willkommen</h1>
        <p className="login-subtitle">Melde dich an, um dein Dashboard zu öffnen.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-Mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Passwort</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '8px', padding: '13px' }}
            disabled={loading}
          >
            {loading ? 'Einloggen…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// ADMIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  // ── Product list state ─────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // ── Add form state ─────────────────────────────────
  const [addTitle, setAddTitle] = useState('')
  const [addImage, setAddImage] = useState('')
  const [addLink, setAddLink] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addSuccess, setAddSuccess] = useState('')
  const [addError, setAddError] = useState('')

  // ── Edit state ─────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ title: '', image: '', link: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState('')
  const [editError, setEditError] = useState('')

  // ── Delete state ───────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Fetch products ─────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, 'id'>),
      }))
      setProducts(data)
    } catch {
      // Fallback without ordering
      try {
        const snapshot = await getDocs(collection(db, 'products'))
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }))
        setProducts(data)
      } catch (err) {
        console.error('[thehamanars] Fehler beim Laden:', err)
      }
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ── Add product ────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')

    if (!addTitle.trim() || !addImage.trim() || !addLink.trim()) {
      setAddError('Bitte alle Felder ausfüllen.')
      return
    }

    setAddLoading(true)
    try {
      await addDoc(collection(db, 'products'), {
        title: addTitle.trim(),
        image: addImage.trim(),
        link: addLink.trim(),
        createdAt: serverTimestamp(),
      })
      setAddTitle('')
      setAddImage('')
      setAddLink('')
      setAddSuccess('Produkt erfolgreich hinzugefügt!')
      await fetchProducts()
      setTimeout(() => setAddSuccess(''), 3500)
    } catch (err) {
      console.error('[thehamanars] Fehler beim Hinzufügen:', err)
      setAddError('Fehler beim Speichern. Bitte erneut versuchen.')
    } finally {
      setAddLoading(false)
    }
  }

  // ── Delete product ─────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm('Produkt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return
    setDeletingId(id)
    try {
      await deleteDoc(doc(db, 'products', id))
      await fetchProducts()
    } catch (err) {
      console.error('[thehamanars] Fehler beim Löschen:', err)
      alert('Fehler beim Löschen. Bitte erneut versuchen.')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Open edit form ─────────────────────────────────
  function openEdit(product: Product) {
    setEditingId(product.id)
    setEditState({ title: product.title, image: product.image, link: product.link })
    setEditSuccess('')
    setEditError('')
  }

  // ── Save edit ──────────────────────────────────────
  async function handleEditSave(id: string) {
    setEditError('')
    setEditSuccess('')

    if (!editState.title.trim() || !editState.image.trim() || !editState.link.trim()) {
      setEditError('Bitte alle Felder ausfüllen.')
      return
    }

    setEditLoading(true)
    try {
      await updateDoc(doc(db, 'products', id), {
        title: editState.title.trim(),
        image: editState.image.trim(),
        link: editState.link.trim(),
      })
      setEditSuccess('Produkt erfolgreich aktualisiert!')
      await fetchProducts()
      setTimeout(() => {
        setEditingId(null)
        setEditSuccess('')
      }, 1800)
    } catch (err) {
      console.error('[thehamanars] Fehler beim Aktualisieren:', err)
      setEditError('Fehler beim Speichern. Bitte erneut versuchen.')
    } finally {
      setEditLoading(false)
    }
  }

  // ── Logout ─────────────────────────────────────────
  function handleLogout() {
    localStorage.removeItem(LS_KEY)
    onLogout()
  }

  return (
    <div className="admin-page">
      {/* ── Top header bar ──────────────────────── */}
      <div className="admin-page-top">
        <div className="container">
          <div className="admin-header-bar">
            <div>
              <h1 className="admin-title">Dashboard</h1>
              <p className="admin-subtitle">thehamanars &mdash; Produktverwaltung</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Abmelden
            </button>
          </div>
        </div>
      </div>

      <div className="container">

        {/* ── Add product form ─────────────────────── */}
        <div className="admin-form-card">
          <h2 className="admin-form-title">Neues Produkt hinzufügen</h2>

          {addSuccess && <div className="alert alert-success">{addSuccess}</div>}
          {addError && <div className="alert alert-error">{addError}</div>}

          <form onSubmit={handleAdd}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label className="form-label">Produkttitel</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="z. B. Handtasche Leder Schwarz"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bild-URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://beispiel.de/bild.jpg"
                  value={addImage}
                  onChange={(e) => setAddImage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Produkt-Link (extern)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://shop.beispiel.de/produkt"
                  value={addLink}
                  onChange={(e) => setAddLink(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '8px' }}
              disabled={addLoading}
            >
              {addLoading ? 'Wird gespeichert…' : 'Produkt hinzufügen'}
            </button>
          </form>
        </div>

        {/* ── Product list ─────────────────────────── */}
        <h2 className="admin-list-title">
          Alle Produkte
          {!loadingProducts && (
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '10px' }}>
              ({products.length})
            </span>
          )}
        </h2>

        {loadingProducts ? (
          <div className="loading-wrap" style={{ paddingTop: '40px' }}>
            <div className="spinner" />
            <span className="loading-text">Produkte werden geladen…</span>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'left', padding: '32px 0' }}>
            <p>Noch keine Produkte vorhanden. Füge das erste Produkt hinzu!</p>
          </div>
        ) : (
          <div className="admin-product-list">
            {products.map((product) => (
              <div key={product.id}>
                {/* ── Product row ────────────────── */}
                <div className="admin-product-item">
                  <img
                    src={product.image}
                    alt={`Vorschau: ${product.title}`}
                    className="admin-product-thumb"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/80x80?text=Bild'
                    }}
                  />

                  <div className="admin-product-info">
                    <div className="admin-product-name">{product.title}</div>
                    <div className="admin-product-id">ID: {product.id}</div>
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-product-link"
                    >
                      {product.link}
                    </a>
                  </div>

                  <div className="admin-product-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        editingId === product.id
                          ? setEditingId(null)
                          : openEdit(product)
                      }
                    >
                      {editingId === product.id ? 'Abbrechen' : 'Bearbeiten'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? 'Löschen…' : 'Löschen'}
                    </button>
                  </div>
                </div>

                {/* ── Inline edit form ──────────── */}
                {editingId === product.id && (
                  <div className="edit-form-overlay">
                    <h3 className="edit-form-title">Produkt bearbeiten</h3>

                    {editSuccess && <div className="alert alert-success">{editSuccess}</div>}
                    {editError && <div className="alert alert-error">{editError}</div>}

                    <div className="admin-form-grid">
                      <div className="form-group">
                        <label className="form-label">Produkttitel</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editState.title}
                          onChange={(e) =>
                            setEditState((s) => ({ ...s, title: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bild-URL</label>
                        <input
                          type="url"
                          className="form-input"
                          value={editState.image}
                          onChange={(e) =>
                            setEditState((s) => ({ ...s, image: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Produkt-Link (extern)</label>
                        <input
                          type="url"
                          className="form-input"
                          value={editState.link}
                          onChange={(e) =>
                            setEditState((s) => ({ ...s, link: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="edit-form-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditSave(product.id)}
                        disabled={editLoading}
                      >
                        {editLoading ? 'Wird gespeichert…' : 'Änderungen speichern'}
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => setEditingId(null)}
                        disabled={editLoading}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// ADMIN PAGE — Top-level route
// ══════════════════════════════════════════════════════
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  // Read login state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    setIsLoggedIn(stored === 'true')
  }, [])

  // While checking localStorage, show nothing (prevents flash)
  if (isLoggedIn === null) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="loading-wrap" style={{ flex: 1 }}>
          <div className="spinner" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main style={{ flex: 1 }}>
        {isLoggedIn ? (
          <AdminDashboard onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <AdminLogin onLogin={() => setIsLoggedIn(true)} />
        )}
      </main>
      <Footer />
    </div>
  )
}

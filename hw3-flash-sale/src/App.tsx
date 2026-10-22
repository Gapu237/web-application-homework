
import { useEffect, useState } from 'react'
import './App.css'
import { FlashSaleEngine } from './flashSaleEngine'
import type { EngineSnapshot } from './flashSaleEngine'

const SALE_DURATION = 15 * 60
const PRODUCT_ID = 'headphones'

const engine = new FlashSaleEngine([
  {
    id: PRODUCT_ID,
    name: 'Premium Wireless Headphones',
    price: 599000,
    initialStock: 20,
    availableStock: 20,
    reservedStock: 0,
    soldStock: 0,
  },
])

function App() {
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(
    () => engine.getSnapshot(),
  )
  const [secondsLeft, setSecondsLeft] = useState(SALE_DURATION)
  const [quantity, setQuantity] = useState(1)
  const [selectedReservationId, setSelectedReservationId] = useState('')
  const [message, setMessage] = useState('')

  const product = snapshot.products.find((item) => item.id === PRODUCT_ID)
  const activeReservations = snapshot.reservations.filter(
    (item) => item.status === 'reserved',
  )

  const syncSnapshot = () => {
    setSnapshot(engine.getSnapshot())
  }

  useEffect(() => {
    const startedAt = Date.now()

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setSecondsLeft(Math.max(0, SALE_DURATION - elapsed))
      engine.refresh()
      setSnapshot(engine.getSnapshot())
    }, 250)

    return () => window.clearInterval(timer)
  }, [])

  const handleReserve = () => {
    try {
      if (secondsLeft <= 0) {
        throw new Error('Flash Sale đã kết thúc.')
      }

      const reservation = engine.reserve(PRODUCT_ID, quantity)
      setSelectedReservationId(reservation.id)
      setMessage(
        `Giữ thành công ${reservation.quantity} sản phẩm. Mã giữ hàng: ${reservation.id}`,
      )
      syncSnapshot()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Không thể giữ sản phẩm.',
      )
      syncSnapshot()
    }
  }

  const handleCheckout = () => {
    try {
      if (!selectedReservationId) {
        throw new Error('Hãy giữ sản phẩm trước khi thanh toán.')
      }

      engine.checkout(selectedReservationId)
      setMessage('Thanh toán thành công!')
      setSelectedReservationId('')
      syncSnapshot()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Thanh toán thất bại.',
      )
      syncSnapshot()
    }
  }

  const handleCancel = () => {
    try {
      if (!selectedReservationId) {
        throw new Error('Không có lượt giữ hàng để hủy.')
      }

      engine.cancel(selectedReservationId)
      setMessage('Đã hủy giữ hàng và hoàn số lượng về kho.')
      setSelectedReservationId('')
      syncSnapshot()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Không thể hủy giữ hàng.',
      )
      syncSnapshot()
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  if (!product) {
    return <main className="sale-page">Không tìm thấy sản phẩm.</main>
  }

  return (
    <main className="sale-page">
      <header className="topbar">
        <div className="brand">FLASH<span>DEAL</span></div>
        <div className="topbar-label">HIGH-CONCURRENCY FLASH SALE</div>
      </header>

      <section className="hero">
        <p className="eyebrow">LIMITED TIME OFFER</p>
        <h1>FLASH SALE</h1>
        <p className="hero-description">
          Săn deal cực hot — số lượng có hạn!
        </p>

        <div className="countdown">
          <div className="time-box">
            <strong>{String(minutes).padStart(2, '0')}</strong>
            <span>PHÚT</span>
          </div>
          <span className="time-colon">:</span>
          <div className="time-box">
            <strong>{String(seconds).padStart(2, '0')}</strong>
            <span>GIÂY</span>
          </div>
        </div>

        <p className="sale-status">
          {secondsLeft > 0 ? 'Chương trình đang diễn ra' : 'Chương trình đã kết thúc'}
        </p>
      </section>

      <section className="product-card">
        <div className="product-visual" aria-label="Hình minh họa tai nghe">
          🎧
          <span className="discount-tag">-40%</span>
        </div>

        <div className="product-info">
          <p className="product-category">ELECTRONICS</p>
          <h2>{product.name}</h2>
          <p className="product-description">
            Tai nghe không dây với âm thanh sống động và thiết kế hiện đại.
          </p>

          <div className="price-row">
            <strong className="sale-price">
              {product.price.toLocaleString('vi-VN')}₫
            </strong>
            <del>999.000₫</del>
          </div>

          <div className="stock-section">
            <div className="stock-label">
              <span>Còn có thể mua</span>
              <strong>{product.availableStock}</strong>
            </div>
            <div className="stock-track">
              <div
                className="stock-progress"
                style={{
                  width: `${(product.availableStock / product.initialStock) * 100}%`,
                }}
              />
            </div>
            <div className="stock-label">
              <span>Đang giữ: {product.reservedStock}</span>
              <span>Đã bán: {product.soldStock}</span>
            </div>
          </div>

          <label className="quantity-label" htmlFor="quantity">
            Số lượng
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={product.availableStock}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />

          <button
            className="reserve-button"
            onClick={handleReserve}
            disabled={secondsLeft === 0 || product.availableStock === 0}
          >
            Giữ sản phẩm
          </button>

          <div className="reservation-panel">
            <div>
              <span>Lượt giữ đang hoạt động</span>
              <strong>{activeReservations.length}</strong>
            </div>
            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={!selectedReservationId}
            >
              Thanh toán
            </button>
            <button
              className="checkout-button"
              onClick={handleCancel}
              disabled={!selectedReservationId}
            >
              Hủy giữ
            </button>
          </div>

          {message && <p className="feedback" role="status">{message}</p>}

          <section className="audit-section">
            <h3>Audit Log</h3>
            {snapshot.auditLog.length === 0 ? (
              <p>Chưa có sự kiện nào.</p>
            ) : (
              <ul className="audit-list">
                {[...snapshot.auditLog].reverse().slice(0, 8).map((event) => (
                  <li key={event.id}>
                    <strong>{event.type}</strong>
                    <span>{event.message}</span>
                    <small>
                      {new Date(event.timestamp).toLocaleTimeString('vi-VN')}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>

      <footer className="footer">
        Demo project · Flash Sale Inventory Engine
      </footer>
    </main>
  )
}

export default App

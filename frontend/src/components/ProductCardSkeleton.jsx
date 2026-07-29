import './ProductCardSkeleton.css'

export default function ProductCardSkeleton() {
  return (
    <div className="product-skeleton panel">
      <div className="skeleton product-skeleton-media" />
      <div className="product-skeleton-body">
        <div className="skeleton product-skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton product-skeleton-line" style={{ width: '80%' }} />
        <div className="skeleton product-skeleton-line" style={{ width: '30%' }} />
        <div className="product-skeleton-actions">
          <div className="skeleton product-skeleton-btn" />
          <div className="skeleton product-skeleton-btn" />
        </div>
      </div>
    </div>
  )
}

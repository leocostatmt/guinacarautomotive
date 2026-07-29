import { useEffect, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa'
import './ScrollToTop.css'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      className="scroll-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
    >
      <FaArrowUp />
    </button>
  )
}

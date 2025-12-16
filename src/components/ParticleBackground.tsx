import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/use-theme'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const { theme, mounted } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particleCount = 50
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: theme === 'dark' ? Math.random() * 60 + 200 : Math.random() * 40 + 320,
      })
    }

    particlesRef.current = particles

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        )
        
        if (theme === 'dark') {
          gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 65%, ${particle.opacity})`)
          gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 55%, ${particle.opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 45%, 0)`)
        } else {
          gradient.addColorStop(0, `hsla(${particle.hue}, 60%, 75%, ${particle.opacity})`)
          gradient.addColorStop(0.5, `hsla(${particle.hue}, 60%, 65%, ${particle.opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 55%, 0)`)
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.1
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(180, 150, 220, ${opacity})` 
              : `rgba(224, 136, 170, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: theme === 'dark' ? 'lighten' : 'multiply' }}
    />
  )
}

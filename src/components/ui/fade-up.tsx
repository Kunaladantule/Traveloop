// components/ui/fade-up.tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeUpProps {
  children: ReactNode
  id?: string
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  threshold?: number
}

// ─────────────────────────────────────────────────────────────
// ✨ FadeUp Animation Wrapper (Smoother + Configurable)
// ─────────────────────────────────────────────────────────────
export function FadeUp({ 
  children, 
  id, 
  delay = 0, 
  duration = 0.5,
  className = "",
  once = true,
  threshold = 0.1
}: FadeUpProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-100px", amount: threshold }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Smooth cubic-bezier
      }}
    >
      {children}
    </motion.section>
  )
}

// ─────────────────────────────────────────────────────────────
// 🎯 Bonus: FadeIn (No movement, just opacity)
// ─────────────────────────────────────────────────────────────
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.4,
  className = ""
}: Omit<FadeUpProps, 'once' | 'threshold'>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🎯 Bonus: ScaleIn (Zoom effect)
// ─────────────────────────────────────────────────────────────
export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.4,
  className = ""
}: Omit<FadeUpProps, 'once' | 'threshold'>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
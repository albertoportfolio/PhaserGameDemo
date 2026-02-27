import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createGame } from '../game/config'
import styles from './GameContainer.module.css'

export function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    // Crea la instancia de Phaser y la monta en el div
    gameRef.current = createGame(containerRef.current.id)
    
    return () => {
      // Limpieza al desmontar el componente
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <div id="game-container" ref={containerRef} className={styles.canvas} />
    </div>
  )
}

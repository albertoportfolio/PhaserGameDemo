import { useState } from 'react';
import { GameContainer } from '../components/GameContainer';
import  styles  from './App.module.css';
type Screen = 'menu' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')

  if (screen === 'game') {
    return (
      <div className={styles.gameLayout}>
        {/* HUD superior */}
        <header className={styles.hud}>
          <span className={styles.logo}>▸ RECOLECTA ESTRELLAS</span>
          <button className={styles.btnSmall} onClick={() => setScreen('menu')}>
            ◂ PAGINA PRINCIPAL
          </button>
        </header>

        {/* Canvas del juego */}
        <main className={styles.gameArea}>
          <GameContainer />
        </main>

        {/* Barra inferior de estado */}
        <footer className={styles.statusBar}>
          <span className={styles.blink}>● REC</span>
          <span>PHASER v3 · ARCADE PHYSICS · 60FPS</span>
          <span className={styles.coords}>X:000 Y:000</span>
        </footer>
      </div>
    )
  }

  return (
    <div className={styles.menuLayout}>
      {/* Decoración de fondo */}
      <div className={styles.gridBg} aria-hidden />

      <div className={styles.menuCard}>
        <div className={styles.menuTop}>
          <div className={styles.badge}>Version 1.0</div>
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleAccent}>RECOLECTA</span>
          <br />
          ESTRELLAS
        </h1>

        <p className={styles.subtitle}>
          &gt; Recoge estrellas y gana puntos
        </p>

        <nav className={styles.menuNav}>
          <MenuBtn onClick={() => setScreen('game')} primary>
            ▸ JUGAR
          </MenuBtn>
      
        </nav>

        <div className={styles.menuFooter}>
          <div>HECHO CON PHASER 3 · REACT · VITE</div>
          <br />
          <div>Por: Alberto Peñarrubia</div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  )
}

function MenuBtn({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      className={`${styles.menuBtn} ${primary ? styles.menuBtnPrimary : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

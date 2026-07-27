/**
 * Лимоны и оливки на основном hero-видео (главная).
 * Абсолютно поверх видео, с анимацией.
 */

export default function FloatingDecor() {
  return (
    <div
      aria-hidden
      className="floating-decor"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* верхний лимон — справа сверху у видео */}
      <img
        className="decor-item"
        src="/decor/lemon.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          right: '6%',
          top: '8%',
          width: 86,
          height: 'auto',
          display: 'block',
          animation: 'decor-sway 2.4s ease-in-out 0.15s infinite',
          transformOrigin: '50% 70%',
          filter: 'drop-shadow(0 4px 10px rgba(33,25,95,.25))',
          zIndex: 4,
        }}
      />

      {/* нижний лимон — справа */}
      <img
        className="decor-item"
        src="/decor/lemon.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          right: '4%',
          bottom: '18%',
          width: 78,
          height: 'auto',
          display: 'block',
          animation: 'decor-sway-flip 2.6s ease-in-out 0.7s infinite',
          transformOrigin: '50% 70%',
          filter: 'drop-shadow(0 4px 10px rgba(33,25,95,.25))',
          zIndex: 4,
        }}
      />

      {/* оливки — как было, чуть ниже (от буквы «ск» вниз) */}
      <img
        className="decor-item"
        src="/decor/olives1b.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '56%',
          top: '18%',
          width: 70,
          height: 'auto',
          display: 'block',
          ['--sx' as string]: '-24px',
          ['--sy' as string]: '-16px',
          ['--sr' as string]: '-26deg',
          animation: 'decor-scatter 2.2s ease-in-out infinite',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.2))',
          zIndex: 4,
        }}
      />
      <img
        className="decor-item"
        src="/decor/olives2b.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '60%',
          top: '26%',
          width: 64,
          height: 'auto',
          display: 'block',
          ['--sx' as string]: '28px',
          ['--sy' as string]: '-12px',
          ['--sr' as string]: '28deg',
          animation: 'decor-scatter 2.2s ease-in-out 0.2s infinite',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.2))',
          zIndex: 4,
        }}
      />
      <img
        className="decor-item"
        src="/decor/olives1b.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '54%',
          top: '34%',
          width: 58,
          height: 'auto',
          display: 'block',
          ['--sx' as string]: '-20px',
          ['--sy' as string]: '14px',
          ['--sr' as string]: '22deg',
          animation: 'decor-scatter 2.2s ease-in-out 0.4s infinite',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.2))',
          zIndex: 4,
        }}
      />
      <img
        className="decor-item"
        src="/decor/olives2b.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '58%',
          top: '42%',
          width: 60,
          height: 'auto',
          display: 'block',
          ['--sx' as string]: '22px',
          ['--sy' as string]: '12px',
          ['--sr' as string]: '-20deg',
          animation: 'decor-scatter 2.3s ease-in-out 0.55s infinite',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.2))',
          zIndex: 4,
        }}
      />

      {/* слива слева внизу hero */}
      <img
        className="decor-item"
        src="/decor/plum.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '4%',
          bottom: '16%',
          width: 54,
          height: 'auto',
          display: 'block',
          animation: 'decor-plum 2.6s ease-in-out infinite',
          transformOrigin: '50% 80%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.2))',
          zIndex: 4,
        }}
      />

      {/* лавровый венок */}
      <img
        className="decor-item"
        src="/decor/laurel.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '48%',
          top: '6%',
          width: 72,
          height: 'auto',
          display: 'block',
          animation: 'decor-wreath 3.2s ease-in-out infinite',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.22))',
          zIndex: 4,
        }}
      />

      {/* арфа */}
      <img
        className="decor-item"
        src="/decor/harp.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          right: '28%',
          bottom: '10%',
          width: 68,
          height: 'auto',
          display: 'block',
          animation: 'decor-bob 3.8s ease-in-out 0.4s infinite',
          transformOrigin: '50% 70%',
          filter: 'drop-shadow(0 3px 8px rgba(33,25,95,.22))',
          zIndex: 4,
        }}
      />

      {/* парфенон */}
      <img
        className="decor-item"
        src="/decor/parthenon.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '42%',
          bottom: '6%',
          width: 120,
          height: 'auto',
          display: 'block',
          animation: 'decor-bob 4.4s ease-in-out 0.8s infinite',
          transformOrigin: '50% 80%',
          filter: 'drop-shadow(0 4px 10px rgba(33,25,95,.2))',
          zIndex: 3,
          opacity: 0.95,
        }}
      />

    </div>
  );
}

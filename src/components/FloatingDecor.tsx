/**
 * Лимоны и оливки в первом блоке главной.
 * Неподвижные: по просьбе школы на сайте ничего не двигается.
 */

type Item = {
  src: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width: number;
};

const ITEMS: Item[] = [
  { src: '/decor/lemon.png', right: '6%', top: '10%', width: 86 },
  { src: '/decor/lemon.png', right: '4%', bottom: '16%', width: 78 },
  { src: '/decor/olives1b.png', right: '18%', top: '22%', width: 70 },
  { src: '/decor/olives2b.png', right: '22%', bottom: '26%', width: 64 },
  { src: '/decor/olives1b.png', left: '3%', bottom: '12%', width: 58 },
];

export default function FloatingDecor() {
  return (
    <div
      aria-hidden
      className="floating-decor"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {ITEMS.map((item, i) => (
        <img
          key={`${item.src}-${i}`}
          className="decor-item"
          src={item.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: item.left,
            right: item.right,
            top: item.top,
            bottom: item.bottom,
            width: item.width,
            height: 'auto',
            display: 'block',
          }}
        />
      ))}
    </div>
  );
}

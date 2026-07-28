import { useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';

type Item = {
  src: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width: number;
};

/**
 * Фоновый декор: только лимоны и оливки, неподвижно.
 * Разная раскладка на каждой странице, чтобы фон не выглядел одинаково.
 */
const LAYOUTS: Record<string, Item[]> = {
  '/': [
    { src: '/decor/lemon.png', right: '4%', top: '18%', width: 60 },
    { src: '/decor/olives1b.png', left: '5%', top: '55%', width: 58 },
    { src: '/decor/lemon.png', right: '8%', bottom: '20%', width: 54 },
    { src: '/decor/olives2b.png', left: '4%', bottom: '10%', width: 50 },
  ],
  '/catalog': [
    { src: '/decor/lemon.png', left: '3%', top: '14%', width: 62 },
    { src: '/decor/olives2b.png', left: '5%', bottom: '18%', width: 56 },
    { src: '/decor/lemon.png', right: '4%', bottom: '12%', width: 52 },
    { src: '/decor/olives1b.png', right: '3%', top: '22%', width: 54 },
  ],
  '/all': [
    { src: '/decor/olives1b.png', right: '5%', top: '16%', width: 58 },
    { src: '/decor/lemon.png', left: '4%', top: '25%', width: 56 },
    { src: '/decor/lemon.png', right: '4%', bottom: '15%', width: 50 },
    { src: '/decor/olives2b.png', left: '4%', bottom: '18%', width: 52 },
  ],
  '/subscribe': [
    { src: '/decor/lemon.png', left: '4%', top: '18%', width: 58 },
    { src: '/decor/olives1b.png', left: '5%', bottom: '14%', width: 54 },
    { src: '/decor/lemon.png', right: '5%', bottom: '20%', width: 50 },
    { src: '/decor/olives2b.png', right: '4%', top: '26%', width: 52 },
  ],
  '/account': [
    { src: '/decor/lemon.png', left: '4%', top: '20%', width: 56 },
    { src: '/decor/olives2b.png', right: '5%', top: '24%', width: 54 },
    { src: '/decor/olives1b.png', left: '3%', bottom: '18%', width: 50 },
  ],
  '/admin': [
    { src: '/decor/olives1b.png', left: '2%', top: '22%', width: 48 },
    { src: '/decor/lemon.png', right: '3%', top: '30%', width: 50 },
    { src: '/decor/lemon.png', left: '3%', bottom: '12%', width: 46 },
  ],
  '/reset': [
    { src: '/decor/lemon.png', left: '6%', top: '25%', width: 54 },
    { src: '/decor/olives1b.png', right: '6%', top: '30%', width: 52 },
  ],
};

function resolveLayout(pathname: string): Item[] {
  if (LAYOUTS[pathname]) return LAYOUTS[pathname];
  if (pathname.startsWith('/admin')) return LAYOUTS['/admin'];
  return LAYOUTS['/'];
}

export default function SiteDecor() {
  const { pathname } = useLocation();
  const items = resolveLayout(pathname);

  return (
    <div className="site-decor" aria-hidden key={pathname}>
      {items.map((item, i) => {
        const style: CSSProperties = {
          left: item.left,
          right: item.right,
          top: item.top,
          bottom: item.bottom,
          width: item.width,
        };
        return (
          <img
            key={`${pathname}-${item.src}-${i}`}
            className="site-decor-item"
            src={item.src}
            alt=""
            draggable={false}
            style={style}
          />
        );
      })}
    </div>
  );
}

import { useLocation } from 'react-router-dom';
import type { CSSProperties } from 'react';

type Motion = 'sway' | 'fly' | 'jug' | 'plum' | 'flip' | 'wreath' | 'bob';

type Item = {
  src: string;
  motion: Motion;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width: number;
  delay?: string;
  duration?: string;
};

const MOTION_CSS: Record<Motion, string> = {
  sway: 'site-sway',
  fly: 'site-fly',
  jug: 'site-jug',
  plum: 'site-plum',
  flip: 'site-sway-flip',
  wreath: 'site-wreath',
  bob: 'site-bob',
};

/** Разная раскладка на каждой странице */
const LAYOUTS: Record<string, Item[]> = {
  '/': [
    { src: '/decor/jug.png', motion: 'jug', left: '2%', top: '20%', width: 62, delay: '0s', duration: '2.8s' },
    { src: '/decor/lemon.png', motion: 'fly', right: '4%', top: '18%', width: 60, delay: '0.5s', duration: '6.2s' },
    { src: '/decor/olives1b.png', motion: 'sway', left: '5%', top: '55%', width: 58, delay: '0.3s', duration: '2.5s' },
    { src: '/decor/lemon.png', motion: 'flip', right: '8%', bottom: '20%', width: 54, delay: '1s', duration: '3s' },
    { src: '/decor/olives2b.png', motion: 'fly', left: '18%', bottom: '10%', width: 50, delay: '1.8s', duration: '7s' },
    { src: '/decor/plum.png', motion: 'plum', right: '22%', top: '60%', width: 42, delay: '0.7s', duration: '2.6s' },
    { src: '/decor/jug.png', motion: 'fly', right: '3%', top: '42%', width: 48, delay: '2.2s', duration: '6.8s' },
    { src: '/decor/olives1b.png', motion: 'sway', left: '25%', top: '12%', width: 46, delay: '1.1s', duration: '2.9s' },
    // греческие фигурки
    { src: '/decor/laurel.png', motion: 'wreath', left: '12%', top: '38%', width: 72, delay: '0.4s', duration: '3.4s' },
    { src: '/decor/harp.png', motion: 'bob', right: '14%', top: '8%', width: 64, delay: '0.6s', duration: '4s' },
    { src: '/decor/parthenon.png', motion: 'bob', left: '3%', bottom: '28%', width: 110, delay: '1.2s', duration: '4.5s' },
  ],
  '/catalog': [
    { src: '/decor/lemon.png', motion: 'fly', left: '3%', top: '14%', width: 66, delay: '0.2s', duration: '5.8s' },
    { src: '/decor/jug.png', motion: 'jug', right: '5%', top: '22%', width: 58, delay: '0.6s', duration: '3.1s' },
    { src: '/decor/olives2b.png', motion: 'sway', left: '8%', bottom: '18%', width: 56, delay: '0.4s', duration: '2.4s' },
    { src: '/decor/lemon.png', motion: 'flip', right: '10%', bottom: '12%', width: 52, delay: '1.3s', duration: '2.8s' },
    { src: '/decor/olives1b.png', motion: 'fly', right: '28%', top: '55%', width: 48, delay: '2s', duration: '6.5s' },
    { src: '/decor/plum.png', motion: 'plum', left: '30%', top: '70%', width: 40, delay: '0.9s', duration: '2.7s' },
    { src: '/decor/jug.png', motion: 'fly', left: '2%', top: '48%', width: 50, delay: '1.5s', duration: '7.2s' },
    { src: '/decor/lemon.png', motion: 'sway', right: '2%', top: '72%', width: 46, delay: '0.1s', duration: '2.6s' },
    { src: '/decor/laurel.png', motion: 'wreath', right: '4%', top: '40%', width: 68, delay: '0.5s', duration: '3.2s' },
    { src: '/decor/harp.png', motion: 'bob', left: '6%', top: '32%', width: 58, delay: '0.9s', duration: '4.1s' },
    { src: '/decor/parthenon.png', motion: 'bob', right: '12%', bottom: '28%', width: 100, delay: '1s', duration: '4.6s' },
  ],
  '/all': [
    { src: '/decor/olives1b.png', motion: 'fly', right: '6%', top: '16%', width: 62, delay: '0.3s', duration: '6s' },
    { src: '/decor/lemon.png', motion: 'sway', left: '4%', top: '25%', width: 58, delay: '0.5s', duration: '2.7s' },
    { src: '/decor/jug.png', motion: 'jug', left: '6%', bottom: '22%', width: 54, delay: '0.8s', duration: '3s' },
    { src: '/decor/lemon.png', motion: 'fly', right: '4%', bottom: '15%', width: 50, delay: '1.4s', duration: '6.4s' },
    { src: '/decor/plum.png', motion: 'plum', right: '24%', top: '40%', width: 44, delay: '0.2s', duration: '2.5s' },
    { src: '/decor/olives2b.png', motion: 'sway', left: '22%', top: '60%', width: 52, delay: '1s', duration: '2.8s' },
    { src: '/decor/jug.png', motion: 'fly', right: '18%', top: '12%', width: 46, delay: '2.5s', duration: '7s' },
    { src: '/decor/harp.png', motion: 'bob', left: '3%', top: '42%', width: 60, delay: '1.1s', duration: '4s' },
    { src: '/decor/laurel.png', motion: 'wreath', left: '14%', top: '10%', width: 66, delay: '0.4s', duration: '3.5s' },
  ],
  '/subscribe': [
    { src: '/decor/jug.png', motion: 'fly', left: '4%', top: '18%', width: 60, delay: '0.4s', duration: '6.6s' },
    { src: '/decor/lemon.png', motion: 'flip', right: '5%', top: '28%', width: 56, delay: '0.7s', duration: '3.2s' },
    { src: '/decor/olives1b.png', motion: 'sway', left: '8%', bottom: '14%', width: 54, delay: '0.2s', duration: '2.5s' },
    { src: '/decor/lemon.png', motion: 'fly', right: '12%', bottom: '20%', width: 50, delay: '1.6s', duration: '5.9s' },
    { src: '/decor/plum.png', motion: 'plum', left: '26%', top: '50%', width: 42, delay: '1.1s', duration: '2.8s' },
    { src: '/decor/olives2b.png', motion: 'fly', right: '3%', top: '58%', width: 48, delay: '2s', duration: '7.1s' },
    { src: '/decor/jug.png', motion: 'jug', right: '26%', top: '14%', width: 44, delay: '0.9s', duration: '2.9s' },
    { src: '/decor/parthenon.png', motion: 'bob', right: '4%', bottom: '30%', width: 104, delay: '0.5s', duration: '4.4s' },
    { src: '/decor/laurel.png', motion: 'wreath', right: '16%', top: '42%', width: 64, delay: '0.3s', duration: '3.3s' },
  ],
  '/account': [
    { src: '/decor/lemon.png', motion: 'sway', left: '5%', top: '20%', width: 58, delay: '0.3s', duration: '2.6s' },
    { src: '/decor/olives2b.png', motion: 'fly', right: '6%', top: '24%', width: 56, delay: '0.8s', duration: '6.3s' },
    { src: '/decor/jug.png', motion: 'jug', left: '3%', bottom: '18%', width: 52, delay: '0.5s', duration: '3s' },
    { src: '/decor/plum.png', motion: 'plum', right: '8%', bottom: '22%', width: 40, delay: '1.2s', duration: '2.5s' },
    { src: '/decor/lemon.png', motion: 'fly', left: '20%', top: '65%', width: 48, delay: '1.9s', duration: '6.8s' },
    { src: '/decor/olives1b.png', motion: 'sway', right: '20%', top: '48%', width: 50, delay: '0.6s', duration: '2.7s' },
    { src: '/decor/harp.png', motion: 'bob', right: '4%', top: '38%', width: 62, delay: '0.7s', duration: '4.2s' },
  ],
  '/admin': [
    { src: '/decor/olives1b.png', motion: 'sway', left: '2%', top: '22%', width: 50, delay: '0.2s', duration: '2.8s' },
    { src: '/decor/lemon.png', motion: 'fly', right: '3%', top: '30%', width: 52, delay: '1s', duration: '6.5s' },
    { src: '/decor/jug.png', motion: 'jug', right: '4%', bottom: '16%', width: 48, delay: '0.7s', duration: '3.1s' },
    { src: '/decor/lemon.png', motion: 'flip', left: '4%', bottom: '12%', width: 46, delay: '1.4s', duration: '2.9s' },
    { src: '/decor/plum.png', motion: 'plum', right: '16%', top: '62%', width: 38, delay: '0.4s', duration: '2.6s' },
    { src: '/decor/olives2b.png', motion: 'fly', left: '18%', top: '48%', width: 44, delay: '2.2s', duration: '7s' },
    { src: '/decor/laurel.png', motion: 'wreath', right: '8%', top: '14%', width: 56, delay: '0.5s', duration: '3.4s' },
  ],
  '/reset': [
    { src: '/decor/jug.png', motion: 'jug', left: '8%', top: '25%', width: 56, delay: '0.3s', duration: '2.8s' },
    { src: '/decor/lemon.png', motion: 'fly', right: '8%', top: '30%', width: 54, delay: '0.9s', duration: '6s' },
    { src: '/decor/olives1b.png', motion: 'sway', left: '10%', bottom: '20%', width: 50, delay: '0.5s', duration: '2.5s' },
    { src: '/decor/plum.png', motion: 'plum', right: '12%', bottom: '25%', width: 42, delay: '1.2s', duration: '2.7s' },
    { src: '/decor/harp.png', motion: 'bob', left: '5%', top: '55%', width: 58, delay: '0.8s', duration: '4s' },
  ],
};

function resolveLayout(pathname: string): Item[] {
  if (LAYOUTS[pathname]) return LAYOUTS[pathname];
  if (pathname.startsWith('/admin')) return LAYOUTS['/admin'];
  return LAYOUTS['/'];
}

function originFor(motion: Motion): string {
  if (motion === 'jug') return '50% 85%';
  if (motion === 'wreath') return '50% 50%';
  if (motion === 'bob') return '50% 70%';
  return '50% 60%';
}

export default function SiteDecor() {
  const { pathname } = useLocation();
  const items = resolveLayout(pathname);

  return (
    <div className="site-decor" aria-hidden key={pathname}>
      {items.map((item, i) => {
        const anim = MOTION_CSS[item.motion];
        const dur = item.duration ?? '3s';
        const delay = item.delay ?? '0s';
        const style: CSSProperties = {
          left: item.left,
          right: item.right,
          top: item.top,
          bottom: item.bottom,
          width: item.width,
          // inline animation — гарантированно играет в браузере
          animation: `${anim} ${dur} ease-in-out ${delay} infinite`,
          transformOrigin: originFor(item.motion),
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

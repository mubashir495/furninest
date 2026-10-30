'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  MouseEvent,
  WheelEvent,
} from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2, Play } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constants                                                               */
/* ─────────────────────────────────────────────────────────────────────── */
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.4;

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */
interface ProductGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
  /**
   * When provided (variant gallery sync):
   *  - non-empty array  → show these images (variant-specific + merged product images)
   *  - empty array      → fall back to `images`
   */
  activeImages?: string[];
}

interface LightboxState {
  open: boolean;
  index: number;
  scale: number;
  tx: number;
  ty: number;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Component                                                               */
/* ─────────────────────────────────────────────────────────────────────── */
export function ProductGallery({
  images,
  productName,
  discount = 0,
  activeImages,
}: ProductGalleryProps) {

  /* ── Resolve the gallery to display ─────────────────────────────────── */
  const gallery: string[] = (() => {
    if (activeImages !== undefined) {
      return activeImages.length > 0 ? activeImages : images.length > 0 ? images : ['/window.svg'];
    }
    return images.length > 0 ? images : ['/window.svg'];
  })();

  /* ── Active thumbnail index ──────────────────────────────────────────── */
  const [current, setCurrent] = useState(0);

  // Reset to first image whenever the gallery set changes (variant switch)
  useEffect(() => {
    setCurrent(0);
  }, [activeImages]);

  // Clamp current when gallery shrinks
  useEffect(() => {
    if (current >= gallery.length) setCurrent(Math.max(0, gallery.length - 1));
  }, [gallery.length, current]);

  /* ── Lightbox state ─────────────────────────────────────────────────── */
  const [lb, setLb] = useState<LightboxState>({ open: false, index: 0, scale: 1, tx: 0, ty: 0 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origTx: 0, origTy: 0 });
  const thumbsRef = useRef<HTMLDivElement>(null);

  /* ── Lightbox open / close ───────────────────────────────────────────── */
  const openLightbox = (idx: number) =>
    setLb({ open: true, index: idx, scale: 1, tx: 0, ty: 0 });

  const closeLightbox = useCallback(() =>
    setLb({ open: false, index: 0, scale: 1, tx: 0, ty: 0 }), []);

  /* ── Lightbox navigation ────────────────────────────────────────────── */
  const lbPrev = useCallback(() =>
    setLb((s) => ({ ...s, index: (s.index - 1 + gallery.length) % gallery.length, scale: 1, tx: 0, ty: 0 })),
    [gallery.length]);

  const lbNext = useCallback(() =>
    setLb((s) => ({ ...s, index: (s.index + 1) % gallery.length, scale: 1, tx: 0, ty: 0 })),
    [gallery.length]);

  /* ── Zoom ───────────────────────────────────────────────────────────── */
  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomIn  = () => setLb((s) => ({ ...s, scale: clamp(s.scale + SCALE_STEP) }));
  const zoomOut = () => setLb((s) => {
    const ns = clamp(s.scale - SCALE_STEP);
    return { ...s, scale: ns, tx: ns === 1 ? 0 : s.tx, ty: ns === 1 ? 0 : s.ty };
  });

  /* ── Mouse-wheel zoom ────────────────────────────────────────────────── */
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLb((s) => {
      const ns = clamp(s.scale + (e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
      return { ...s, scale: ns, tx: ns === 1 ? 0 : s.tx, ty: ns === 1 ? 0 : s.ty };
    });
  };

  /* ── Double-click zoom toggle ────────────────────────────────────────── */
  const handleDoubleClick = () =>
    setLb((s) => s.scale > 1 ? { ...s, scale: 1, tx: 0, ty: 0 } : { ...s, scale: 2 });

  /* ── Drag / pan ─────────────────────────────────────────────────────── */
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (lb.scale <= 1) return;
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origTx: lb.tx, origTy: lb.ty };
    e.preventDefault();
  };
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    setLb((s) => ({
      ...s,
      tx: dragRef.current.origTx + (e.clientX - dragRef.current.startX),
      ty: dragRef.current.origTy + (e.clientY - dragRef.current.startY),
    }));
  };
  const stopDrag = () => { dragRef.current.dragging = false; };

  /* ── Keyboard ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!lb.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   lbPrev();
      if (e.key === 'ArrowRight')  lbNext();
      if (e.key === '+')           zoomIn();
      if (e.key === '-')           zoomOut();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lb.open, closeLightbox, lbPrev, lbNext]);

  /* ── Body scroll lock ────────────────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = lb.open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lb.open]);

  /* ── Scroll active thumb into view ──────────────────────────────────── */
  useEffect(() => {
    const el = thumbsRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [current]);

  /* ── Main-image strip navigation ────────────────────────────────────── */
  const stripPrev = () => setCurrent((c) => (c - 1 + gallery.length) % gallery.length);
  const stripNext = () => setCurrent((c) => (c + 1) % gallery.length);

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ═══════════════════════ GALLERY ═══════════════════════════ */}
      <div className="flex flex-col gap-3 w-full">

        {/* ── Main image ─────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden bg-surface-2 aspect-[4/3] cursor-zoom-in group"
          onClick={() => openLightbox(current)}
        >
          {gallery[current] && (
            <Image
              key={gallery[current]}
              src={gallery[current]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          )}

          {/* Sale badge */}
          {discount > 0 && (
            <span className="absolute top-4 left-4 z-10 bg-[#e8453c] text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
              Sale
            </span>
          )}

          {/* Expand hint */}
          <div className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={14} className="text-white" />
          </div>

          {/* Prev / Next (hover-visible) */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); stripPrev(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
              >
                <ChevronLeft size={18} className="text-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); stripNext(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
              >
                <ChevronRight size={18} className="text-foreground" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {gallery.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 pointer-events-none">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={`block rounded-full transition-all ${
                    i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnail strip (matches mockup: ~72px squares, play icon on first) */}
        {gallery.length > 1 && (
          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {gallery.map((img, idx) => (
              <button
                key={img + idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`View image ${idx + 1} of ${gallery.length}`}
                aria-pressed={current === idx}
                className={`relative shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all ${
                  current === idx
                    ? 'border-primary opacity-100 ring-1 ring-primary ring-offset-1'
                    : 'border-border opacity-60 hover:opacity-90 hover:border-muted-foreground'
                }`}
              >
                {/* Play overlay on first thumbnail (video hint) */}
                {idx === 0 && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
                    <div className="w-6 h-6 rounded-full bg-surface/85 flex items-center justify-center shadow">
                      <Play size={9} fill="currentColor" className="text-foreground ml-0.5" />
                    </div>
                  </div>
                )}
                <Image src={img} alt="" fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════ LIGHTBOX ══════════════════════════ */}
      {lb.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image lightbox — ${productName}`}
          className="fixed inset-0 z-[999] bg-black/93 flex flex-col"
          onClick={closeLightbox}
        >
          {/* ── Toolbar ─────────────────────────────────────────── */}
          <div
            className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/50 text-sm tabular-nums select-none">
              {lb.index + 1} / {gallery.length}
            </span>
            <p className="absolute left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium
                          truncate max-w-[55%] select-none">
              {productName}
            </p>
            <div className="flex items-center gap-0.5">
              <button
                onClick={zoomOut}
                disabled={lb.scale <= MIN_SCALE}
                aria-label="Zoom out"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70
                           hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white/50 text-xs w-10 text-center tabular-nums select-none">
                {Math.round(lb.scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={lb.scale >= MAX_SCALE}
                aria-label="Zoom in"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70
                           hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ZoomIn size={18} />
              </button>
              <div className="w-px h-5 bg-white/20 mx-2" />
              <button
                onClick={closeLightbox}
                aria-label="Close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white
                           hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ── Zoomable image area ──────────────────────────────── */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            style={{ cursor: lb.scale > 1 ? 'grab' : 'zoom-in' }}
          >
            <div
              onDoubleClick={handleDoubleClick}
              style={{
                transform: `scale(${lb.scale}) translate(${lb.tx / lb.scale}px, ${lb.ty / lb.scale}px)`,
                transition: dragRef.current.dragging ? 'none' : 'transform 0.18s ease',
                willChange: 'transform',
              }}
              className="relative w-full h-full max-w-5xl max-h-[calc(100vh-200px)]"
            >
              <Image
                key={gallery[lb.index]}
                src={gallery[lb.index]}
                alt={`${productName} — image ${lb.index + 1}`}
                fill
                sizes="100vw"
                className="object-contain pointer-events-none"
                priority
              />
            </div>

            {/* Prev / Next arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={lbPrev}
                  aria-label="Previous image"
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2
                             w-11 h-11 rounded-full bg-white/10 hover:bg-white/20
                             border border-white/20 flex items-center justify-center
                             text-white transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={lbNext}
                  aria-label="Next image"
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2
                             w-11 h-11 rounded-full bg-white/10 hover:bg-white/20
                             border border-white/20 flex items-center justify-center
                             text-white transition-colors"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {lb.scale === 1 && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30
                            text-xs pointer-events-none select-none">
                Double-click or scroll to zoom · drag when zoomed
              </p>
            )}
          </div>

          {/* ── Filmstrip ────────────────────────────────────────── */}
          {gallery.length > 1 && (
            <div
              className="flex gap-2 justify-center items-center px-4 py-3
                         bg-gradient-to-t from-black/60 to-transparent overflow-x-auto shrink-0"
              style={{ scrollbarWidth: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setLb((s) => ({ ...s, index: idx, scale: 1, tx: 0, ty: 0 }))}
                  aria-label={`Go to image ${idx + 1}`}
                  aria-pressed={lb.index === idx}
                  className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    lb.index === idx
                      ? 'border-white opacity-100 scale-[1.08]'
                      : 'border-transparent opacity-40 hover:opacity-75 hover:border-white/40'
                  }`}
                >
                  <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

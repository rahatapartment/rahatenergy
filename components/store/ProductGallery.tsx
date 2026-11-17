"use client";
import Image from "@/components/WebImage";
import { ArrowLeft, ArrowRight, Expand, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { productImage, type StoreProduct } from "@/lib/catalogue";

export function ProductGallery({ product }: { product: StoreProduct }) {
  const images = product.images.length ? product.images.map(encodeURI) : [productImage(product)];
  const [view, setView] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbRail = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const rail = thumbRail.current, thumb = thumbnails.current[view];
    if (!rail || !thumb) return;
    if (thumb.offsetLeft < rail.scrollLeft) rail.scrollTo({ left: thumb.offsetLeft, behavior: "instant" });
    else if (thumb.offsetLeft + thumb.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollTo({ left: thumb.offsetLeft + thumb.offsetWidth - rail.clientWidth, behavior: "instant" });
  }, [view]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  function select(index: number) { setView((index + images.length) % images.length); setZoom(100); }
  function enlarge() { setZoom(100); dialog.current?.showModal(); setOpen(true); }
  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); select(view + (event.key === "ArrowLeft" ? -1 : 1)); }
  }
  function startTouch(event: TouchEvent<HTMLDivElement>) { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }
  function endTouch(event: TouchEvent<HTMLDivElement>) {
    if (!touch.current) return;
    const dx = event.changedTouches[0].clientX - touch.current.x, dy = event.changedTouches[0].clientY - touch.current.y;
    if ((!open || zoom === 100) && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) select(view + (dx < 0 ? 1 : -1));
    touch.current = null;
  }
  const navigation = (prefix: string) => images.length > 1 && <>
    <button className="pdp-photo-arrow pdp-photo-previous" aria-label={`${prefix} previous photo`} onClick={() => select(view - 1)}><ArrowLeft size={20} /></button>
    <button className="pdp-photo-arrow pdp-photo-next" aria-label={`${prefix} next photo`} onClick={() => select(view + 1)}><ArrowRight size={20} /></button>
  </>;
  return <div className="pdp-gallery" role="region" aria-label={`${product.name} photos`} onKeyDown={keys} tabIndex={0}>
    <div className="pdp-gallery-stage" onTouchStart={startTouch} onTouchEnd={endTouch} onTouchCancel={() => { touch.current = null; }}>
      <button className="pdp-photo-open" aria-label={`Enlarge photo ${view + 1} of ${product.name}`} onClick={enlarge}>
        <Image key={images[view]} src={images[view]} alt={`${product.name} — photo ${view + 1} of ${images.length}`} width={1000} height={1000} priority={view === 0} sizes="(max-width: 800px) 92vw, (max-width: 1440px) 48vw, 650px" />
      </button>
      {navigation("Gallery")}
      <button className="pdp-photo-expand" aria-label="Open full-screen gallery" onClick={enlarge}><Expand size={18} /><span>View larger</span></button>
      <span className="pdp-photo-counter" aria-live="polite">{view + 1} / {images.length}</span>
    </div>
    <div className="pdp-thumbnails" ref={thumbRail} role="group" aria-label="Choose a product photo">
      {images.map((src, index) => <button key={src} ref={node => { thumbnails.current[index] = node; }} aria-label={`View photo ${index + 1} of ${images.length}`} aria-pressed={view === index} onClick={() => select(index)}>
        <Image src={src} alt="" width={100} height={90} sizes="100px" /><span>{index + 1}</span>
      </button>)}
    </div>
    <p className="pdp-gallery-help">Select a photo to see another view. Tap the main image to enlarge.</p>
    <dialog ref={dialog} className="pdp-lightbox" aria-label={`${product.name} full-screen gallery`} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="pdp-lightbox-heading"><p>{product.name}<span>Photo {view + 1} of {images.length}</span></p><button aria-label="Close gallery" onClick={() => dialog.current?.close()}><X size={22} /></button></div>
      <div className="pdp-lightbox-body" onTouchStart={startTouch} onTouchEnd={endTouch} onTouchCancel={() => { touch.current = null; }}>
        <div className="pdp-lightbox-canvas">{open && <Image key={images[view]} src={images[view]} alt={`${product.name} — enlarged photo ${view + 1}`} width={1600} height={1600} sizes="(max-width: 800px) 95vw, 85vw" style={{ width: `${zoom}%`, height: `${zoom}%` }} />}</div>
        {navigation("Viewer")}
      </div>
      <div className="pdp-lightbox-toolbar"><span>Use the arrows to browse every photo</span><div role="group" aria-label="Image zoom"><button aria-label="Zoom out" disabled={zoom <= 100} onClick={() => setZoom(v => Math.max(100, v - 25))}><Minus size={18} /></button><span aria-live="polite">{zoom}%</span><button aria-label="Zoom in" disabled={zoom >= 200} onClick={() => setZoom(v => Math.min(200, v + 25))}><Plus size={18} /></button></div></div>
    </dialog>
  </div>;
}

"use client";

import Image from "next/image";
import { Expand, Minus, Plus, X, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { imageFor, type StoreProduct } from "@/lib/catalogue";

export function ProductGallery({ product }: { product: StoreProduct }) {
  const [view, setView] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  function enlarge() {
    setZoom(view === 1 ? 140 : 100);
    dialog.current?.showModal();
    setOpen(true);
  }
  return (
    <div className="product-gallery-premium">
      <div className="product-gallery-topline">
        <span>{product.sku} / A CLOSER LOOK</span>
        <span>{String(view + 1).padStart(2, "0")} — 02</span>
      </div>
      <div className={`product-gallery-scene gallery-view-${view}`}>
        <Image
          src={imageFor(product.category)}
          alt={`Illustrative ${product.category.toLowerCase()} photography; not the exact ${product.name}`}
          width={1000}
          height={1000}
          priority
          sizes="(max-width: 800px) 88vw, 49vw"
        />
        <span className="gallery-registration" aria-hidden="true" />
        <button
          className="gallery-expand"
          aria-label="Enlarge product image"
          onClick={enlarge}
        >
          <Expand size={18} strokeWidth={1.3} />
        </button>
        <div className="gallery-scene-label">
          <span>
            {view === 0 ? "The full composition." : "A study in detail."}
          </span>
          <button onClick={enlarge}>
            Look closer <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
      <div
        className="product-gallery-selection"
        role="group"
        aria-label="Product image views"
      >
        {["Full composition", "Detail crop"].map((label, index) => (
          <button
            key={label}
            aria-pressed={view === index}
            onClick={() => setView(index)}
          >
            <span className={`gallery-thumbnail thumb-view-${index}`}>
              <Image
                src={imageFor(product.category)}
                alt=""
                width={60}
                height={60}
              />
            </span>
            <span>
              <small>0{index + 1} / VIEW</small>
              {label}
            </span>
            <span className="gallery-selection-dot" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="product-image-disclosure">
        Illustrative category photography. The crop is the same image, not a
        second product angle. Exact product photographs require confirmation.
      </p>
      <dialog
        ref={dialog}
        className="product-image-viewer"
        aria-label={`${product.name} illustrative image viewer`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="viewer-heading">
          <div>
            <span className="eyebrow">A CLOSER PERSPECTIVE</span>
            <p>{product.name}</p>
          </div>
          <button
            aria-label="Close enlarged image"
            onClick={() => dialog.current?.close()}
          >
            <X size={21} />
          </button>
        </div>
        <div className="viewer-canvas">
          <Image
            src={imageFor(product.category)}
            alt={`Enlarged illustrative ${product.category.toLowerCase()}; not the exact product`}
            width={1200}
            height={1200}
            sizes="90vw"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        </div>
        <div className="viewer-toolbar">
          <p>Illustrative photography · Exact model awaits confirmation</p>
          <div
            className="viewer-zoom"
            role="group"
            aria-label="Image magnification"
          >
            <button
              aria-label="Zoom out"
              disabled={zoom <= 100}
              onClick={() => setZoom((value) => Math.max(100, value - 20))}
            >
              <Minus size={17} />
            </button>
            <span aria-live="polite">{zoom}%</span>
            <button
              aria-label="Zoom in"
              disabled={zoom >= 180}
              onClick={() => setZoom((value) => Math.min(180, value + 20))}
            >
              <Plus size={17} />
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

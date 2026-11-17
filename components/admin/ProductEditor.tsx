"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/WebImage";
import Link from "next/link";
import { categories, type StoreProduct } from "@/lib/catalogue";

export function ProductEditor({ product }: { product: StoreProduct }) {
  const [images, setImages] = useState(product.images);
  const [specifications, setSpecifications] = useState<[string, string][]>(Object.entries(product.specifications));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  async function upload(file?: File) {
    if (!file) return;
    if (images.length >= 20) { setError(true); setMessage("Use at most 20 images."); return; }
    if (file.size > 10 * 1024 * 1024) { setError(true); setMessage("Choose an image smaller than 10 MB."); return; }
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/admin/product-images", { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setImages(current => current.includes(data.src) ? current : [...current, data.src]);
      setError(false); setMessage("Image compressed and uploaded. Save the product to publish it.");
    } catch (e) { setError(true); setMessage(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      const filled = specifications.filter(([name, value]) => name.trim() || value.trim());
      if (filled.some(([name, value]) => !name.trim() || !value.trim())) throw new Error("Fill both the name and value for each specification.");
      if (new Set(filled.map(([name]) => name.trim())).size !== filled.length) throw new Error("Each specification must have a different name.");
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: form.get("name"), description: form.get("description"), category: form.get("category"), images, specifications: Object.fromEntries(filled.map(([name, value]) => [name.trim(), value.trim()])),
        seoTitle: form.get("seoTitle"), seoDescription: form.get("seoDescription"), reason: form.get("reason"), version: product.contentVersion ?? 0,
      }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setError(false); setMessage("Product saved. The storefront now uses these details."); router.refresh();
    } catch (e) { setError(true); setMessage(e instanceof Error ? e.message : "Unable to save."); }
    finally { setBusy(false); }
  }
  function move(index: number, destination: number) {
    setImages(current => { const next = [...current]; const [image] = next.splice(index, 1); next.splice(destination, 0, image); return next; });
  }
  return <form onSubmit={save} className="product-editor">
    <div className="admin-section-heading"><div><span className="eyebrow">{product.sku}</span><h2>{product.name}</h2></div><Link className="admin-table-link" href={`/shop/${product.slug}`}>View product ↗</Link></div>
    <p className="small muted">The product URL and identity stay unchanged. Edit price and stock in <Link href="/admin/inventory">Inventory</Link>.</p>
    <fieldset disabled={busy} className="product-editor-fields">
      <legend>Product details</legend>
      <label>Name<input name="name" required minLength={2} maxLength={150} defaultValue={product.name} /></label>
      <label>Category<select name="category" defaultValue={product.category}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <label className="editor-wide">Description<textarea name="description" required minLength={10} maxLength={3000} rows={4} defaultValue={product.description} /></label>
      <div className="editor-wide"><span>Specifications</span>
        {specifications.map(([name, value], index) => <div className="editor-spec-row" key={index}>
          <label><span className="sr-only">Specification name {index + 1}</span><input value={name} maxLength={100} placeholder="e.g. Capacity" onChange={event => setSpecifications(current => current.map((row, i) => i === index ? [event.target.value, row[1]] : row))} /></label>
          <label><span className="sr-only">Specification value {index + 1}</span><input value={value} maxLength={500} placeholder="e.g. 10kWh" onChange={event => setSpecifications(current => current.map((row, i) => i === index ? [row[0], event.target.value] : row))} /></label>
          <button type="button" aria-label={`Remove specification ${index + 1}`} onClick={() => setSpecifications(current => current.filter((_, i) => i !== index))}>Remove</button>
        </div>)}
        <button type="button" className="admin-table-link" disabled={specifications.length >= 30} onClick={() => setSpecifications(current => [...current, ["", ""]])}>+ Add specification</button>
      </div>
      <label>Search title<input name="seoTitle" required minLength={2} maxLength={150} defaultValue={product.seo.title} /></label>
      <label>Search description<textarea name="seoDescription" required minLength={10} maxLength={300} defaultValue={product.seo.description} rows={3} /></label>
    </fieldset>
    <fieldset disabled={busy} className="product-editor-gallery"><legend>Product photos</legend>
      <p className="small muted">The first image is the cover on the shop and homepage. JPG, PNG and WebP uploads are compressed automatically. Keep at least one image.</p>
      <div className="editor-image-grid">{images.map((src, index) => <div className="editor-image" key={src}>
        <Image src={encodeURI(src)} alt={`Product photo ${index + 1}`} width={180} height={160} sizes="180px" />
        <strong>{index === 0 ? "Cover image" : `Image ${index + 1}`}</strong>
        <div className="editor-image-actions"><button type="button" disabled={busy || index === 0} onClick={() => move(index, 0)}>Set cover</button><button type="button" aria-label={`Move image ${index + 1} earlier`} disabled={busy || index === 0} onClick={() => move(index, index - 1)}>←</button><button type="button" aria-label={`Move image ${index + 1} later`} disabled={busy || index === images.length - 1} onClick={() => move(index, index + 1)}>→</button><button type="button" disabled={busy || images.length === 1} onClick={() => setImages(current => current.filter(image => image !== src))}>Remove</button></div>
      </div>)}</div>
      <label className="editor-upload">Upload a photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || images.length >= 20} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void upload(file); }} /></label>
    </fieldset>
    <label className="editor-reason">Reason for this change<input name="reason" required minLength={5} maxLength={500} disabled={busy} placeholder="Updated product details or photography" /></label>
    <button className="button dark" disabled={busy}>{busy ? "Working…" : "Save product"}</button>
    {message && <p className={error ? "notice error" : "notice"} role={error ? "alert" : "status"}>{message}</p>}
  </form>;
}

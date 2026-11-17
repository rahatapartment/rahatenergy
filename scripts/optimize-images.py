"""Create cached, responsive WebP images. Requires cwebp and macOS sips.

Original uploads stay untouched. Run npm run images:optimize after adding photos.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import base64
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
SOURCES = sorted(p for folder in ('images', 'products') for p in (PUBLIC / folder).rglob('*')
                 if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'})
SETTINGS = 'webp-v1-q78-m6-160-480-960-1600'


def convert(source):
    relative = source.relative_to(PUBLIC)
    digest = hashlib.sha256(source.read_bytes() + SETTINGS.encode()).hexdigest()[:16]
    destination = PUBLIC / 'optimized' / relative.parent
    destination.mkdir(parents=True, exist_ok=True)
    info = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(source)], text=True)
    dimensions = {line.split(':')[0].strip(): int(line.split(':')[1]) for line in info.splitlines()
                  if 'pixelWidth:' in line or 'pixelHeight:' in line}
    width, height = dimensions['pixelWidth'], dimensions['pixelHeight']
    # Never upscale; preserve aspect ratio, transparency and readable product labels.
    max_width = min(width, 1600, round(width * 2000 / height))
    quality = '88' if source.stem == 'logo' else '78'
    variants = []
    for size in sorted({min(max_width, target) for target in (160, 480, 960, 1600)}):
        target = destination / f'{source.name}-{digest}-{size}.webp'
        if not target.exists():
            subprocess.run(['cwebp', '-quiet', '-q', quality, '-m', '6', '-alpha_q', '100',
                            '-metadata', 'none', '-resize', str(size), '0', str(source), '-o', str(target)], check=True)
        variants.append({'src': '/' + target.relative_to(PUBLIC).as_posix(), 'width': size, 'bytes': target.stat().st_size})
    # Tiny previews avoid empty image areas while the responsive image downloads.
    preview = subprocess.check_output(['cwebp', '-quiet', '-q', '30', '-resize', str(min(width, 16)), '0', str(source), '-o', '-'])
    return '/' + relative.as_posix(), {
        'width': width, 'height': height,
        'blurDataURL': 'data:image/webp;base64,' + base64.b64encode(preview).decode(),
        'variants': variants,
    }


with ThreadPoolExecutor(max_workers=4) as pool:
    manifest = dict(pool.map(convert, SOURCES))
(ROOT / 'lib/image-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
original = sum(p.stat().st_size for p in SOURCES)
largest = sum(v['variants'][-1]['bytes'] for v in manifest.values())
print(f'{len(SOURCES)} images: {original / 1e6:.2f} MB originals; {largest / 1e6:.2f} MB largest WebP set; '
      f'{(1-largest/original)*100:.1f}% smaller. Originals preserved.')

// Renders every brand image from one design: Android launcher icons and splash screens,
// web/PWA icons (incl. iPhone home screen) and Google Play store graphics.
// Requires Playwright with Chromium:  node scripts/brand-assets.cjs
const { chromium } = require('playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const app = path.join(__dirname, '..');
const repo = path.join(app, '..');
const res = path.join(app, 'android', 'app', 'src', 'main', 'res');
const vendor = path.join(repo, 'css', 'vendor');
const BG = '#0B0914';
const GRADIENT = 'linear-gradient(135deg, #7C3AED 0%, #C026D3 55%, #EC4899 100%)';

const head = `<meta charset="utf-8">
<link rel="stylesheet" href="file://${vendor}/fontawesome/css/all.min.css">
<link rel="stylesheet" href="file://${vendor}/heebo/heebo.css">
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; font-family: 'Heebo Variable', sans-serif; }
  .tile { display: flex; align-items: center; justify-content: center; background: ${GRADIENT}; position: relative; overflow: hidden; }
  .tile::before { content: ''; position: absolute; inset: 0; background: radial-gradient(90% 70% at 30% 15%, rgba(255,255,255,.35), transparent 60%); }
  .glyph { color: #fff; position: relative; filter: drop-shadow(0 6% 10% rgba(40, 0, 70, .35)); }
</style>`;

// size: output px; shape: 'square' | 'rounded' | 'circle' | 'none' (glyph only); glyph: fraction of size.
function iconHtml({ shape, glyph }) {
  const radius = { square: '0', rounded: '22.5%', circle: '50%' }[shape];
  const tile = shape === 'none'
    ? `<i class="fa-solid fa-cloud-arrow-down glyph" style="font-size:${glyph * 100}vw"></i>`
    : `<div class="tile" style="width:100vw;height:100vw;border-radius:${radius}"><i class="fa-solid fa-cloud-arrow-down glyph" style="font-size:${glyph * 100}vw"></i></div>`;
  return `<!doctype html><html><head>${head}</head><body>${tile}</body></html>`;
}

function splashHtml() {
  return `<!doctype html><html><head>${head}<style>body{background:${BG}}
    .glow{position:absolute;width:70vmin;height:70vmin;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.45),transparent 65%);}
  </style></head><body><div class="glow"></div>
  <div class="tile" style="width:26vmin;height:26vmin;border-radius:22.5%;box-shadow:0 3vmin 8vmin rgba(124,58,237,.55)">
    <i class="fa-solid fa-cloud-arrow-down glyph" style="font-size:13vmin"></i></div></body></html>`;
}

function featureHtml() {
  return `<!doctype html><html lang="he" dir="rtl"><head>${head}<style>
    body{background:${BG};justify-content:space-between;padding:0 72px;direction:rtl}
    .a{position:absolute;width:520px;height:520px;border-radius:50%;filter:blur(80px)}
    h1{font-size:64px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1.05}
    h1 span{background:linear-gradient(135deg,#C084FC,#F472B6 55%,#60A5FA);-webkit-background-clip:text;color:transparent}
    p{font-size:30px;color:#D8D4F0;margin-top:14px;font-weight:500}
    .pill{display:inline-block;margin-top:22px;padding:8px 20px;border-radius:999px;font-size:22px;font-weight:800;color:#0B0914;background:linear-gradient(135deg,#FBBF24,#F472B6)}
  </style></head><body>
    <div class="a" style="background:rgba(124,58,237,.45);top:-200px;right:-120px"></div>
    <div class="a" style="background:rgba(236,72,153,.3);bottom:-260px;left:120px"></div>
    <div style="position:relative">
      <h1>MediaDownloader <span>Pro</span></h1>
      <p>סרטונים ושמע מהרשתות, בלחיצה אחת</p>
      <span class="pill">7 ימים חינם</span>
    </div>
    <div class="tile" style="width:260px;height:260px;border-radius:58px;box-shadow:0 30px 80px rgba(124,58,237,.6);position:relative">
      <i class="fa-solid fa-cloud-arrow-down glyph" style="font-size:132px"></i></div>
  </body></html>`;
}

async function render(page, html, width, height, out, transparent = true) {
  const file = path.join(os.tmpdir(), `brand-${process.pid}.html`);
  fs.writeFileSync(file, html);
  await page.setViewportSize({ width, height });
  await page.goto(`file://${file}`);
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, omitBackground: transparent });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  // Android launcher icons (legacy + round) and the adaptive-icon foreground layer.
  const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [name, scale] of Object.entries(densities)) {
    const dir = path.join(res, `mipmap-${name}`);
    const legacy = Math.round(48 * scale);
    await render(page, iconHtml({ shape: 'rounded', glyph: 0.5 }), legacy, legacy, path.join(dir, 'ic_launcher.png'));
    await render(page, iconHtml({ shape: 'circle', glyph: 0.48 }), legacy, legacy, path.join(dir, 'ic_launcher_round.png'));
    const fg = Math.round(108 * scale);
    // Only the inner 66dp of 108dp is guaranteed visible, so the glyph stays small.
    await render(page, iconHtml({ shape: 'none', glyph: 0.36 }), fg, fg, path.join(dir, 'ic_launcher_foreground.png'));
  }

  // Splash screens (Android < 12; newer versions use the icon on the brand background).
  for (const dir of fs.readdirSync(res).filter(d => d.startsWith('drawable'))) {
    const file = path.join(res, dir, 'splash.png');
    if (!fs.existsSync(file)) continue;
    const { width, height } = await sizeOf(page, file);
    await render(page, splashHtml(), width, height, file, false);
  }

  // Web / PWA / iPhone home screen.
  const icons = path.join(repo, 'icons');
  await render(page, iconHtml({ shape: 'rounded', glyph: 0.5 }), 192, 192, path.join(icons, 'icon-192.png'));
  await render(page, iconHtml({ shape: 'rounded', glyph: 0.5 }), 512, 512, path.join(icons, 'icon-512.png'));
  await render(page, iconHtml({ shape: 'square', glyph: 0.38 }), 512, 512, path.join(icons, 'icon-maskable-512.png'), false);
  await render(page, iconHtml({ shape: 'square', glyph: 0.5 }), 180, 180, path.join(icons, 'apple-touch-icon.png'), false);
  await render(page, iconHtml({ shape: 'rounded', glyph: 0.56 }), 32, 32, path.join(icons, 'favicon-32.png'));

  // Google Play listing graphics.
  const store = path.join(app, 'store-assets');
  await render(page, iconHtml({ shape: 'square', glyph: 0.5 }), 512, 512, path.join(store, 'play-icon-512.png'), false);
  await render(page, featureHtml(), 1024, 500, path.join(store, 'feature-graphic-1024x500.png'), false);

  await browser.close();
  console.log('Brand assets written.');
})();

async function sizeOf(page, file) {
  const data = fs.readFileSync(file);
  // PNG IHDR: width and height are big-endian at bytes 16-23.
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

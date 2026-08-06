# Analisis Teknis growon.kr — "Signature Scene" Three.js Portfolio

> **Tanggal analisis:** 5 Agustus 2026
> **URL:** https://growon.kr/
> **Metode:** Inspeksi bundle statis (chunk `/_next/static/chunks/`), GLB decoder, dan pengujian interaksi langsung.
> **Tujuan:** Menjadi dasar plan redesign transisi v3 portfolio.

---

## 1. Ringkasan Eksekutif

growon.kr adalah portfolio dari **GROWON**, sebuah studio web kreatif asal Korea. Alih-alih halaman scroll biasa, growon.kr menampilkan **satu "signature scene" meja kerja 3D realtime** berisi 9 objek kecil yang stylized (low-poly). Objek-objek itu **sekaligus menjadi navigasi utama** situs:

| Objek | Aksi |
|---|---|
| Monitor | Membuka panel **Work** (daftar karya) |
| Notebook | Membuka panel **About** |
| Cangkir kopi | Membuka panel **Contact** |
| Turntable | Memainkan musik + disc berputar mengikuti analisis audio |
| Lampu meja | Menyalakan/mematikan point light |
| Kursi | SFX berderit |
| Tanaman | SFX daun bergesek |
| Pensil | Fisika: menggelinding jatuh dari meja + boing synth |
| Meja | Elemen statis, panggung semua interaksi |

Pola desainnya: **siteless-first** (tanpa navbar konvensional), **satu scene sebagai hero permanen**, dan **panel overlay** yang muncul saat objek diklik (menggunakan `history.pushState` → panel bisa di-back/forward dengan tombol browser).

---

## 2. Stack Teknis

Dikonfirmasi dari bundle (Turbopack):

- **Next.js 15+** (App Router) dengan **Turbopack** — bundle minified + `/_next/static/chunks/*.js`, kompilasi client.
- **React 19** + **TypeScript**.
- **CSS Modules** + class utility.
- **Framer Motion** (motion primitives untuk panel/animation).
- **sonner** (toast notifications) — terlihat di chunk `0px5fxc5q9~pp.js`.
- **GA4** (tag `G-EP8N7R97M0`).
- Gambar work panel di-serve dari **Sanity CDN** (`cdn.sanity.io`) — headless CMS untuk karya.
- **3D:** `@react-three/fiber` + `@react-three/drei` + `three.js`, **client-only** (dimuat via `next/dynamic` dengan `ssr: false`).

**Struktur halaman:**

- `/` — scene 3D + petunjuk "Move & interact".
- `/work`, `/about`, `/contact` — panel yang dibuka objek scene (single-page stack, bukan halaman terpisah).
- `/404` — glitch effect 2D canvas.
- `/invoice`, `/admin`, `/process` — **tanpa 3D** (di-exclude via `ExperienceShellGate`), hanya fallback CSS `bg_home.webp`.

---

## 3. Arsitektur 3D — Scene & Pengaturan

### 3.1 Canvas (dari chunk `0lzpcln.qrjep.js`)

```js
<Canvas
  dpr={[1, 2]}
  shadows
  camera={{ position: [5.6, 4.3, 6.4], fov: 30, near: 0.1, far: 60 }}
>
```

- **kamera** `[5.6, 4.3, 6.4]` fov 30 (telephoto-ish → komposisi miring dramatis), far 60.
- **shadows** aktif (PCFSoft shadow map dari directional light, resolusi 1024).
- **dpr [1, 2]** — membatasi res lewat 2× agar tidak boros di retina.

### 3.2 Objek Scene (`SCENE_OBJECTS`)

9 objek didefinisikan sebagai satu array konfigurasi (`id`, `label`, `position`, `scale`, `dropOrder`, `audio`, `action`):

- **7 objek GLB** (Draco-compressed): desk, monitor, turntable, notebook, cup, chair, plant.
- **2 objek prosedural**: pencil (silinder + konus) & lamp — dibuat langsung di kode dengan `RoundedBox`/geometry dasar.
- **dropOrder**: setiap objek jatuh dari y=6 dengan stagger; meja jatuh paling awal, objek di atasnya mengikuti — memberi animasi "drop-in" beruntun ~1 detik.

### 3.3 Lighting

- `ambientLight` lembut (fill).
- **Directional key** (kamera shadow 1024, shadow area dibatasi) — cahaya utama meja.
- **Rim light** (dari belakang) untuk memisahkan siluet objek dari background.
- `hemisphereLight` (sky/ground).
- **Lampu meja = point light** hangat dengan intensitas animasi **0 ↔ 34** saat diklik (scene "menyala" saat lamp dinyalakan).
- `ContactShadow` dari drei untuk bayangan lembut di bawah objek.

### 3.4 Tekstur & Material

- Satu material PBR `doubleSided` utama per objek, **palette flat dari CSS vars** (`--ink`, `--paper`) — warna material 3D **dibaca runtime dari CSS custom properties**, jadi desain sistem DOM dan WebGL selalu sinkron.
- Tidak ada baked lighting; kontras dicapai dengan material flat + lighting + outline/edge.

---

## 4. Pipeline & Optimasi Aset

Konfirmasi GLB dengan `glTF-Transform` v4.4.2:

| File | Keterangan |
|---|---|
| `/models/desk.glb` | 1.5 MB |
| `/models/monitor.glb` | 1.3 MB |
| `/models/lamp.glb` | 1.1 MB |
| (+ turntable, notebook, cup, chair, plant) | ~1.1–1.5 MB/objek |

**Teknik optimasi di dalam GLB:**

- `KHR_draco_mesh_compression` — geometri di-compress.
- `KHR_mesh_quantization` — posisi/uv quantized.
- `EXT_texture_webp` — tekstur WebP (lebih kecil dari PNG/JPG).
- ~7 GLB × ~1.3 MB ≈ **±9 MB total** — cukup besar; dikompensasi dengan loading screen + prefetch.

**Lainnya:**

- `useGLTF.preload(...)` di boot untuk semua model.
- `next/link` prefetch untuk `/work`, `/contact`, `/about`.
- **PanelPrefetch**: gambar panel work di-preload tersembunyi (`opacity: 0`) setelah 2.5 detik scene berjalan.
- Fallback `bg_home.webp` bila WebGL gagal / di `/invoice` dsb.

---

## 5. Teknik Visual Khas

### 5.1 CRT / Glitch Shader

Shader fragment (modul 805172, chunk `0ic3_.ytmevj-.js`) diterapkan sebagai efek layar penuh dengan **additive blending**:

- **Noise hash** yang di-step per **24 fps** (bukan per-frame mulus → kesan retro).
- **Glitch band** horizontal random + **RGB channel shift**.
- **Scanline** tebal + **vignette** radial.
- Ditambah versi **2D canvas GlitchFX** untuk halaman 404 (chunk `0bf.udahlztv2.js`) — identitas glitch konsisten di seluruh situs.

### 5.2 Camera Rig Kustom

Tidak pakai OrbitControls bawaan. Rig kustom:

- **Parallax mouse**: kamera bergeser ±5° mengikuti posisi pointer (halus, lerp).
- **Dolly** saat membuka panel: lerp posisi kamera dalam **`DOLLY_SEC = 0.4s`**, push-in **0.6** (kamera maju 40% mendekati objek).
- **Framing `Box3`**: bounding box objek dihitung lalu kamera diarahkan otomatis ke tengahnya (animasi terasa "ditujukan" ke objek).
- **Transisi dua langkah (`pendingIn`)**: kamera move → set state panel → masuk.
- **Gesture kustom** (bukan OrbitControls): drag putar clamp **±18°**, pinch zoom **1×–1.6×**, pan horizontal X.
- Gesture **nonaktif** saat `prefers-reduced-motion` atau pointer `coarse` (mobile tetap bisa, tapi dibatasi).

### 5.3 Parallax Global

Seluruh scene bergeser ±10° terhadap pointer — meja terasa "mengambang" dan hidup meski pengguna tidak mengklik apa pun.

---

## 6. Audio Design (Web Audio API)

Bukan sekadar `<audio>` — sistem audio sintesis:

- **Unlock on gesture pertama**: `AudioContext` dibuat/resume saat user pertama kali menyentuh/klik (syarat autoplay browser).
- **SFX sintesis realtime** (oscillator + envelopes) untuk klik/kursor, termasuk **boing pensil**.
- **Sampel mp3** di-decode & di-cache ke `AudioBuffer`: `whoosh.mp3` (panel), `book.mp3`, `coffee.mp3`, `chair_squeaking.mp3`, `leaves.mp3`, `reel_whoosh.mp3`.
- **Musik**: `AudioBufferSourceNode` loop saat turntable diklik; **`AnalyserNode`** menganalisis output → kecepatan rotasi disc mengikuti musik, tonearm turun.
- Semua suara di-routing ke master gain (pintu mute global).

---

## 7. Loading Screen & UX Boot

- Teks boot: **"Setting the scene…"** + progress bar.
- Progress diambil dari `THREE.LoadingManager` (bukan fake timer).
- **Minimum 500ms** agar tidak berkedip, **timeout 12s** untuk antisipasi jaringan lambat.
- Petunjuk interaksi muncul setelah scene siap: "Move & interact" + ikon scroll.
- Cursor berubah per objek (pointer) + label objek muncul di hover (raycast + tooltip DOM).

---

## 8. Works Reel (Panel Work)

- Carousel **3 lapis** (item atas / item tengah / item bawah) dengan band WebGL di belakangnya.
- **Momentum wheel/touch** — scroll terasa seperti menggulir rol (inertia).
- Ganti item memicu `reel_whoosh.mp3` + transisi layer.
- Panel work memiliki **wordmark besar** di kiri (brand typography) dan konten item di kanan.

---

## 9. Kesimpulan & Takeaway untuk Transisi v3

Yang membuat growon.kr berkesan dan layak diadopsi:

1. **Satu scene = identitas** — portfolio tidak butuh banyak halaman; satu meja kerja sudah bercerita.
2. **Objek = navigasi** — interaksi intuitif tanpa navbar (tap monitor = lihat karya).
3. **State tanpa refresh** — panel via `history.pushState`, back/forward browser jalan.
4. **Semua indra disapa** — visual (CRT shader), audio (sintesis + musik), fisik (parallax + drop-in) dalam 1 boot.
5. **Graceful degradation** — WebGL gagal → gambar fallback; halaman non-marketing → tanpa 3D.
6. **Performa dijaga eksplisit** — dpr cap, draco, webp, prefetch, loading manager.
7. **Desain sistem sinkron** — CSS vars dibaca material 3D (satu sumber warna).

### Batasan/risiko yang perlu diantisipasi

- ±9 MB aset 3D → butuh loading screen berkualitas + min. waktu minimum agar tidak terasa lambat.
- Scene 3D tidak ideal untuk konten teks panjang → panel overlay tetap menyediakan ruang membaca.
- Aksesibilitas: interaksi objek harus punya alternatif (keyboard/fallback) — growon menyediakan route URL sehingga konten tetap bisa diakses tanpa 3D.

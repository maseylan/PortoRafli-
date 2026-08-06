# Plan Redesign v3 → Signature Scene ala growon.kr

> **Dokumen pendamping:** `docs/growon-kr-analysis.md`
> **Tujuan:** Mentransisikan portfolio v3 (pinned-scroll multi-section) menjadi **satu scene meja kerja 3D interaktif** di mana objek meja menjadi navigasi — mengikuti pola growon.kr, tanpa membuang data/komponen v3 yang sudah bagus.
> **Status:** Proposal awal — implementasi bertahap, setiap fase punya acceptance criteria.

---

## 1. Konsep: "QA Developer Desk"

growon.kr pakai meja studio kreatif (notebook, cangkir kopi, turntable). Untuk identitas Rafli (QA Automation Engineer + Fullstack Developer), konsep meja kerja:

| Objek Scene | Navigasi ke | Identitas |
|---|---|---|
| **Monitor** (GLB) | **Selected Works** (9 proyek) | Karya → replika growon |
| **Laptop** (GLB) | **Experience** (3 pengalaman) | Karier |
| **Notebook** (GLB) | **About** | Bio + filosofi |
| **Cangkir kopi** (GLB) | **Contact** | Hubungi |
| **Terminal/console** (prosedural) | toggle musik + AnalyserNode | DNA QA/Dev |
| **Bug/serangga di kaca** (prosedural) | SFX + easter egg | QA testing |
| **Lampu meja** | toggle point light 0↔34 | replika growon |
| **Keyboard** (prosedural) | typing SFX di hover | Fullstack |
| **Pensil** | fisika menggelinding | replika growon |
| **Meja** (GLB) | statis, panggung | replika growon |

**Keputusan arsitektur (rekomendasi):** **Hybrid — scene sebagai hero permanen + section yang ada sebagai panel.** Section v3 (`ExperienceSection`, `ProjectsSection`, `AboutSection`, `FooterSection`, `ProjectDetailModal`, `ContactModal`) **dipakai ulang apa adanya**, tapi tidak lagi dipin-scroll bertumpuk — menjadi panel overlay yang dibuka objek scene. Ini langkah terkecil dari struktur yang ada (pinned scroll tetap bisa dipertahankan untuk fallback non-WebGL).

---

## 2. Strategi Transisi (Incremental, 7 Fase)

Setiap fase harus **shippable** — situs tetap hidup di tiap tahap.

### Fase 0 — Persiapan & Baseline (0.5 hari)

- [ ] Screenshot/video baseline performa (Lighthouse + `npm run build`) sebelum perubahan.
- [ ] Audit deps: konfirmasi `three@0.174`, `@react-three/fiber@9`, `@react-three/drei@10` (sudah terpasang di v3 — tidak perlu tambah apa pun untuk Fase 1–3).
- [ ] Buat folder `src/components/scene/` + `src/hooks/` + `src/audio/`.
- [ ] Pisahkan data navigasi dari `PinnedScrollContainer` ke `src/config/sceneConfig.ts` (mirip `SCENE_OBJECTS` growon).
- **Accept:** build hijau; tidak ada komponen berubah.

### Fase 1 — Fondasi Scene (1–2 hari)

Buat `src/components/scene/SceneCanvas.tsx` (mengganti `HeroCanvas3D` di Hero):

- [ ] `<Canvas dpr={[1,2]} shadows camera={{position:[5.6,4.3,6.4], fov:30}}>` — parameter persis growon.
- [ ] Lighting: ambient + directional key (shadow 1024) + rim + hemisphere + `ContactShadow` (drei).
- [ ] **Camera rig kustom** (jangan OrbitControls): parallax mouse ±5° (lerp), dolly ke objek (`DOLLY_SEC = 0.4s`, push-in 0.6), framing via `Box3`.
- [ ] Gesture kustom: drag rotasi clamp ±18°, pinch 1–1.6×, pan X; **nonaktif saat `prefers-reduced-motion` / coarse pointer**.
- [ ] Warna material dibaca dari CSS vars (`--color-primary` amber, `--color-secondary` cobalt, `--color-surface`) — sinkron dengan design system v3.
- **Accept:** meja+objek tampil di hero, parallax halus, kamera dolly bekerja, reduced-motion aman.

### Fase 2 — Objek Scene & Drop-in (2–3 hari)

- [ ] Buat `sceneConfig.ts` dengan array objek: `{ id, label, position, scale, dropOrder, audio, action }`.
- [ ] **dropOrder**: objek jatuh berstagger dari y=6; meja paling awal (drop-in ~1 detik beruntun).
- [ ] **Strategi aset:**
  - **GLB (3 objek prioritas):** monitor, laptop/notebook, meja — cari free low-poly (`Sketchfab`/`Poly Haven`), konversi via `glTF-Transform v4.4.2`: `KHR_draco_mesh_compression` + `KHR_mesh_quantization` + `EXT_texture_webp`, single material PBR `doubleSided`, target ≤1.5 MB/objek.
  - **Prosedural (sisanya):** cangkir (lathe/cylinder), keyboard (RoundedBox rows), lamp (cylinder + shade), pensil (cylinder + cone), bug (sphere+segmen) — pakai `RoundedBox` dari drei, material flat dari CSS vars. **Nol download → budget tetap kecil.**
- [ ] `useGLTF.preload(...)` semua GLB saat boot.
- [ ] Hover: raycast + tooltip label objek (nama section muncul) + cursor pointer.
- **Accept:** 9–10 objek tampil rapi di meja; total payload GLB ≤ 4.5 MB (3 GLB × 1.5 MB); drop-in mulus.

### Fase 3 — Wiring Navigasi Objek → Section v3 (1–2 hari)

Pola growon: objek klik → panel via `history.pushState` (back/forward jalan). Untuk v3, bridge dari scene ke state `PinnedScrollContainer`:

- [ ] Buat **event bus** ringan (`src/lib/sceneEvents.ts` atau Zustand — cek: v3 belum punya store, cukup custom event + context).
- [ ] Objek diklik → `goToSection(idx)` yang sudah ada (v3 sudah punya `goToSection`, `setIsContactOpen`, `setSelectedProject`) + **dolly kamera ke objek** + panel fade-in.
- [ ] Peta objek → section: Monitor→2 (Selected Works), Laptop→1 (Experience), Notebook→3 (About), Cangkir→4/Contact modal.
- [ ] **Routing opsional (mirip growon):** `history.pushState` untuk `/work`, `/about`, `/contact` + popstate listener → langsung buka panel yang sesuai (deep-linkable).
- [ ] Panel tetap pakai komponen v3 yang ada (`ProjectsSection` dengan subpage 2/item, `ProjectDetailModal`, `ContactModal`).
- **Accept:** semua aksi growon (monitor/notebook/cangkir) membuka section yang benar; tombol back browser kembali ke scene.

### Fase 4 — Boot Screen & Fallback (1 hari)

- [ ] Boot overlay **"Setting the scene…"** + progress bar dari `THREE.LoadingManager` (progress nyata), min 500ms, timeout 12s.
- [ ] WebGL detect gagal → **fallback: video `/hero/hero.mp4` yang sudah ada** (bukan gambar — v3 sudah punya aset ini, tidak perlu `bg_home.webp` baru).
- [ ] `/invoice`, `/admin`, `/process` belum ada di v3 (belum relevan — skip; tapi simpan pola `ExperienceShellGate` untuk ekslusi konten non-marketing nanti).
- **Accept:** di throttling 4G boot tidak blank; WebGL disabled → video hero + scroll biasa tetap jalan.

### Fase 5 — Audio System (1–2 hari)

- [ ] `src/audio/audioManager.ts`: `AudioContext` sintesis (klik/boing) + decode & cache mp3 (whoosh, klik, coffee) + master gain + mute toggle (ikon di Navbar v3).
- [ ] **Unlock on first gesture** — pointerdown pertama resume context.
- [ ] Toggle musik (terminal objek): `AudioBufferSourceNode` loop + `AnalyserNode` → rotasi disc (jika ada) / equalizer visual di panel.
- **Accept:** semua interaksi bersuara halus; mute persisten; tidak ada suara sebelum gesture.

### Fase 6 — Visual Signature (1–2 hari)

- [ ] **Glitch/CRT layer** opsional: noise hash 24fps + scanline + vignette + RGB shift (shader kecil, additive) — hanya di scene (bukan full screen overlay di teks agar tetap terbaca).
- [ ] Kontras via palette v3 (amber `#fbbf24`/cobalt `#2F6FE0` on surface `#0e0d14`) — cocok dengan aesthetic growon.
- [ ] Petunjuk interaksi muncul setelah boot: "Move & interact".
- **Accept:** scene terasa "signature"; teks panel tetap 100% terbaca.

### Fase 7 — Performa & Aksesibilitas (1 hari)

- [ ] Audit: total JS 3D ≤ 600KB gzip (R3F+drei+three sudah ~500KB), dpr cap, lazy `SceneCanvas` via `dynamic ssr:false` (pola v3 sudah dipakai).
- [ ] `useMemo`/memo objek statis; cull manual (objects mati di luar frustum).
- [ ] A11y: semua section tetap bisa diakses keyboard (skip link / daftar section di kiri — `Navigation` v3 sudah ada), `aria-live` untuk panel aktif, tooltip bukan satu-satunya cara menemukan navigasi.
- [ ] Lighthouse target: LCP < 3.5s (throttled 4G), TBT < 300ms, aksesibilitas ≥ 95.
- **Accept:** skor tercapai; tidak ada regresi di halaman fallback.

---

## 3. Struktur File Baru (Proposal)

```
src/
├── audio/
│   └── audioManager.ts          # sintesis + sample cache + master gain
├── config/
│   └── sceneConfig.ts           # SCENE_OBJECTS array (gaya growon)
├── hooks/
│   ├── useCameraRig.ts          # parallax + dolly + Box3 framing
│   └── useObjectInteraction.ts  # raycast click/hover + event bus
├── lib/
│   └── sceneEvents.ts           # bridge scene ↔ PinnedScrollContainer
└── components/scene/
    ├── SceneCanvas.tsx          # Canvas + lights + ContactShadow
    ├── CameraRig.tsx
    ├── Desk.tsx / Monitor.tsx / Cup.tsx / ... (1 file per objek)
    ├── GlitchFX.tsx             # shader (opsional, Fase 6)
    ├── BootScreen.tsx           # LoadingManager progress
    └── SceneShellGate.tsx       # wrapper non-3D fallback (video hero)
```

**File yang TIDAK diubah:** `PinnedScrollContainer.tsx` (hanya di-bridge), `ProjectsSection`, `ProjectDetailModal`, `ContactModal`, `ExperienceSection`, `AboutSection`, `FooterSection`, `portfolioData.ts`, `globals.css`.

---

## 4. Aset: Prosedural vs GLB

| Aspek | Prosedural (R3F) | GLB (Blender + Draco) |
|---|---|---|
| Ukuran | 0 KB | ~1.5 MB/objek |
| Gaya | Konsisten, stylized | Realistis/low-poly penuh |
| Waktu | Menit | Jam (modeling) |
| Risiko | Terlihat "generik" jika jelek | Lisensi + konversi |

**Rekomendasi:** mulai 100% prosedural untuk bentuk simple (cup, lamp, pencil, keyboard, bug), GLB hanya untuk 3 objek hero (monitor, laptop, meja). Bisa upgrade bertahap.

---

## 5. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Payload 3D besar (±9 MB seperti growon) | Batasi GLB ≤ 3 objek, draco + webp, loading manager + min 500ms, fallback video |
| Scene membebani scroll performa | Scene hanya di hero; panel tetap DOM ringan; lazy load scene |
| Arah scroll v3 yang sekarang hilang | Scroll tetap ada di fallback; scene memakai gesture kamera sendiri |
| Routing pushState di file-system Next 16 | Pakai `window.history` + popstate (bukan route files) untuk panel — tidak konflik App Router |
| Aksesibilitas | Semua section tetap dicapai via Navigation kiri + keyboard; scene non-essential content |

---

## 6. Roadmap & Estimasi Total

| Fase | Estimasi | Deliverable |
|---|---|---|
| F0 Persiapan | 0.5 hari | Baseline + folder |
| F1 Fondasi scene | 1–2 hari | Canvas + rig + lights |
| F2 Objek & drop-in | 2–3 hari | Meja lengkap, ≤4.5MB |
| F3 Wiring navigasi | 1–2 hari | Objek → section v3 |
| F4 Boot + fallback | 1 hari | Loading + video fallback |
| F5 Audio | 1–2 hari | Sintesis + musik + mute |
| F6 Glitch signature | 1–2 hari | CRT layer |
| F7 Performa & a11y | 1 hari | Audit hijau |
| **Total** | **~9–14 hari** | |

**Urutan rekomendasi eksekusi:** F0 → F1 → F2 → F3 (MVP interaktif) → F4 (fallback aman) → F5 → F6 → F7. Setelah F3 situs sudah "mirip growon" secara fungsional — F4–F6 adalah polish.

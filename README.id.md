[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — router LLM dan penyedia model untuk VS Code

Pertahankan alur pemrograman Anda. Pilih model di baliknya.

Gunakan rute Swobu sebagai model bawaan VS Code, atau hubungkan Claude Code dan Codex tanpa mengganti antarmuka resminya. Konfigurasikan penyedia dan fallback sekali di Swobu; rute tetap sama saat model di baliknya berubah.

Instal ekstensi dari [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu), atau cari `swobu.swobu` di VS Code. Satu paket lintas platform mendukung host ekstensi lokal, WSL, Remote SSH, dan kontainer pengembangan.

## Model di VS Code

Buka **Manage Language Models**, pilih **Swobu**, lalu pilih rute. Swobu menangani pemilihan penyedia dan fallback. Pemanggilan alat aktif secara default untuk VS Code Agent.

## Tetap memakai Claude Code dan Codex

Jalankan **Swobu: Connect Claude Code** atau **Swobu: Connect Codex**, pilih ruang kerja, lalu lanjutkan di antarmuka resmi. Perintah koneksi Swobu yang ada menangani konfigurasi dan penggantian yang aman.

## Mengapa rute?

Pemilih penyedia mengubah model di editor. Rute memungkinkan penggantian kapasitas dan pengaturan fallback di balik pilihan model yang tetap. Pertahankan klien; serahkan keputusan penyedia kepada Swobu.

## Memulai

1. Buka **Swobu: Set Up** dan konfigurasikan akses model.
2. Buat rute untuk pekerjaan Anda.
3. Pilih rute di **Manage Language Models**, lalu minta Agent membaca sebuah file.
4. Buka **Swobu: Open** untuk memeriksa lalu lintas yang dirutekan.

## Pengaturan model

Pilih rute di **Swobu: Configure Model**. Gambar dan alat memiliki pilihan **Default**, **On**, **Off**. Batas konteks dan keluaran menyediakan preset atau bilangan bulat positif khusus. **Reset overrides** langsung mengembalikan default tanpa memulai ulang.

Default: alat aktif, gambar nonaktif, 32.768 token masukan dan 4.096 token keluaran. Ini adalah kemampuan yang Anda nyatakan kepada klien, bukan deteksi otomatis model. Aktifkan gambar hanya untuk rute dengan model yang mendukung gambar.

## Penyedia dan cara kerja

Konfigurasikan kapasitas di Swobu, termasuk OpenRouter, Ollama, Bedrock, Azure, dan endpoint kompatibel OpenAI. Kredensial tetap di Swobu. VS Code mengirim permintaan ke proses Swobu lokal yang menangani koneksi, percobaan ulang, fallback, dan penggunaan. Ekstensi menampilkan rute sebagai model dan mengalirkan jawaban kembali.

## Privasi dan keamanan

Permintaan, jawaban, dan konten alat melewati memori sementara. Ekstensi tidak menyimpan atau mencatat konten tersebut dan tidak memiliki pengirim telemetri terpisah. Pengaturan privasi Swobu sendiri berlaku pada prosesnya. Lihat [PRIVACY.md](PRIVACY.md) dan [SECURITY.md](SECURITY.md).

## Remote, WSL, dan container

Ekstensi berjalan di host ruang kerja. Endpoint loopback merujuk pada host tersebut: atur Swobu di sisi remote untuk ruang kerja remote. Kualifikasi paket dan pengujian instalasi diperlukan sebelum rilis.

## Bantuan

Gunakan **Swobu: Refresh Models** setelah mengubah rute. Jika Swobu tidak tersedia, periksa endpoint tingkat mesin. Baca keluaran koneksi sebelum mengizinkan penggantian konfigurasi.

[Laporkan masalah](https://github.com/swobuforge/swobu-vscode/issues) dengan versi VS Code, platform, dan pesan kesalahan, tanpa kredensial atau isi permintaan pribadi.

## Pengembangan dan lisensi

Node 22 dan VS Code 1.136 atau lebih baru: `npm ci`, `npm test`, `npm run build`, `npm run package`. Dengan instalasi Swobu biasa yang kompatibel, jalankan juga `npm run test:integration`; di Linux tanpa layar gunakan `xvfb-run -a`.

Ekstensi: [MIT](LICENSE). Swobu dipasang dan dilisensikan secara terpisah; VSIX tidak berisi berkas Swobu yang dapat dijalankan. Swobu tidak berafiliasi dengan Microsoft, Anthropic, atau OpenAI.

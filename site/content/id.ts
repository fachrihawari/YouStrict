import type { LandingContent } from './types';

const content = {
  lang: 'id',
  htmlLang: 'id',
  switchLabel: 'EN',
  switchName: 'English',
  skip: 'Lompat ke konten',

  meta: {
    title: 'YouStrict — YouTube untuk anak, tanpa algoritma',
    description:
      'Hanya video dari channel yang kamu setujui, selama waktu yang kamu tentukan. Tanpa pencarian, tanpa rekomendasi, tanpa autoplay tanpa ujung.',
    ogTitle: 'YouTube untuk anak, tanpa algoritma.',
    ogDescription: 'Channel pilihan orang tua, batas waktu, dan kunci PIN. Untuk Android TV, HP, dan tablet.',
  },

  nav: {
    label: 'Navigasi utama',
    features: 'Fitur',
    how: 'Cara kerja',
    catalog: 'Katalog',
    install: 'Pasang',
    faq: 'FAQ',
    source: 'GitHub',
    download: 'Unduh',
    menu: 'Buka menu',
    close: 'Tutup menu',
  },

  hero: {
    eyebrow: 'Android TV · HP · Tablet',
    titleHtml: 'YouTube untuk anak,<br><em>tanpa algoritma.</em>',
    lead: 'Hanya video dari channel yang kamu setujui, selama waktu yang kamu tentukan. Tanpa pencarian, tanpa rekomendasi, dan tanpa scroll yang tidak ada habisnya.',
    ctaPrimary: 'Unduh APK',
    ctaSecondary: 'Lihat sumbernya',
    note: 'Gratis · Tanpa akun · Data tersimpan di perangkat',
    stats: {
      channels: 'channel',
      videos: 'video',
      updated: 'diperbarui',
    },
    tv: {
      all: 'Semua',
      label: 'TV ruang keluarga',
      timerLabel: 'Sisa waktu',
      timer: '12:34',
      lockKicker: 'Sesi selesai',
      lockTitle: 'Waktu habis',
      lockBody: 'Masukkan PIN untuk melanjutkan.',
      pinLabel: 'PIN',
    },
  },

  compare: {
    eyebrow: 'Masalahnya',
    title: 'YouTube dirancang untuk membuat betah. YouStrict dirancang untuk berhenti.',
    lead: 'Bukan soal konten yang jahat. Soal mesin yang terus menawarkan video berikutnya.',
    badTitle: 'YouTube biasa',
    badItems: [
      'Satu video selesai, autoplay langsung jalan.',
      'Rekomendasi membawa anak ke video yang tidak kamu pilih.',
      'Pencarian bisa membuka apa saja.',
      'Tidak ada batas waktu, kecuali kamu yang menghentikan.',
    ],
    goodTitle: 'Dengan YouStrict',
    goodItems: [
      'Hanya channel yang sudah kamu setujui.',
      'Tidak ada pencarian, rekomendasi, atau tautan keluar.',
      'Timer berjalan, dengan peringatan 5 dan 1 menit.',
      'Waktu habis, layar terkunci dengan PIN.',
    ],
    footnote: 'Sesi berakhir. Anak tahu apa yang diharapkan, dan kamu tidak perlu berdebat.',
  },

  features: {
    eyebrow: 'Fitur',
    title: 'Kontrol penuh, tanpa ribet.',
    lead: 'Semua pengaturan ada di area orang tua yang dilindungi PIN.',
    items: [
      {
        icon: 'shield',
        title: 'Kamu yang memilih',
        body: 'Hanya channel yang kamu setujui yang muncul. Channel baru otomatis nonaktif sampai kamu nyalakan.',
      },
      {
        icon: 'search-off',
        title: 'Tanpa pencarian',
        body: 'Tidak ada kolom pencarian, rekomendasi, atau tautan keluar ke YouTube.',
      },
      {
        icon: 'clock',
        title: 'Batas waktu 5–180 menit',
        body: 'Pilih durasi, lihat jam berapa sesi berakhir, lalu biarkan timer yang bekerja.',
      },
      {
        icon: 'lock',
        title: 'Kunci PIN',
        body: 'Saat waktu habis, app terkunci. Keluar dari sesi juga membutuhkan PIN.',
      },
      {
        icon: 'filter',
        title: 'Filter video',
        body: 'Sembunyikan video dengan kata terlarang, atau yang durasinya terlalu panjang.',
      },
      {
        icon: 'history',
        title: 'Riwayat 30 hari',
        body: 'Lihat apa yang ditonton, lalu sembunyikan video atau matikan channel langsung dari riwayat.',
      },
      {
        icon: 'refresh',
        title: 'Sinkron tiap hari',
        body: 'Katalog diperbarui otomatis. Daftar video tersimpan di perangkat, jadi tetap ada saat offline.',
      },
      {
        icon: 'remote',
        title: 'Ramah remote',
        body: 'Semua tombol bisa diakses dengan D-pad. Tanpa mouse, tanpa sentuhan.',
      },
    ],
  },

  parents: {
    eyebrow: 'Area orang tua',
    title: 'Satu tempat untuk semua pengaturan.',
    lead: 'Dilindungi PIN. Anak tidak akan sampai ke sini.',
    bullets: [
      {
        title: 'Atur durasi',
        body: 'Lima sampai 180 menit, plus opsi menyelesaikan video terakhir (maksimal 10 menit tambahan).',
      },
      {
        title: 'Pilih channel',
        body: 'Nyalakan atau matikan channel. Lihat jumlah video dan sembunyikan yang tidak cocok.',
      },
      {
        title: 'Periksa riwayat',
        body: 'Ringkasan tontonan 30 hari terakhir, dikelompokkan per hari.',
      },
    ],
    screens: {
      timer: 'Layar pengaturan waktu di area orang tua',
      channels: 'Daftar channel dengan tombol nyala dan mati',
      history: 'Riwayat tontonan 30 hari terakhir',
    },
    mock: {
      watchTitle: 'Watch time',
      watchSubtitle: 'How long can your child watch?',
      watchEnds: 'Ends at 19:30',
      watchFinish: 'Let the last video finish',
      watchStart: 'Start watching',
      channelsTitle: 'Channels',
      channelsSubtitle: '{on} of {total} turned on',
      on: 'On',
      off: 'Off',
      historyTitle: 'History',
      historyDay: 'Today',
      historyYesterday: 'Yesterday',
      historyTotal: '42 min watched',
    },
  },

  steps: {
    eyebrow: 'Cara kerja',
    title: 'Sekali atur, lalu tinggal menonton.',
    lead: 'Tidak ada langganan, tidak ada akun, tidak ada server milik kami.',
    items: [
      { title: 'Pasang', body: 'Unduh APK dan pasang di Android TV, HP, atau tablet.' },
      { title: 'Pilih channel', body: 'Buka area orang tua dengan PIN, lalu nyalakan channel yang boleh ditonton.' },
      { title: 'Atur waktu', body: 'Pilih durasi sesi dan mulai. Timer langsung berjalan.' },
      { title: 'Selesai', body: 'Waktu habis, layar terkunci. Masukkan PIN untuk sesi berikutnya.' },
    ],
  },

  catalog: {
    eyebrow: 'Katalog',
    title: 'Isinya channel pilihan, bukan seluruh YouTube.',
    lead: 'Katalog dibangun ulang setiap hari dari daftar channel yang dikurasi. Angka di bawah diambil saat halaman ini diterbitkan.',
    channelLabel: 'channel',
    videoLabel: 'video',
    updatedLabel: 'Diperbarui',
    autoNote: 'Otomatis setiap hari pukul 03.00 WIB.',
    jsonLink: 'Lihat data mentah (JSON)',
    versionLabel: 'Versi katalog',
    indexTitle: 'Katalog YouStrict',
    indexLead: 'Daftar channel dan video yang dipakai app. Halaman ini untuk keperluan teknis.',
    indexBack: 'Kembali ke beranda',
  },

  install: {
    eyebrow: 'Pasang',
    title: 'Siap untuk TV di ruang keluarga.',
    lead: 'Build APK tersedia di GitHub Releases. Pasang di Android TV, HP, atau tablet.',
    cta: 'Unduh APK terbaru',
    ctaNote: 'Selalu build terbaru dari halaman Releases.',
    steps: [
      { title: 'Unduh APK', body: 'Buka halaman Releases dan unduh file .apk terbaru.' },
      { title: 'Izinkan instalasi', body: 'Di TV, aktifkan “Install unknown apps” untuk file manager atau browser yang kamu pakai.' },
      { title: 'Pasang & buka', body: 'Buka YouStrict, buat PIN, lalu pilih channel pertama.' },
    ],
    buildTitle: 'Mau bangun sendiri?',
    buildBody: 'Repo menyertakan konfigurasi EAS. Butuh Bun, Expo, dan Android SDK; seluruh langkahnya ada di README.',
    buildLink: 'Panduan build',
    androidNote: 'Untuk Android TV dan HP atau tablet Android.',
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Yang sering ditanyakan.',
    items: [
      {
        q: 'Apakah YouStrict gratis?',
        a: 'Ya. Tidak ada langganan, akun, atau iklan dari YouStrict.',
      },
      {
        q: 'Apakah butuh internet?',
        a: 'Ya untuk memutar video. Daftar channel dan judul video disimpan di perangkat, jadi app tetap terbuka saat offline.',
      },
      {
        q: 'Apakah ini resmi dari YouTube?',
        a: 'Bukan. YouStrict tidak berafiliasi dengan YouTube atau Google. Video diputar melalui pemutar YouTube, jadi penonton tetap terhubung ke YouTube saat menonton.',
      },
      {
        q: 'Bisakah anak keluar sendiri?',
        a: 'Tidak. Keluar dari sesi dan membuka area orang tua membutuhkan PIN.',
      },
      {
        q: 'Di perangkat apa bisa dipakai?',
        a: 'Android TV, dan juga HP atau tablet Android. Grid video menyesuaikan ukuran layar.',
      },
      {
        q: 'Bagaimana menambah channel?',
        a: 'Di area orang tua, buka Request a channel lalu pindai QR untuk mengirim permintaan. Pada repo ini, permintaan diproses oleh pemilik.',
      },
      {
        q: 'Bisa saya pakai untuk keluarga saya?',
        a: 'Bisa. Repo bersifat publik dan bisa di-fork; kamu perlu mengelola daftar channel dan halaman katalog sendiri.',
      },
      {
        q: 'Kenapa tidak ada pencarian?',
        a: 'Pencarian mengembalikan kontrol ke algoritma. YouStrict sengaja hanya menampilkan apa yang sudah kamu pilih.',
      },
    ],
  },

  footer: {
    tagline: 'YouTube untuk anak, tanpa algoritma.',
    productTitle: 'Produk',
    sourceTitle: 'Sumber',
    catalogTitle: 'Katalog',
    links: {
      features: 'Fitur',
      how: 'Cara kerja',
      install: 'Pasang',
      github: 'Kode di GitHub',
      releases: 'Rilis APK',
      readme: 'Panduan build',
      catalogIndex: 'Data katalog',
      catalogStatus: 'Status katalog',
    },
    disclaimer:
      'YouStrict adalah proyek pribadi. Tidak berafiliasi dengan YouTube atau Google. Video diputar melalui pemutar YouTube.',
    madeWith: 'Dibuat dengan Expo untuk Android TV.',
    langTitle: 'Bahasa',
  },

  notFound: {
    title: 'Halaman tidak ditemukan',
    body: 'Tautannya mungkin sudah berubah, atau halaman ini belum pernah ada.',
    back: 'Kembali ke beranda',
  },
} satisfies LandingContent;

export default content;

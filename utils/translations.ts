

export type Language = 'en' | 'id';

export const translations = {
  en: {
    nav: { features: "FEATURES", blog: "BLOG", launch: "LAUNCH APP", home: "HOME" },
    hero: {
      title_start: "Plan trips",
      title_end: "Like A God.",
      subtitle: "Stop using spreadsheets. Vagabond uses Gemini AI to build hyper-personalized, brutalist travel itineraries in seconds.",
      cta_start: "Start Building",
      cta_demo: "View Demo",
    },
    marquee: "Ship Your Trip",
    features: {
      title: "Why Vagabond?",
      card1_title: "AI-Powered Speed",
      card1_desc: "We generate detailed hour-by-hour plans based on your vibe, budget, and weird specific interests.",
      card2_title: "Global Radar",
      card2_items: ["190+ Countries", "Local Gems", "Tourist Traps Filter", "Smart Forecast"],
      card3_title: "Vibe Match",
      card3_desc: "We curate Spotify playlists and local slang to match your trip's energy.",
      card4_title: "Instant Export",
      card4_btn: "Download PDF"
    },
    cta: {
      title: "Don't be a tourist.\nBe a traveler.",
      btn: "Start Planning Now"
    },
    generator: {
      header_title: "Itinerary Builder",
      header_sub: "AI Travel Architect",
      config_title: "Trip Config",
      config_sub: "Configure your adventure",
      label_origin: "Starting Point",
      label_where: "Where to?",
      label_days: "Days",
      label_budget: "Budget",
      label_vibe: "Vibe",
      label_travelers: "Travelers",
      label_transport: "Transport",
      label_style: "Travel Style",
      btn_generate: "Generate Plan",
      btn_generating: "Generating...",
      btn_surprise: "Surprise Me",
      btn_suggest: "AI Suggest",
      btn_suggesting: "Thinking...",
      placeholder_origin: "Jakarta, Singapore, NYC...",
      placeholder_dest: "Tokyo, Paris, Bali...",
      budget_options: {
        Budget: "Low",
        Moderate: "Mid",
        Luxury: "High"
      },
      transport_options: {
        public: "Public Transport",
        rental: "Rental Car",
        taxi: "Taxi / Rideshare",
        private: "Private Driver",
        personal: "Private Vehicle"
      },
      style_options: {
        relaxed: "Relaxed",
        fast: "Fast-Paced",
        adventure: "Adventurous",
        culture: "Cultural",
        romantic: "Romantic",
        family: "Family Friendly"
      },
      interests: ['Food', 'History', 'Nature', 'Nightlife', 'Art', 'Shopping'],
      empty_state_title: "Ready to take off?",
      empty_state_desc: "Enter your destination details above to generate a custom, AI-curated travel itinerary instantly.",
      loading_text: "Crafting your journey...",
      result_save: "Save",
      result_share: "Share",
      result_export: "Export PDF",
      day_label: "DAY",
      days_unit: "Days",
      saved_alert: "Saved!",
      copied_alert: "Link copied!",
      section_essentials: "Essentials",
      label_est_cost: "Est. Cost (excl. flights)",
      label_packing: "Packing List",
      label_phrases: "Local Lingo",
      label_playlist: "Playlist Vibe",
      label_weather: "Weather Forecast",
      label_advisories: "Travel Advisories",
      tab_itinerary: "Itinerary",
      tab_essentials: "Essentials",
      tab_config: "Edit Trip",
      packing_edit: "Edit List",
      packing_done: "Done",
      packing_add_placeholder: "Add item...",
      budget_breakdown: {
        title: "Cost Breakdown",
        view_details: "View Details",
        per_person: "Cost Per Person",
        notes: "AI Estimation Notes",
        accommodation: "Accommodation",
        food: "Food & Dining",
        activities: "Activities",
        transport: "Local Transport",
        flights: "Flights / Fuel (Est.)",
        total: "Total Est."
      },
      feedback: {
        question: "Was this itinerary helpful?",
        yes: "Yes, helpful!",
        no: "Not really",
        improve_label: "What was missing?",
        submit: "Send Feedback",
        success_positive: "Awesome! Happy travels! 🚀",
        success_negative: "Thanks for the feedback. 🙏"
      }
    },
    credits: {
      balance: "Credits",
      buy: "Top Up",
      cost_per_trip: "Cost: 5 Credits",
      insufficient: "Not enough credits!",
      insufficient_desc: "You need more credits to generate this itinerary.",
      modal_title: "Refill Your Tank",
      modal_sub: "Choose a credit pack to continue your journey.",
      pack_1: "Day Tripper",
      pack_2: "Globetrotter",
      pack_3: "Vagabond King",
      login_req: "Please login to use credits."
    },
    auth: {
      login: "Login",
      logout: "Logout",
      welcome: "Welcome back,",
      modal_title: "Identitas Diri",
      btn_login: "Enter Vagabond"
    },
    profile: {
      tab_overview: "Overview",
      tab_history: "My Trips",
      saved_trips: "Saved Itineraries",
      no_trips: "No saved trips yet.",
      total_days: "Days on Road"
    },
    footer: {
      desc: "Built with React, Tailwind, and heavy caffeine.",
      product: "Product",
      legal: "Legal",
      links: {
        features: "Features",
        api: "API",
        privacy: "Privacy",
        terms: "Terms"
      }
    }
  },
  id: {
    nav: { features: "FITUR", blog: "BLOG", launch: "BUKA APLIKASI", home: "BERANDA" },
    hero: {
      title_start: "Rencanakan",
      title_end: "Seperti Dewa.",
      subtitle: "Lupakan spreadsheet. Vagabond menggunakan Gemini AI untuk membuat rencana perjalanan brutalist yang sangat personal dalam hitungan detik.",
      cta_start: "Mulai Buat",
      cta_demo: "Lihat Demo",
    },
    marquee: "Jelajahi Dunia",
    features: {
      title: "Kenapa Vagabond?",
      card1_title: "Kecepatan AI",
      card1_desc: "Kami membuat rencana detail jam-demi-jam berdasarkan suasana hati, anggaran, dan minat unik Anda.",
      card2_title: "Radar Global",
      card2_items: ["190+ Negara", "Permata Lokal", "Anti Jebakan Turis", "Prakiraan Cerdas"],
      card3_title: "Vibe Match",
      card3_desc: "Kami kurasi playlist Spotify dan bahasa gaul lokal agar sesuai dengan mood perjalananmu.",
      card4_title: "Ekspor Kilat",
      card4_btn: "Unduh PDF"
    },
    cta: {
      title: "Jangan jadi turis.\nJadilah penjelajah.",
      btn: "Mulai Rencanakan"
    },
    generator: {
      header_title: "Pembuat Rencana",
      header_sub: "Arsitek Perjalanan AI",
      config_title: "Konfigurasi Trip",
      config_sub: "Atur petualanganmu",
      label_origin: "Titik Berangkat",
      label_where: "Mau ke mana?",
      label_days: "Hari",
      label_budget: "Anggaran",
      label_vibe: "Suasana",
      label_travelers: "Jumlah Orang",
      label_transport: "Kendaraan",
      label_style: "Gaya Travel",
      btn_generate: "Buat Rencana",
      btn_generating: "Memproses...",
      btn_surprise: "Acak Tujuan",
      btn_suggest: "Saran AI",
      btn_suggesting: "Mikir...",
      placeholder_origin: "Jakarta, Surabaya, Bandung...",
      placeholder_dest: "Tokyo, Paris, Bali...",
      budget_options: {
        Budget: "Hemat",
        Moderate: "Sedang",
        Luxury: "Mewah"
      },
      transport_options: {
        public: "Transport Umum",
        rental: "Sewa Mobil/Motor",
        taxi: "Taksi Online",
        private: "Supir Pribadi",
        personal: "Kendaraan Pribadi"
      },
      style_options: {
        relaxed: "Santai",
        fast: "Cepat / Padat",
        adventure: "Petualang",
        culture: "Budaya Lokal",
        romantic: "Romantis",
        family: "Ramah Keluarga"
      },
      interests: ['Kuliner', 'Sejarah', 'Alam', 'Hiburan Malam', 'Seni', 'Belanja'],
      empty_state_title: "Siap berangkat?",
      empty_state_desc: "Masukkan detail tujuan di atas untuk membuat itinerary perjalanan kustom kurasi AI secara instan.",
      loading_text: "Meracik perjalananmu...",
      result_save: "Simpan",
      result_share: "Bagikan",
      result_export: "Ekspor PDF",
      day_label: "HARI",
      days_unit: "Hari",
      saved_alert: "Disimpan!",
      copied_alert: "Tautan disalin!",
      section_essentials: "Penting",
      label_est_cost: "Est. Biaya (excl. tiket)",
      label_packing: "Barang Bawaan",
      label_phrases: "Bahasa Lokal",
      label_playlist: "Vibe Musik",
      label_weather: "Prakiraan Cuaca",
      label_advisories: "Peringatan Perjalanan",
      tab_itinerary: "Rencana",
      tab_essentials: "Info Penting",
      tab_config: "Ubah Trip",
      packing_edit: "Ubah List",
      packing_done: "Selesai",
      packing_add_placeholder: "Tambah barang...",
      budget_breakdown: {
        title: "Rincian Biaya",
        view_details: "Lihat Rincian",
        per_person: "Biaya Per Orang",
        notes: "Catatan Estimasi AI",
        accommodation: "Akomodasi",
        food: "Makan & Minum",
        activities: "Aktivitas",
        transport: "Transport Lokal",
        flights: "Penerbangan / BBM (Est.)",
        total: "Total Est."
      },
      feedback: {
        question: "Apakah rencana ini membantu?",
        yes: "Ya, membantu!",
        no: "Kurang pas",
        improve_label: "Apa yang kurang?",
        submit: "Kirim Masukan",
        success_positive: "Mantap! Selamat berlibur! 🚀",
        success_negative: "Terima kasih atas masukannya. 🙏"
      }
    },
    credits: {
      balance: "Token",
      buy: "Isi Ulang",
      cost_per_trip: "Biaya: 5 Token",
      insufficient: "Token tidak cukup!",
      insufficient_desc: "Anda perlu lebih banyak token untuk membuat rencana ini.",
      modal_title: "Isi Bahan Bakar",
      modal_sub: "Pilih paket token untuk melanjutkan perjalanan.",
      pack_1: "Day Tripper",
      pack_2: "Globetrotter",
      pack_3: "Vagabond King",
      login_req: "Silakan login untuk menggunakan token."
    },
    auth: {
      login: "Masuk",
      logout: "Keluar",
      welcome: "Halo,",
      modal_title: "Identitas Diri",
      btn_login: "Masuk Vagabond"
    },
    profile: {
      tab_overview: "Ringkasan",
      tab_history: "Perjalananku",
      saved_trips: "Itinerary Tersimpan",
      no_trips: "Belum ada trip tersimpan.",
      total_days: "Total Hari Jalan"
    },
    footer: {
      desc: "Dibuat dengan React, Tailwind, dan kafein dosis tinggi.",
      product: "Produk",
      legal: "Legal",
      links: {
        features: "Fitur",
        api: "API",
        privacy: "Privasi",
        terms: "Syarat"
      }
    }
  }
};

// Okutan Akademi Hızlı Okuma Kursu - Test Verileri

export const initialLeads = [
  {
    id: "lead-1",
    name: "Aysel Yılmaz",
    phone: "0532 111 2233",
    date: "2026-06-25",
    status: "new", // 'new' | 'contacted' | 'waiting' | 'lost' | 'confirmed'
    source: "Instagram",
    notes: "Hızlı okuma kursu fiyatları hakkında bilgi almak istiyor. Oğlu 6. sınıfta.",
    updatedDate: "2026-06-25"
  },
  {
    id: "lead-2",
    name: "Murat Şahin",
    phone: "0544 333 4455",
    date: "2026-06-22",
    status: "contacted",
    source: "Referans",
    notes: "Arama yapıldı. Cumartesi günü merkezimize yüz yüze görüşmeye gelecek.",
    updatedDate: "2026-06-23"
  },
  {
    id: "lead-3",
    name: "Zeynep Kaya",
    phone: "0505 555 6677",
    date: "2026-06-18",
    status: "waiting",
    source: "Google Arama",
    notes: "Deneme dersine katıldı, çok beğendi. Eşiyle görüşüp kesin karar vereceklerini iletti.",
    updatedDate: "2026-06-20"
  },
  {
    id: "lead-4",
    name: "Ahmet Demir",
    phone: "0555 777 8899",
    date: "2026-06-15",
    status: "lost",
    source: "Facebook Reklam",
    notes: "Fiyat yüksek geldi. Başka bir dönemde tekrar değerlendireceğini söyledi.",
    updatedDate: "2026-06-16"
  },
  {
    id: "lead-5",
    name: "Emine Çelik",
    phone: "0533 999 0011",
    date: "2026-06-10",
    status: "confirmed",
    source: "Instagram",
    notes: "Kayıt yapıldı. Taksitli ödeme planı oluşturuldu.",
    updatedDate: "2026-06-12"
  }
];

export const initialStudents = [
  {
    id: "student-1",
    name: "Emine Çelik",
    phone: "0533 999 0011",
    studentName: "Mert Çelik",
    studentAgeGrade: "8. Sınıf (LGS Hazırlık)",
    registrationDate: "2026-06-12",
    totalPrice: 12000,
    discount: 1000,
    paidAmount: 4000,
    paymentStatus: "partial", // 'unpaid' | 'partial' | 'paid'
    teacherId: "teacher-firat",
    teacherName: "Fırat Hoca",
    lessons: [
      { day: "Cumartesi", time: "10:30 - 12:00" },
      { day: "Pazar", time: "10:30 - 12:00" }
    ],
    notes: [
      {
        id: "n-1",
        date: "2026-06-12",
        author: "Asistan",
        content: "Kayıt evrakları teslim alındı. Hafta sonu grubuna yazıldı."
      },
      {
        id: "n-2",
        date: "2026-06-19",
        author: "Öğretmen",
        content: "İlk derse katıldı. Okuma hızı dakikada 120 kelime, anlama oranı %50. Odaklanma problemi var."
      },
      {
        id: "n-3",
        date: "2026-06-26",
        author: "Öğretmen",
        content: "2. Hafta ölçümü: Hız 180 kelimeye yükseldi. Anlama oranı %60. Blok egzersizlerine devam ediyor."
      }
    ],
    payments: [
      {
        id: "p-1",
        date: "2026-06-12",
        amount: 2000,
        type: "Nakit",
        description: "Peşinat"
      },
      {
        id: "p-2",
        date: "2026-06-20",
        amount: 2000,
        type: "Kredi Kartı",
        description: "1. Taksit"
      }
    ]
  },
  {
    id: "student-2",
    name: "Hasan Polat",
    phone: "0536 222 3344",
    studentName: "Buse Polat",
    studentAgeGrade: "11. Sınıf (YKS Hazırlık)",
    registrationDate: "2026-06-05",
    totalPrice: 15000,
    discount: 1500,
    paidAmount: 13500,
    paymentStatus: "paid",
    teacherId: "teacher-zehra",
    teacherName: "Zehra Hoca",
    lessons: [
      { day: "Cumartesi", time: "13:30 - 15:00" },
      { day: "Cumartesi", time: "15:00 - 16:30" }
    ],
    notes: [
      {
        id: "n-4",
        date: "2026-06-05",
        author: "Yönetici",
        content: "Tüm ücret peşin ödendiği için ekstra indirim uygulandı."
      },
      {
        id: "n-5",
        date: "2026-06-12",
        author: "Öğretmen",
        content: "Göz kası egzersizlerini çok iyi uyguluyor. Başlangıç hızı 150 kelimeydi, 240 kelimeye çıktı."
      }
    ],
    payments: [
      {
        id: "p-3",
        date: "2026-06-05",
        amount: 13500,
        type: "EFT/Havale",
        description: "Tek çekim tam ödeme"
      }
    ]
  },
  {
    id: "student-3",
    name: "Fatma Aslan",
    phone: "0542 444 5566",
    studentName: "Kerem Aslan",
    studentAgeGrade: "5. Sınıf",
    registrationDate: "2026-06-15",
    totalPrice: 10000,
    discount: 0,
    paidAmount: 0,
    paymentStatus: "unpaid",
    teacherId: "teacher-firat",
    teacherName: "Fırat Hoca",
    lessons: [
      { day: "Pazartesi", time: "16:30 - 18:00" },
      { day: "Çarşamba", time: "16:30 - 18:00" }
    ],
    notes: [
      {
        id: "n-6",
        date: "2026-06-15",
        author: "Asistan",
        content: "Kayıt kesinleşti. İlk ödeme Temmuz başında yapılacak."
      }
    ],
    payments: []
  }
];

export const systemRoles = {
  YONETICI: "Yönetici",
  ASISTAN: "Asistan",
  OGRETMEN: "Öğretmen"
};

export const initialUsers = [
  { id: "u-1", name: "Hakan Okutan", username: "admin", password: "123", role: "Yönetici" },
  { id: "u-2", name: "Selin Demir", username: "asistan", password: "123", role: "Asistan" },
  { id: "u-3", name: "Ahmet Yılmaz", username: "ogretmen", password: "123", role: "Öğretmen" },
  { id: "u-4", name: "Fırat Hoca", username: "firat", password: "123", role: "Öğretmen" },
  { id: "u-5", name: "Zehra Hoca", username: "zehra", password: "123", role: "Öğretmen" }
];

export const initialTeachers = [
  { id: "teacher-firat", name: "Fırat Hoca", role: "Öğretmen" },
  { id: "teacher-zehra", name: "Zehra Hoca", role: "Öğretmen" }
];

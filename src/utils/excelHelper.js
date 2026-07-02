// Okutan Akademi - Excel (XLS) Dışa Aktarma Yardımcısı

export const exportStudentsToExcel = (students) => {
  if (!students || students.length === 0) {
    alert("Dışa aktarılacak öğrenci kaydı bulunamadı.");
    return;
  }

  // Genel Toplamları Hesapla
  const totalOriginal = students.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalDiscount = students.reduce((sum, s) => sum + (s.discount || 0), 0);
  const totalNet = students.reduce((sum, s) => sum + ((s.totalPrice || 0) - (s.discount || 0)), 0);
  const totalPaid = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalRemaining = totalNet - totalPaid;

  // Öğrenci Satırlarını HTML Olarak Oluştur
  const rowsHtml = students.map(student => {
    const finalPrice = (student.totalPrice || 0) - (student.discount || 0);
    const remaining = finalPrice - (student.paidAmount || 0);

    let paymentStatusText = "Ödenmedi";
    let paymentStatusBg = "#ffeaea";
    let paymentStatusColor = "#ff7675";

    if (student.paymentStatus === "paid") {
      paymentStatusText = "Tamamı Ödendi";
      paymentStatusBg = "#e6f7f4";
      paymentStatusColor = "#00b894";
    } else if (student.paymentStatus === "partial") {
      paymentStatusText = "Kısmi Ödendi";
      paymentStatusBg = "#fef9e7";
      paymentStatusColor = "#e67e22";
    }

    const teacherName = student.teacherName || "—";
    const lessonsText = student.lessons && student.lessons.length > 0
      ? student.lessons.map(l => `${l.day} (${l.time})`).join(", ")
      : "—";

    return `
      <tr>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif;">${student.name || ""}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; mso-number-format:'\\@';">${student.phone || ""}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; font-weight: bold;">${student.studentName || ""}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center;">${student.studentAgeGrade || ""}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center;">${student.registrationDate || ""}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; font-weight: bold; color: #6c5ce7;">${teacherName}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt;">${lessonsText}</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; mso-number-format:'#\\,##0\\ \\₺';">${student.totalPrice || 0} ₺</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; mso-number-format:'#\\,##0\\ \\₺';">${student.discount || 0} ₺</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; font-weight: bold; mso-number-format:'#\\,##0\\ \\₺';">${finalPrice} ₺</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; font-weight: bold; color: #00b894; mso-number-format:'#\\,##0\\ \\₺';">${student.paidAmount || 0} ₺</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; font-weight: bold; color: #ff7675; mso-number-format:'#\\,##0\\ \\₺';">${remaining} ₺</td>
        <td style="border: 1px solid #d2d2d2; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center; font-weight: bold; background-color: ${paymentStatusBg}; color: ${paymentStatusColor};">${paymentStatusText}</td>
      </tr>
    `;
  }).join("");

  // Excel HTML Şablonu
  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Kesin Kayıtlar</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; }
        th { background-color: #6c5ce7; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; border: 1px solid #c2c9d6; padding: 10px; }
      </style>
    </head>
    <body>
      <table>
        <!-- Üst Başlık Bloğu -->
        <tr>
          <td colspan="13" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 18pt; font-weight: bold; color: #6c5ce7; padding: 5px 0;">OKUTAN AKADEMİ</td>
        </tr>
        <tr>
          <td colspan="13" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #2d3436;">HIZLI OKUMA KURSU KESİN KAYIT LİSTESİ VE DERS PROGRAMLARI</td>
        </tr>
        <tr>
          <td colspan="13" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt; color: #7f8c8d; padding-bottom: 15px;">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</td>
        </tr>
        <tr><td colspan="13" style="height: 10px;"></td></tr>
        
        <!-- Tablo Başlıkları -->
        <thead>
          <tr>
            <th style="background-color: #6c5ce7; color: #ffffff;">Veli Adı Soyadı</th>
            <th style="background-color: #6c5ce7; color: #ffffff;">Telefon</th>
            <th style="background-color: #6c5ce7; color: #ffffff;">Öğrenci Adı</th>
            <th style="background-color: #6c5ce7; color: #ffffff;">Sınıf / Yaş</th>
            <th style="background-color: #6c5ce7; color: #ffffff;">Kayıt Tarihi</th>
            <th style="background-color: #6c5ce7; color: #ffffff;">Ders Öğretmeni</th>
            <th style="background-color: #6c5ce7; color: #ffffff;">Haftalık Ders Programı</th>
            <th style="background-color: #6c5ce7; color: #ffffff; text-align: right;">Kurs Ücreti</th>
            <th style="background-color: #6c5ce7; color: #ffffff; text-align: right;">İndirim</th>
            <th style="background-color: #6c5ce7; color: #ffffff; text-align: right;">Net Ücret</th>
            <th style="background-color: #6c5ce7; color: #ffffff; text-align: right;">Ödenen Tutar</th>
            <th style="background-color: #6c5ce7; color: #ffffff; text-align: right;">Kalan Alacak</th>
            <th style="background-color: #6c5ce7; color: #ffffff; text-align: center;">Ödeme Durumu</th>
          </tr>
        </thead>
        
        <!-- Veriler -->
        <tbody>
          ${rowsHtml}
          
          <!-- Genel Toplam Satırı -->
          <tr style="font-weight: bold; background-color: #f0edff;">
            <td colspan="7" style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; color: #6c5ce7;">GENEL TOPLAM:</td>
            <td style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; color: #2d3436; mso-number-format:'#\\,##0\\ \\₺';">${totalOriginal} ₺</td>
            <td style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; color: #2d3436; mso-number-format:'#\\,##0\\ \\₺';">${totalDiscount} ₺</td>
            <td style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; color: #6c5ce7; mso-number-format:'#\\,##0\\ \\₺';">${totalNet} ₺</td>
            <td style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; color: #00b894; mso-number-format:'#\\,##0\\ \\₺';">${totalPaid} ₺</td>
            <td style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; text-align: right; color: #ff7675; mso-number-format:'#\\,##0\\ \\₺';">${totalRemaining} ₺</td>
            <td style="border: 1px solid #d2d2d2; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif;"></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  // UTF-8 BOM ekleyerek indirmeyi başlat
  const bom = "\uFEFF";
  const blob = new Blob([bom + excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().split("T")[0];

  link.setAttribute("href", url);
  link.setAttribute("download", `okutan_kesin_kayitlar_${today}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


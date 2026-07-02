import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  FileSpreadsheet,
  BookOpen,
  Trash2,
  Edit3,
  Download,
  Upload,
  FileText,
  Clock,
  Send,
  AlertTriangle,
  Shield,
  Info,
  LogOut,
  Sun,
  Moon,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { exportStudentsToExcel } from "./utils/excelHelper";

// ─── Sabitler ───────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const LESSON_HOURS = [
  "09:00 - 10:30",
  "10:30 - 12:00",
  "12:00 - 13:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
  "18:00 - 19:30"
];

// ─── Sabitler ───────────────────────────────────────────────────────────────
const ADMIN_REGISTER_PASSWORD = "Okutan.2026"; // Yeni kullanıcı açmak için yönetici şifresi

// ─── Uygulama ────────────────────────────────────────────────────────────────
function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // "login" | "register"
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "", username: "", password: "", role: "Asistan", adminCode: ""
  });

  // CORE DATA
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // API LOADING
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  const apiFetch = async (path, options = {}) => {
    const token = localStorage.getItem("okutan_token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem("okutan_token");
        setCurrentUser(null);
        setAuthView("login");
        throw new Error("Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu.");
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  // UI STATE
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("okutan_theme") || "light");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // MODALS
  const [modal, setModal] = useState(null); // null | "addLead" | "editLead" | "confirmReg" | "studentDetail" | "addPayment"
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // FORMS
  const emptyLeadForm = { name: "", phone: "", source: "Instagram", notes: "", status: "new" };
  const emptyConfirmForm = { studentName: "", studentAgeGrade: "", totalPrice: "", discount: "0", firstPayment: "0", firstPaymentType: "Nakit" };
  const emptyPaymentForm = { studentId: "", amount: "", type: "Nakit", description: "Taksit Ödemesi", date: new Date().toISOString().split("T")[0] };

  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [confirmForm, setConfirmForm] = useState(emptyConfirmForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [newNoteText, setNewNoteText] = useState("");

  // SCHEDULING STATES
  const [confirmLessons, setConfirmLessons] = useState([]);
  const [confirmTeacherId, setConfirmTeacherId] = useState("");
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editLessons, setEditLessons] = useState([]);
  const [editTeacherId, setEditTeacherId] = useState("");
  const [activeTeacherScheduleId, setActiveTeacherScheduleId] = useState("teacher-firat");

  // TOAST
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" }); // type: info | success | error

  // ── Auth & Data Loading ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("okutan_token");
    if (token) {
      setLoading(true);
      apiFetch("/auth/me")
        .then(({ user }) => {
          setCurrentUser(user);
          return Promise.all([
            apiFetch("/leads"),
            apiFetch("/students"),
            apiFetch("/teachers")
          ]);
        })
        .then(([leadsData, studentsData, teachersData]) => {
          setLeads(leadsData);
          setStudents(studentsData);
          setTeachers(teachersData);
        })
        .catch(err => {
          showToast(err.message, "error");
          localStorage.removeItem("okutan_token");
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // ── Theme ────────────────────────────────────────────────────────────────
  // Apply theme on mount and on change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("okutan_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "info" }), 3500);
  };

  // ── Auth Handlers ────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      showToast("Kullanıcı adı ve şifre zorunludur.", "error"); return;
    }
    setLoading(true);
    try {
      const { token, user } = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password.trim(),
        }),
      });
      localStorage.setItem("okutan_token", token);
      setCurrentUser(user);
      setLoginForm({ username: "", password: "" });
      setActiveTab("dashboard");
      showToast(`Hoş geldiniz, ${user.name}!`, "success");

      // Verileri çek
      const [leadsData, studentsData, teachersData] = await Promise.all([
        apiFetch("/leads"),
        apiFetch("/students"),
        apiFetch("/teachers")
      ]);
      setLeads(leadsData);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, username, password, role, adminCode } = registerForm;

    if (!name.trim() || !username.trim() || !password.trim()) {
      showToast("Tüm alanları doldurunuz.", "error"); return;
    }
    setLoading(true);
    try {
      const { token, user } = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password: password.trim(),
          role,
          adminCode
        }),
      });
      localStorage.setItem("okutan_token", token);
      setCurrentUser(user);
      setRegisterForm({ name: "", username: "", password: "", role: "Asistan", adminCode: "" });
      setActiveTab("dashboard");
      showToast(`Hesap oluşturuldu! Hoş geldiniz, ${user.name}.`, "success");

      // Verileri çek
      const [leadsData, studentsData, teachersData] = await Promise.all([
        apiFetch("/leads"),
        apiFetch("/students"),
        apiFetch("/teachers")
      ]);
      setLeads(leadsData);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("okutan_token");
    setCurrentUser(null);
    setAuthView("login");
    setLeads([]);
    setStudents([]);
    setTeachers([]);
    showToast("Güvenli çıkış yapıldı.");
  };

  // ── Lead Handlers ────────────────────────────────────────────────────────
  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      showToast("İsim ve telefon zorunludur.", "error"); return;
    }
    setLoading(true);
    try {
      const newLead = await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          name: leadForm.name.trim(),
          phone: leadForm.phone.trim(),
          status: leadForm.status,
          source: leadForm.source,
          notes: leadForm.notes
        }),
      });
      setLeads(prev => [newLead, ...prev]);
      setLeadForm(emptyLeadForm);
      setModal(null);
      showToast("Potansiyel müşteri kaydedildi.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedLead = await apiFetch(`/leads/${selectedLead.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: selectedLead.name,
          phone: selectedLead.phone,
          status: selectedLead.status,
          source: selectedLead.source,
          notes: selectedLead.notes
        }),
      });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
      setModal(null);
      showToast("Görüşme bilgileri güncellendi.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (currentUser?.role === "Öğretmen") {
      showToast("Yetkiniz yok: Sadece Yönetici ve Asistanlar silebilir.", "error"); return;
    }
    if (!window.confirm("Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    try {
      await apiFetch(`/leads/${id}`, {
        method: "DELETE"
      });
      setLeads(prev => prev.filter(l => l.id !== id));
      showToast("Kayıt silindi.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Scheduling Helpers ───────────────────────────────────────────────────
  const checkTeacherConflictForSlots = (teacherId, selectedSlots, excludeStudentId = null) => {
    const conflicts = [];
    for (const slot of selectedSlots) {
      const conflictingStudent = students.find(s => 
        s.teacherId === teacherId && 
        s.id !== excludeStudentId &&
        s.lessons && 
        s.lessons.some(l => l.day === slot.day && l.time === slot.time)
      );
      if (conflictingStudent) {
        conflicts.push({
          day: slot.day,
          time: slot.time,
          studentName: conflictingStudent.studentName
        });
      }
    }
    return conflicts;
  };

  useEffect(() => {
    if (confirmLessons.length === 0) return;
    const firatConflicts = checkTeacherConflictForSlots("teacher-firat", confirmLessons);
    const zehraConflicts = checkTeacherConflictForSlots("teacher-zehra", confirmLessons);
    
    if (firatConflicts.length === 0 && zehraConflicts.length > 0) {
      setConfirmTeacherId("teacher-firat");
    } else if (zehraConflicts.length === 0 && firatConflicts.length > 0) {
      setConfirmTeacherId("teacher-zehra");
    } else if (!confirmTeacherId) {
      setConfirmTeacherId("teacher-firat");
    }
  }, [confirmLessons]);

  // ── Confirm Registration ─────────────────────────────────────────────────
  const openConfirmReg = (lead) => {
    setSelectedLead(lead);
    setConfirmForm({ studentName: lead.name, studentAgeGrade: "8. Sınıf", totalPrice: "12000", discount: "0", firstPayment: "2000", firstPaymentType: "Nakit" });
    setConfirmLessons([]);
    setConfirmTeacherId("");
    setModal("confirmReg");
  };

  const handleConfirmRegistration = async (e) => {
    e.preventDefault();
    if (!confirmForm.studentName.trim() || !confirmForm.totalPrice) {
      showToast("Öğrenci adı ve ücret zorunludur.", "error"); return;
    }
    setLoading(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === confirmTeacherId) || teachers[0];
      const newStudent = await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({
          leadId: selectedLead.id,
          name: selectedLead.name,
          phone: selectedLead.phone,
          studentName: confirmForm.studentName.trim(),
          studentAgeGrade: confirmForm.studentAgeGrade,
          totalPrice: confirmForm.totalPrice,
          discount: confirmForm.discount,
          firstPayment: confirmForm.firstPayment,
          firstPaymentType: confirmForm.firstPaymentType,
          teacherId: confirmTeacherId || selectedTeacher.id,
          lessons: confirmLessons
        })
      });

      setStudents(prev => [newStudent, ...prev]);
      setLeads(prev => prev.map(l =>
        l.id === selectedLead.id
          ? { ...l, status: "confirmed", updatedDate: new Date().toISOString().split("T")[0] }
          : l
      ));
      setModal(null);
      setConfirmForm(emptyConfirmForm);
      setConfirmLessons([]);
      setConfirmTeacherId("");
      showToast("Kayıt kesinleştirildi! Öğrenci listesine eklendi.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Note Handlers ────────────────────────────────────────────────────────
  const handleAddNote = async (studentId) => {
    if (!newNoteText.trim()) { showToast("Not boş olamaz.", "error"); return; }
    setLoading(true);
    try {
      const newNote = await apiFetch(`/students/${studentId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content: newNoteText.trim() })
      });
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, notes: [newNote, ...s.notes] } : s
      ));
      setSelectedStudent(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
      setNewNoteText("");
      showToast("Not eklendi.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (studentId, noteId) => {
    if (currentUser?.role === "Öğretmen") {
      showToast("Öğretmenler not silemez.", "error"); return;
    }
    if (!window.confirm("Bu notu silmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    try {
      await apiFetch(`/students/${studentId}/notes/${noteId}`, {
        method: "DELETE"
      });
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, notes: s.notes.filter(n => n.id !== noteId) } : s
      ));
      setSelectedStudent(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== noteId) }));
      showToast("Not silindi.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Payment Handlers ─────────────────────────────────────────────────────
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount) {
      showToast("Öğrenci ve tutar zorunludur.", "error"); return;
    }
    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) { showToast("Geçerli bir tutar giriniz.", "error"); return; }
    setLoading(true);
    try {
      const updatedStudent = await apiFetch(`/students/${paymentForm.studentId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: paymentForm.amount,
          date: paymentForm.date,
          type: paymentForm.type,
          description: paymentForm.description
        })
      });

      setStudents(prev => prev.map(s => s.id === paymentForm.studentId ? updatedStudent : s));
      if (selectedStudent?.id === paymentForm.studentId) {
        setSelectedStudent(updatedStudent);
      }
      setModal(null);
      setPaymentForm(emptyPaymentForm);
      showToast("Ödeme kaydedildi, kasa güncellendi.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (currentUser?.role === "Öğretmen") {
      showToast("Yetkiniz yok: Sadece Yönetici ve Asistanlar silebilir.", "error"); return;
    }
    if (!window.confirm("Bu öğrenci kaydını silmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    try {
      await apiFetch(`/students/${id}`, {
        method: "DELETE"
      });
      setStudents(prev => prev.filter(s => s.id !== id));
      showToast("Öğrenci kaydı silindi.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Backup ───────────────────────────────────────────────────────────────
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ leads, students, users, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `okutan_akademi_yedek_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Yedek indirildi.", "success");
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.leads && parsed.students) {
          setLeads(parsed.leads);
          setStudents(parsed.students);
          if (parsed.users) setUsers(parsed.users);
          showToast("Yedek başarıyla yüklendi!", "success");
        } else {
          showToast("Geçersiz yedek dosyası!", "error");
        }
      } catch { showToast("Dosya okunamadı.", "error"); }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = ""; // allow re-upload same file
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalLeadsCount = leads.length;
  const activeLeadsCount = leads.filter(l => l.status !== "confirmed" && l.status !== "lost").length;
  const lostCount = leads.filter(l => l.status === "lost").length;
  const confirmedCount = students.length;
  const conversionRate = totalLeadsCount > 0
    ? Math.round((leads.filter(l => l.status === "confirmed").length / totalLeadsCount) * 100)
    : 0;
  const totalExpected = students.reduce((s, st) => s + (st.totalPrice - st.discount), 0);
  const totalCollected = students.reduce((s, st) => s + st.paidAmount, 0);
  const totalOutstanding = totalExpected - totalCollected;

  // ── Filters ──────────────────────────────────────────────────────────────
  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    const matchQ = l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.notes || "").toLowerCase().includes(q);
    const matchS = statusFilter === "all" || l.status === statusFilter;
    return matchQ && matchS;
  });

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.studentName.toLowerCase().includes(q) || s.phone.includes(q) || s.studentAgeGrade.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || s.paymentStatus === statusFilter;
    return matchQ && matchS;
  });

  // ── Helper: navigate tab ─────────────────────────────────────────────────
  const goTo = (tab) => { setActiveTab(tab); setSearchQuery(""); setStatusFilter("all"); };

  // ── Toast Icon helper ────────────────────────────────────────────────────
  const toastIcon = toast.type === "success" ? <CheckCircle size={16} />
    : toast.type === "error" ? <XCircle size={16} />
    : <Info size={16} />;

  const toastStyle = {
    success: { background: "var(--success)", color: "#fff" },
    error:   { background: "var(--accent)", color: "#fff" },
    info:    { background: "var(--text-main)", color: "var(--bg-card)" }
  }[toast.type];

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH SCREENS
  // ─────────────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="auth-container">
        {toast.visible && (
          <div className="toast-msg" style={toastStyle}>{toastIcon} {toast.message}</div>
        )}

        {authView === "login" ? (
          <div className="auth-card">
            <div className="auth-header">
              <img src="/logo.png" className="auth-logo-img" alt="Okutan Akademi Logo" />
              <h2>Sisteme Giriş</h2>
              <p>Okutan Akademi takip sistemine hoş geldiniz.</p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Kullanıcı Adı</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kullanıcı adınız"
                  value={loginForm.username}
                  onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="form-group">
                <label>Şifre</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Şifreniz"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                Giriş Yap
              </button>
            </form>

            <p className="auth-switch-text">
              Yeni hesap mı açmak istiyorsunuz?
              <span onClick={() => { setAuthView("register"); setRegisterForm({ name: "", username: "", password: "", role: "Asistan", adminCode: "" }); }}>
                Hesap Oluştur
              </span>
            </p>
          </div>

        ) : (
          <div className="auth-card">
            <div className="auth-header">
              <img src="/logo.png" className="auth-logo-img" alt="Okutan Akademi Logo" />
              <h2>Yeni Kullanıcı Ekle</h2>
              <p>Yeni hesap açmak için yönetici şifresi gereklidir.</p>
            </div>

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Örn: Hakan Okutan"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Kullanıcı Adı</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Giriş için kullanılacak"
                    value={registerForm.username}
                    onChange={e => setRegisterForm(f => ({ ...f, username: e.target.value }))}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Hesap şifresi"
                    value={registerForm.password}
                    onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  className="form-control"
                  value={registerForm.role}
                  onChange={e => setRegisterForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="Yönetici">Yönetici</option>
                  <option value="Asistan">Asistan</option>
                  <option value="Öğretmen">Öğretmen</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ color: "var(--accent)" }}>🔐 Yönetici Onay Şifresi</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Yöneticiden alınan şifreyi girin"
                  value={registerForm.adminCode}
                  onChange={e => setRegisterForm(f => ({ ...f, adminCode: e.target.value }))}
                  autoComplete="off"
                  required
                />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                Hesap Oluştur
              </button>
            </form>

            <p className="auth-switch-text">
              Zaten hesabınız var mı?
              <span onClick={() => setAuthView("login")}>Giriş Yapın</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────────────────────────────────────
  const role = currentUser.role;

  return (
    <div className="app-container">
      <style>{`
        @keyframes loading-bar-anim {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%)",
          backgroundSize: "200% 100%",
          animation: "loading-bar-anim 1.5s infinite linear",
          zIndex: 9999,
        }} />
      )}
      {/* Toast */}
      {toast.visible && (
        <div className="toast-msg" style={toastStyle}>{toastIcon} {toast.message}</div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo-container">
            <img src="/logo.png" className="sidebar-logo-img" alt="Okutan Akademi" />
          </div>

          <ul className="menu-list">
            <li className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => goTo("dashboard")}>
              <TrendingUp className="menu-icon" /> Dashboard
            </li>
            {role !== "Öğretmen" && (
              <li className={`menu-item ${activeTab === "leads" ? "active" : ""}`} onClick={() => goTo("leads")}>
                <Users className="menu-icon" /> Görüşülen Müşteriler
              </li>
            )}
            <li className={`menu-item ${activeTab === "students" ? "active" : ""}`} onClick={() => goTo("students")}>
              <UserCheck className="menu-icon" /> Kesin Kayıtlar
            </li>
            <li className={`menu-item ${activeTab === "teacher_schedules" ? "active" : ""}`} onClick={() => goTo("teacher_schedules")}>
              <Calendar className="menu-icon" /> Öğretmen Programları
            </li>
            {role !== "Öğretmen" && (
              <li className={`menu-item ${activeTab === "payments" ? "active" : ""}`} onClick={() => goTo("payments")}>
                <DollarSign className="menu-icon" /> Ödeme Takip
              </li>
            )}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="user-profile-section">
          <span className={`role-badge-pill ${role === "Yönetici" ? "admin" : role === "Asistan" ? "assistant" : "teacher"}`}>
            {role}
          </span>
          <div className="user-info-card" style={{ marginBottom: "10px" }}>
            <div className="avatar">{currentUser.name.charAt(0)}</div>
            <div className="user-details">
              <h4>{currentUser.name}</h4>
              <p>@{currentUser.username}</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogout}>
            <LogOut size={14} /> Oturumu Kapat
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="main-content">

        {/* Header */}
        <header className="top-header">
          <div className="header-title-section">
            <h1>Okutan Akademi Hızlı Okuma</h1>
            <p>Kayıt, Ödeme ve Öğrenci Takip Sistemi</p>
          </div>
          <div className="header-actions">
            {role !== "Öğretmen" && (
              <div className="header-stat-pill">Kasa: <span>{totalCollected.toLocaleString("tr-TR")} ₺</span></div>
            )}
            <div className="header-stat-pill">Öğrenci: <span>{confirmedCount}</span></div>

            {/* Dark Mode Toggle */}
            <button className="theme-switch-btn" onClick={toggleTheme} title={theme === "light" ? "Karanlık Mod" : "Aydınlık Mod"}>
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Quick Logout */}
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={13} /> {currentUser.name.split(" ")[0]}
            </button>
          </div>
        </header>

        {/* ══ DASHBOARD ══════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-grid">
              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Toplam Görüşülen</span>
                  <span className="metric-value">{totalLeadsCount}</span>
                  <span className="metric-subtext positive">{activeLeadsCount} aktif takip</span>
                </div>
                <div className="metric-icon-wrapper"><Users size={24} /></div>
              </div>

              <div className="metric-card">
                <div className="metric-info">
                  <span className="metric-label">Kesin Kayıtlı Öğrenci</span>
                  <span className="metric-value">{confirmedCount}</span>
                  <span className="metric-subtext positive">%{conversionRate} Dönüşüm</span>
                </div>
                <div className="metric-icon-wrapper"><UserCheck size={24} /></div>
              </div>

              {role !== "Öğretmen" ? (
                <>
                  <div className="metric-card accent">
                    <div className="metric-info">
                      <span className="metric-label">Toplam Tahsilat</span>
                      <span className="metric-value" style={{ fontSize: "1.6rem" }}>{totalCollected.toLocaleString("tr-TR")} ₺</span>
                      <span className="metric-subtext positive" style={{ color: "var(--primary)" }}>Toplam sözleşme: {totalExpected.toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <div className="metric-icon-wrapper"><DollarSign size={24} /></div>
                  </div>
                  <div className="metric-card accent">
                    <div className="metric-info">
                      <span className="metric-label">Kalan Toplam Alacak</span>
                      <span className="metric-value" style={{ fontSize: "1.6rem" }}>{totalOutstanding.toLocaleString("tr-TR")} ₺</span>
                      <span className="metric-subtext negative">Bekleyen taksitler</span>
                    </div>
                    <div className="metric-icon-wrapper"><Clock size={24} /></div>
                  </div>
                </>
              ) : (
                <div className="metric-card">
                  <div className="metric-info">
                    <span className="metric-label">Akademik Takip</span>
                    <span className="metric-value" style={{ fontSize: "1.4rem" }}>Sınıf Notları</span>
                    <span className="metric-subtext positive">Gelişim raporları</span>
                  </div>
                  <div className="metric-icon-wrapper"><BookOpen size={24} /></div>
                </div>
              )}
            </div>

            {/* Dashboard Detail Panels */}
            <div className="dashboard-details-grid">
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title"><BookOpen size={20} color="var(--primary)" /> Hızlı İşlemler</h3>
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
                  Görüşülen velileri kaydedin, tek tıkla kesin kayda çevirin, taksit/ödeme planları oluşturun ve
                  öğrencilerin gelişim süreçlerini not olarak takip edin.
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {role !== "Öğretmen" && (
                    <button className="btn btn-primary" onClick={() => { setLeadForm(emptyLeadForm); setModal("addLead"); }}>
                      <Plus size={15} /> Müşteri Ekle
                    </button>
                  )}
                  {role !== "Öğretmen" && (
                    <button className="btn btn-secondary" onClick={() => { setPaymentForm(emptyPaymentForm); goTo("payments"); setModal("addPayment"); }}>
                      <DollarSign size={15} /> Ödeme Al
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={() => goTo("students")}>
                    <UserCheck size={15} /> Öğrenci Notları
                  </button>
                  {role !== "Öğretmen" && (
                    <>
                      <button className="btn btn-secondary" onClick={exportBackup}>
                        <Download size={15} /> Yedekle
                      </button>
                      <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                        <Upload size={15} /> Yedek Yükle
                        <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title"><TrendingUp size={20} color="var(--accent)" /> Kayıt Dönüşümü</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="conversion-progress">
                    <div className="conversion-progress-header">
                      <span>Dönüşüm Oranı</span><span>%{conversionRate}</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill" style={{ width: `${conversionRate}%` }} />
                    </div>
                  </div>
                  {[
                    ["Toplam Görüşülen", totalLeadsCount],
                    ["Kayıt Olan (Öğrenci)", confirmedCount],
                    ["Olumsuz (Kayıt Olmayan)", lostCount]
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <span>{label}</span><strong style={{ color: "var(--text-main)" }}>{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ LEADS ══════════════════════════════════════════════════════════ */}
        {activeTab === "leads" && role !== "Öğretmen" && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title"><Users size={22} color="var(--primary)" /> Görüşülen Müşteri Kayıt Sistemi</h3>
              <button className="btn btn-primary" onClick={() => { setLeadForm(emptyLeadForm); setModal("addLead"); }}>
                <Plus size={16} /> Yeni Görüşme Ekle
              </button>
            </div>

            <div className="toolbar">
              <div className="search-filter-group">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input type="text" className="search-input" placeholder="Ad, telefon veya not ara…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Tüm Durumlar</option>
                  <option value="new">Yeni Başvuru</option>
                  <option value="contacted">Görüşüldü</option>
                  <option value="waiting">Karar Bekliyor</option>
                  <option value="lost">Olumsuz</option>
                  <option value="confirmed">Kayıt Yapıldı</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              {filteredLeads.length === 0 ? (
                <div className="empty-state"><Users className="empty-state-icon" /><p>Kayıt bulunamadı.</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Veli Ad Soyad</th><th>Telefon</th><th>Tarih</th><th>Kanal</th><th>Durum</th><th>Not</th>
                      <th style={{ textAlign: "right" }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        <td><strong>{lead.name}</strong></td>
                        <td>{lead.phone}</td>
                        <td>{lead.date}</td>
                        <td>{lead.source}</td>
                        <td>
                          <span className={`badge badge-${lead.status === "new" ? "new" : lead.status === "contacted" ? "contacted" : lead.status === "waiting" ? "waiting" : lead.status === "lost" ? "lost" : "confirmed"}`}>
                            {lead.status === "new" && "Yeni Başvuru"}
                            {lead.status === "contacted" && "Görüşüldü"}
                            {lead.status === "waiting" && "Karar Bekliyor"}
                            {lead.status === "lost" && "Olumsuz"}
                            {lead.status === "confirmed" && "Kayıt Yapıldı"}
                          </span>
                        </td>
                        <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.notes}>{lead.notes || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            {lead.status !== "confirmed" && (
                              <button className="btn btn-primary" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => openConfirmReg(lead)}>
                                Kesin Kayıt
                              </button>
                            )}
                            <button className="btn-icon-only" title="Düzenle" onClick={() => { setSelectedLead({ ...lead }); setModal("editLead"); }}>
                              <Edit3 size={15} />
                            </button>
                            {role !== "Öğretmen" && (
                              <button className="btn-icon-only delete-btn" title="Sil" onClick={() => handleDeleteLead(lead.id)}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ STUDENTS ═══════════════════════════════════════════════════════ */}
        {activeTab === "students" && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title"><UserCheck size={22} color="var(--primary)" /> Kesinleşen Kayıtlar</h3>
              <button className="btn btn-secondary" onClick={() => exportStudentsToExcel(students)}>
                <FileSpreadsheet size={16} color="var(--success)" /> Excel Listesi
              </button>
            </div>

            <div className="toolbar">
              <div className="search-filter-group">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input type="text" className="search-input" placeholder="Öğrenci, veli, telefon veya sınıf ara…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                {role !== "Öğretmen" && (
                  <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">Tüm Ödemeler</option>
                    <option value="paid">Tamamlandı</option>
                    <option value="partial">Kısmi Ödeme</option>
                    <option value="unpaid">Ödenmedi</option>
                  </select>
                )}
              </div>
            </div>

            <div className="table-container">
              {filteredStudents.length === 0 ? (
                <div className="empty-state"><UserCheck className="empty-state-icon" /><p>Kayıtlı öğrenci bulunamadı.</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Veli Ad Soyad</th><th>Telefon</th><th>Öğrenci</th><th>Sınıf/Yaş</th><th>Öğretmen</th><th>Ders Programı</th><th>Kayıt Tarihi</th>
                      {role !== "Öğretmen" && <><th>Ücret</th><th>Ödenen / Kalan</th><th>Durum</th></>}
                      <th>Notlar</th><th style={{ textAlign: "right" }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const due = student.totalPrice - student.discount;
                      const rem = due - student.paidAmount;
                      return (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.phone}</td>
                          <td><strong>{student.studentName}</strong></td>
                          <td>{student.studentAgeGrade}</td>
                          <td>
                            {student.teacherName ? (
                              <span className={`student-teacher-pill ${student.teacherId === "teacher-zehra" ? "zehra" : "firat"}`}>
                                {student.teacherId === "teacher-zehra" ? "👩‍🏫" : "👨‍🏫"} {student.teacherName}
                              </span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>—</span>
                            )}
                          </td>
                          <td>
                            {student.lessons && student.lessons.length > 0 ? (
                              <div className="lessons-badge-list">
                                {student.lessons.map((l, idx) => (
                                  <span key={idx} className="lesson-badge-item">
                                    {l.day.substring(0, 3)} ({l.time.split(" ")[0]})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>—</span>
                            )}
                          </td>
                          <td>{student.registrationDate}</td>
                          {role !== "Öğretmen" && (
                            <>
                              <td><strong>{due.toLocaleString("tr-TR")} ₺</strong></td>
                              <td>
                                <span style={{ color: "var(--success)" }}>{student.paidAmount.toLocaleString("tr-TR")} ₺</span>
                                {" / "}
                                <span style={{ color: "var(--accent)" }}>{rem.toLocaleString("tr-TR")} ₺</span>
                              </td>
                              <td>
                                <span className={`badge badge-${student.paymentStatus}`}>
                                  {student.paymentStatus === "paid" ? "Ödendi" : student.paymentStatus === "partial" ? "Kısmi" : "Ödenmedi"}
                                </span>
                              </td>
                            </>
                          )}
                          <td>
                            <span style={{ fontSize: "0.8rem", background: "var(--bg-app)", padding: "3px 8px", borderRadius: 10 }}>
                              {student.notes.length} not
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                                onClick={() => { setSelectedStudent(student); setNewNoteText(""); setModal("studentDetail"); }}
                              >
                                Detay / Notlar
                              </button>
                              {role !== "Öğretmen" && (
                                <button className="btn-icon-only delete-btn" title="Sil" onClick={() => handleDeleteStudent(student.id)}>
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ PAYMENTS ═══════════════════════════════════════════════════════ */}
        {activeTab === "payments" && role !== "Öğretmen" && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title"><DollarSign size={22} color="var(--primary)" /> Kasa ve Ödeme Takibi</h3>
              <button className="btn btn-accent" onClick={() => { setPaymentForm(emptyPaymentForm); setModal("addPayment"); }}>
                <Plus size={16} /> Ödeme / Taksit Al
              </button>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: "1rem" }}>
              {[
                ["Kasaya Giren", `${totalCollected.toLocaleString("tr-TR")} ₺`, "var(--success)"],
                ["Bekleyen Alacak", `${totalOutstanding.toLocaleString("tr-TR")} ₺`, "var(--accent)"],
                ["Toplam Sözleşme", `${totalExpected.toLocaleString("tr-TR")} ₺`, "var(--primary)"]
              ].map(([label, val, color]) => (
                <div key={label} className="metric-card" style={{ padding: "1.25rem" }}>
                  <div className="metric-info">
                    <span className="metric-label">{label}</span>
                    <span className="metric-value" style={{ color }}>{val}</span>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Ödeme İşlem Geçmişi</h4>
            <div className="table-container">
              {students.flatMap(s => s.payments.map(p => ({ ...p, studentName: s.studentName, parentName: s.name }))).length === 0 ? (
                <div className="empty-state"><DollarSign className="empty-state-icon" /><p>Ödeme kaydı bulunamadı.</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Öğrenci</th><th>Veli</th><th>Tarih</th><th>Tutar</th><th>Tür</th><th>Açıklama</th></tr>
                  </thead>
                  <tbody>
                    {students
                      .flatMap(s => s.payments.map(p => ({ ...p, studentName: s.studentName, parentName: s.name })))
                      .sort((a, b) => b.id.localeCompare(a.id))
                      .map(pay => (
                        <tr key={pay.id}>
                          <td><strong>{pay.studentName}</strong></td>
                          <td>{pay.parentName}</td>
                          <td>{pay.date}</td>
                          <td><strong style={{ color: "var(--success)" }}>{pay.amount.toLocaleString("tr-TR")} ₺</strong></td>
                          <td><span className="badge badge-paid" style={{ padding: "3px 8px" }}>{pay.type}</span></td>
                          <td>{pay.description}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ TEACHER SCHEDULES ════════════════════════════════════════════ */}
        {activeTab === "teacher_schedules" && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title"><Calendar size={22} color="var(--primary)" /> Öğretmen Haftalık Ders Programları</h3>
              <div className="schedule-tabs">
                {teachers.map(t => (
                  <button
                    key={t.id}
                    className={`schedule-tab-btn ${activeTeacherScheduleId === t.id ? `active ${t.id === "teacher-zehra" ? "zehra" : ""}` : ""}`}
                    onClick={() => setActiveTeacherScheduleId(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="calendar-view-card">
              <table className="calendar-table">
                <thead>
                  <tr>
                    <th className="time-header">Saat / Gün</th>
                    {DAYS_OF_WEEK.map(day => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LESSON_HOURS.map(hour => (
                    <tr key={hour}>
                      <td className="time-header">{hour}</td>
                      {DAYS_OF_WEEK.map(day => {
                        // Bu öğretmen ve bu saat dilimindeki öğrenciyi bul
                        const studentInSlot = students.find(s => 
                          s.teacherId === activeTeacherScheduleId &&
                          s.lessons &&
                          s.lessons.some(l => l.day === day && l.time === hour)
                        );
                        return (
                          <td key={day}>
                            {studentInSlot ? (
                              <div
                                className={`calendar-block ${studentInSlot.teacherId === "teacher-zehra" ? "zehra" : ""}`}
                                onClick={() => {
                                  setSelectedStudent(studentInSlot);
                                  setNewNoteText("");
                                  setIsEditingSchedule(false);
                                  setModal("studentDetail");
                                }}
                                title={`${studentInSlot.studentName} (${studentInSlot.studentAgeGrade})\nVeli: ${studentInSlot.name} - ${studentInSlot.phone}`}
                              >
                                <span className="calendar-block-student">{studentInSlot.studentName}</span>
                                <span className="calendar-block-grade">{studentInSlot.studentAgeGrade}</span>
                                <span className="calendar-block-parent">Veli: {studentInSlot.name}</span>
                              </div>
                            ) : (
                              <div className="calendar-block-empty">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Add Lead */}
      {modal === "addLead" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Potansiyel Müşteri Ekle</h3>
              <button className="btn-icon-only" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleAddLead}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Müşteri (Veli) Adı Soyadı *</label>
                  <input type="text" className="form-control" placeholder="Örn: Mehmet Aksoy" value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Telefon Numarası *</label>
                    <input type="tel" className="form-control" placeholder="0555 123 4567" value={leadForm.phone} onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Başvuru Kanalı</label>
                    <select className="form-control" value={leadForm.source} onChange={e => setLeadForm(f => ({ ...f, source: e.target.value }))}>
                      {["Instagram","Referans","Google Arama","Facebook Reklam","Broşür/Afiş","Diğer"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Görüşme Durumu</label>
                  <select className="form-control" value={leadForm.status} onChange={e => setLeadForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="new">Yeni Başvuru</option>
                    <option value="contacted">Görüşüldü/Arandı</option>
                    <option value="waiting">Karar Bekliyor</option>
                    <option value="lost">Olumsuz/Kayıtsız</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Görüşme Notu</label>
                  <textarea className="form-control" rows={3} placeholder="Talep, öğrenci sınıfı, arama detayları…" value={leadForm.notes} onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead */}
      {modal === "editLead" && selectedLead && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Görüşme Bilgilerini Güncelle</h3>
              <button className="btn-icon-only" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleEditLead}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Veli Adı Soyadı</label>
                  <input type="text" className="form-control" value={selectedLead.name} onChange={e => setSelectedLead(l => ({ ...l, name: e.target.value }))} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Telefon</label>
                    <input type="tel" className="form-control" value={selectedLead.phone} onChange={e => setSelectedLead(l => ({ ...l, phone: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Kanal</label>
                    <select className="form-control" value={selectedLead.source} onChange={e => setSelectedLead(l => ({ ...l, source: e.target.value }))}>
                      {["Instagram","Referans","Google Arama","Facebook Reklam","Broşür/Afiş","Diğer"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Durum</label>
                  <select className="form-control" value={selectedLead.status} onChange={e => setSelectedLead(l => ({ ...l, status: e.target.value }))}>
                    <option value="new">Yeni Başvuru</option>
                    <option value="contacted">Görüşüldü</option>
                    <option value="waiting">Karar Bekliyor</option>
                    <option value="lost">Olumsuz</option>
                    <option value="confirmed">Kayıt Yapıldı</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Görüşme Notu</label>
                  <textarea className="form-control" rows={3} value={selectedLead.notes} onChange={e => setSelectedLead(l => ({ ...l, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Güncelle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Registration */}
      {modal === "confirmReg" && selectedLead && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Kayıt Kesinleştirme Formu</h3>
              <button className="btn-icon-only" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleConfirmRegistration}>
              <div className="modal-body">
                <div style={{ background: "var(--primary-light)", padding: "12px", borderRadius: "var(--radius-md)", color: "var(--primary)", fontSize: "0.85rem" }}>
                  <strong>Veli:</strong> {selectedLead.name} — {selectedLead.phone}
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Öğrenci Adı Soyadı *</label>
                    <input type="text" className="form-control" placeholder="Öğrencinin adı" value={confirmForm.studentName} onChange={e => setConfirmForm(f => ({ ...f, studentName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Sınıf / Yaş *</label>
                    <input type="text" className="form-control" placeholder="8. Sınıf / 14 Yaş" value={confirmForm.studentAgeGrade} onChange={e => setConfirmForm(f => ({ ...f, studentAgeGrade: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Kurs Ücreti (₺) *</label>
                    <input type="number" min="0" className="form-control" placeholder="12000" value={confirmForm.totalPrice} onChange={e => setConfirmForm(f => ({ ...f, totalPrice: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>İndirim (₺)</label>
                    <input type="number" min="0" className="form-control" placeholder="0" value={confirmForm.discount} onChange={e => setConfirmForm(f => ({ ...f, discount: e.target.value }))} />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>İlk Ödeme / Peşinat (₺)</label>
                    <input type="number" min="0" className="form-control" placeholder="0 bırakın" value={confirmForm.firstPayment} onChange={e => setConfirmForm(f => ({ ...f, firstPayment: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Ödeme Yöntemi</label>
                    <select className="form-control" value={confirmForm.firstPaymentType} onChange={e => setConfirmForm(f => ({ ...f, firstPaymentType: e.target.value }))}>
                      <option>Nakit</option><option>Kredi Kartı</option><option>EFT/Havale</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                  <h4 style={{ fontSize: "0.95rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={16} color="var(--primary)" /> Haftalık Ders Programı ve Öğretmen Seçimi
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    Öğrencinin katılacağı ders saatlerini aşağıdaki tablodan seçiniz. Seçilen saatlere göre öğretmenlerin doluluk durumları otomatik hesaplanır.
                  </p>

                  {/* 7x7 Ders Programı Grid */}
                  <div className="schedule-grid-wrapper">
                    <table className="schedule-grid-table">
                      <thead>
                        <tr>
                          <th className="schedule-time-col">Saat / Gün</th>
                          {DAYS_OF_WEEK.map(d => (
                            <th key={d}>{d.substring(0, 3)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {LESSON_HOURS.map(hour => (
                          <tr key={hour}>
                            <td className="schedule-time-col">{hour.split(" ")[0]}</td>
                            {DAYS_OF_WEEK.map(day => {
                              const isSelected = confirmLessons.some(l => l.day === day && l.time === hour);
                              
                              // Hücredeki doluluk durumları (Kimlerin çakışması var?)
                              const conflictingFirat = checkTeacherConflictForSlots("teacher-firat", [{ day, time: hour }]);
                              const conflictingZehra = checkTeacherConflictForSlots("teacher-zehra", [{ day, time: hour }]);
                              
                              let titleText = `${day} ${hour}`;
                              if (conflictingFirat.length > 0) titleText += `\nFırat Hoca Dolu (${conflictingFirat[0].studentName})`;
                              if (conflictingZehra.length > 0) titleText += `\nZehra Hoca Dolu (${conflictingZehra[0].studentName})`;

                              return (
                                <td key={day} title={titleText}>
                                  <button
                                    type="button"
                                    className={`schedule-slot-btn ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                      if (isSelected) {
                                        setConfirmLessons(prev => prev.filter(l => !(l.day === day && l.time === hour)));
                                      } else {
                                        setConfirmLessons(prev => [...prev, { day, time: hour }]);
                                      }
                                    }}
                                  >
                                    ✓
                                  </button>
                                  {/* Küçük doluluk göstergesi */}
                                  {(conflictingFirat.length > 0 || conflictingZehra.length > 0) && !isSelected && (
                                    <div style={{
                                      position: "absolute",
                                      bottom: 2,
                                      right: 2,
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: conflictingFirat.length > 0 && conflictingZehra.length > 0 ? "var(--accent)" : "var(--warning)"
                                    }} />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Öğretmen Seçim Kartları */}
                  <div className="teacher-cards-grid">
                    {teachers.map(t => {
                      const conflicts = checkTeacherConflictForSlots(t.id, confirmLessons);
                      const isSelected = confirmTeacherId === t.id;
                      const hasConflict = conflicts.length > 0;

                      return (
                        <div
                          key={t.id}
                          className={`teacher-select-card ${isSelected ? `selected ${t.id === "teacher-zehra" ? "zehra" : ""}` : ""} ${hasConflict ? "has-conflict" : ""}`}
                          onClick={() => setConfirmTeacherId(t.id)}
                        >
                          <div className="teacher-card-header">
                            <span className="teacher-card-name">
                              {t.id === "teacher-zehra" ? "👩‍🏫" : "👨‍🏫"} {t.name}
                            </span>
                            <span className={`teacher-card-status ${hasConflict ? "conflict" : "available"}`}>
                              {hasConflict ? "Çakışma Var" : "Uygun"}
                            </span>
                          </div>
                          
                          {hasConflict ? (
                            <div className="teacher-conflict-list">
                              Seçilen saatlerde çakışma var:
                              {conflicts.map((c, i) => (
                                <div key={i} className="teacher-conflict-item">
                                  • {c.day.substring(0,3)} {c.time.split(" ")[0]} ({c.studentName})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {confirmLessons.length > 0 ? "Bu program için tamamen uygun." : "Ders saati seçiniz."}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn btn-accent">Kaydı Tamamla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail */}
      {modal === "studentDetail" && selectedStudent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && (setModal(null) || setIsEditingSchedule(false))}>
          <div className="modal-content" style={{ maxWidth: 760 }}>
            <div className="modal-header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem" }}>{selectedStudent.studentName}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Veli: <strong>{selectedStudent.name}</strong> | 📞 {selectedStudent.phone} | Sınıf/Yaş: {selectedStudent.studentAgeGrade}
                  </p>
                </div>
                <button className="btn-icon-only" onClick={() => { setModal(null); setIsEditingSchedule(false); }}>✕</button>
              </div>

              {/* Ders ve Öğretmen Bilgisi Gösterim / Düzenleme Alanı */}
              <div style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--bg-app)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                fontSize: "0.825rem",
                marginTop: "4px"
              }}>
                <div>
                  <span style={{ marginRight: "15px" }}>
                    <strong>Öğretmen:</strong>{" "}
                    {selectedStudent.teacherName ? (
                      <span className={`student-teacher-pill ${selectedStudent.teacherId === "teacher-zehra" ? "zehra" : "firat"}`} style={{ padding: "2px 8px", fontSize: "0.725rem" }}>
                        {selectedStudent.teacherId === "teacher-zehra" ? "👩‍🏫" : "👨‍🏫"} {selectedStudent.teacherName}
                      </span>
                    ) : "—"}
                  </span>
                  <span>
                    <strong>Ders Programı:</strong>{" "}
                    {selectedStudent.lessons && selectedStudent.lessons.length > 0 ? (
                      selectedStudent.lessons.map(l => `${l.day.substring(0,3)} (${l.time.split(" ")[0]})`).join(", ")
                    ) : "—"}
                  </span>
                </div>
                {role !== "Öğretmen" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                    onClick={() => {
                      if (isEditingSchedule) {
                        setIsEditingSchedule(false);
                      } else {
                        setEditLessons(selectedStudent.lessons || []);
                        setEditTeacherId(selectedStudent.teacherId || "teacher-firat");
                        setIsEditingSchedule(true);
                      }
                    }}
                  >
                    <Edit3 size={12} /> {isEditingSchedule ? "Notlar/Ödemeler" : "Programı Düzenle"}
                  </button>
                )}
              </div>
            </div>

            <div className="modal-body">
              {isEditingSchedule ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
                  <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                    <h4 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={16} color="var(--primary)" /> Ders Programını ve Öğretmeni Güncelle
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Hücrelere tıklayarak ders programını seçiniz. Çakışma durumuna göre öğretmen atamasını yapınız.
                    </p>
                  </div>

                  {/* 7x7 Ders Programı Grid */}
                  <div className="schedule-grid-wrapper">
                    <table className="schedule-grid-table">
                      <thead>
                        <tr>
                          <th className="schedule-time-col">Saat / Gün</th>
                          {DAYS_OF_WEEK.map(d => (
                            <th key={d}>{d.substring(0, 3)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {LESSON_HOURS.map(hour => (
                          <tr key={hour}>
                            <td className="schedule-time-col">{hour.split(" ")[0]}</td>
                            {DAYS_OF_WEEK.map(day => {
                              const isSelected = editLessons.some(l => l.day === day && l.time === hour);
                              
                              // Diğer öğrenciler için çakışma durumları (aktif öğrenci hariç!)
                              const conflictingFirat = checkTeacherConflictForSlots("teacher-firat", [{ day, time: hour }], selectedStudent.id);
                              const conflictingZehra = checkTeacherConflictForSlots("teacher-zehra", [{ day, time: hour }], selectedStudent.id);
                              
                              let titleText = `${day} ${hour}`;
                              if (conflictingFirat.length > 0) titleText += `\nFırat Hoca Dolu (${conflictingFirat[0].studentName})`;
                              if (conflictingZehra.length > 0) titleText += `\nZehra Hoca Dolu (${conflictingZehra[0].studentName})`;

                              return (
                                <td key={day} title={titleText}>
                                  <button
                                    type="button"
                                    className={`schedule-slot-btn ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                      if (isSelected) {
                                        setEditLessons(prev => prev.filter(l => !(l.day === day && l.time === hour)));
                                      } else {
                                        setEditLessons(prev => [...prev, { day, time: hour }]);
                                      }
                                    }}
                                  >
                                    ✓
                                  </button>
                                  {/* Küçük doluluk göstergesi */}
                                  {(conflictingFirat.length > 0 || conflictingZehra.length > 0) && !isSelected && (
                                    <div style={{
                                      position: "absolute",
                                      bottom: 2,
                                      right: 2,
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: conflictingFirat.length > 0 && conflictingZehra.length > 0 ? "var(--accent)" : "var(--warning)"
                                    }} />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Öğretmen Seçim Kartları */}
                  <div className="teacher-cards-grid">
                    {teachers.map(t => {
                      const conflicts = checkTeacherConflictForSlots(t.id, editLessons, selectedStudent.id);
                      const isSelected = editTeacherId === t.id;
                      const hasConflict = conflicts.length > 0;

                      return (
                        <div
                          key={t.id}
                          className={`teacher-select-card ${isSelected ? `selected ${t.id === "teacher-zehra" ? "zehra" : ""}` : ""} ${hasConflict ? "has-conflict" : ""}`}
                          onClick={() => setEditTeacherId(t.id)}
                        >
                          <div className="teacher-card-header">
                            <span className="teacher-card-name">
                              {t.id === "teacher-zehra" ? "👩‍🏫" : "👨‍🏫"} {t.name}
                            </span>
                            <span className={`teacher-card-status ${hasConflict ? "conflict" : "available"}`}>
                              {hasConflict ? "Çakışma Var" : "Uygun"}
                            </span>
                          </div>
                          
                          {hasConflict ? (
                            <div className="teacher-conflict-list">
                              Çakışan dersler:
                              {conflicts.map((c, i) => (
                                <div key={i} className="teacher-conflict-item">
                                  • {c.day.substring(0,3)} {c.time.split(" ")[0]} ({c.studentName})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {editLessons.length > 0 ? "Bu program için tamamen uygun." : "Ders saati seçiniz."}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Kaydet ve İptal Butonları */}
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditingSchedule(false)}
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const updatedStudent = await apiFetch(`/students/${selectedStudent.id}/schedule`, {
                            method: "PUT",
                            body: JSON.stringify({
                              teacherId: editTeacherId,
                              lessons: editLessons
                            })
                          });
                          
                          setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
                          setSelectedStudent(updatedStudent);
                          setIsEditingSchedule(false);
                          showToast("Ders programı başarıyla güncellendi.", "success");
                        } catch (err) {
                          showToast(err.message, "error");
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Programı Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem" }}>
                  {/* Notes */}
                  <div>
                    <h4 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", marginBottom: 8 }}>
                      <FileText size={15} color="var(--primary)" /> Gelişim Notları
                    </h4>
                    <div className="notes-container">
                      {selectedStudent.notes.length === 0
                        ? <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: 10 }}>Henüz not yok.</p>
                        : selectedStudent.notes.map(note => (
                            <div className="note-item" key={note.id}>
                              <div className="note-meta">
                                <span className="note-author">{note.author}</span>
                                <span>{note.date}</span>
                              </div>
                              <p className="note-text">{note.content}</p>
                              {role !== "Öğretmen" && (
                                <button className="note-delete-btn" onClick={() => handleDeleteNote(selectedStudent.id, note.id)}>✕</button>
                              )}
                            </div>
                          ))
                      }
                    </div>
                    <div className="add-note-box">
                      <input
                        type="text"
                        className="form-control add-note-input"
                        placeholder="Hız ölçümü, gelişim notu, gözlem…"
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddNote(selectedStudent.id)}
                      />
                      <button className="btn btn-primary" style={{ padding: "10px 14px" }} onClick={() => handleAddNote(selectedStudent.id)}>
                        <Send size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Payments */}
                  <div>
                    {role !== "Öğretmen" ? (() => {
                      const due = selectedStudent.totalPrice - selectedStudent.discount;
                      const rem = due - selectedStudent.paidAmount;
                      const pct = due > 0 ? Math.min(Math.round((selectedStudent.paidAmount / due) * 100), 100) : 0;
                      return (
                        <>
                          <h4 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", marginBottom: 8 }}>
                            <DollarSign size={15} color="var(--accent)" /> Ödeme Planı
                          </h4>
                          <div className="payment-summary-block" style={{ padding: "10px 12px" }}>
                            {[["Toplam", due], ["Ödenen", selectedStudent.paidAmount], ["Kalan", rem]].map(([lbl, amt]) => (
                              <div className="payment-sum-item" key={lbl}>
                                <span className="payment-sum-title">{lbl}</span>
                                <span className="payment-sum-value" style={lbl === "Ödenen" ? { color: "var(--success)" } : lbl === "Kalan" ? { color: "var(--accent)" } : {}}>
                                  {amt.toLocaleString("tr-TR")} ₺
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="progress-bar-wrapper" style={{ margin: "10px 0 4px" }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div style={{ textAlign: "right", fontSize: "0.72rem", fontWeight: 700, marginBottom: 10 }}>
                            Tahsilat: %{pct}
                          </div>
                          {rem > 0 && (
                            <button
                              className="btn btn-accent"
                              style={{ width: "100%", justifyContent: "center", padding: "8px", fontSize: "0.8rem", marginBottom: 12 }}
                              onClick={() => { setPaymentForm({ ...emptyPaymentForm, studentId: selectedStudent.id, amount: String(rem) }); setModal("addPayment"); }}
                            >
                              <Plus size={14} /> Taksit Tahsil Et
                            </button>
                          )}
                          <h5 style={{ fontSize: "0.78rem", marginBottom: 6 }}>Ödeme Hareketleri</h5>
                          <div className="payment-list-modal">
                            {selectedStudent.payments.length === 0
                              ? <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Henüz ödeme yok.</p>
                              : selectedStudent.payments.map(p => (
                                  <div className="payment-row-item" key={p.id}>
                                    <div className="payment-row-info"><span>{p.date}</span><span>({p.type})</span></div>
                                    <span className="payment-row-amount">+{p.amount.toLocaleString("tr-TR")} ₺</span>
                                  </div>
                                ))
                            }
                          </div>
                        </>
                      );
                    })() : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center", height: "100%", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", padding: 20, textAlign: "center" }}>
                        <AlertTriangle size={30} color="var(--warning)" />
                        <h5 style={{ fontSize: "0.85rem" }}>Erişim Kısıtlandı</h5>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Öğretmen rolü finansal bilgileri görüntüleyemez.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setModal(null); setIsEditingSchedule(false); }}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment */}
      {modal === "addPayment" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ödeme Tahsilat Girişi</h3>
              <button className="btn-icon-only" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleAddPayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Öğrenci *</label>
                  <select
                    className="form-control"
                    value={paymentForm.studentId}
                    onChange={e => {
                      const s = students.find(st => st.id === e.target.value);
                      if (s) {
                        const rem = (s.totalPrice - s.discount) - s.paidAmount;
                        setPaymentForm(f => ({ ...f, studentId: e.target.value, amount: String(rem > 0 ? rem : "") }));
                      } else {
                        setPaymentForm(f => ({ ...f, studentId: e.target.value }));
                      }
                    }}
                    required
                  >
                    <option value="">Öğrenci seçin…</option>
                    {students.map(s => {
                      const rem = (s.totalPrice - s.discount) - s.paidAmount;
                      return rem > 0
                        ? <option key={s.id} value={s.id}>{s.studentName} — Kalan: {rem.toLocaleString("tr-TR")} ₺</option>
                        : null;
                    })}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tutar (₺) *</label>
                    <input type="number" min="1" className="form-control" placeholder="Örn: 2000" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Ödeme Türü</label>
                    <select className="form-control" value={paymentForm.type} onChange={e => setPaymentForm(f => ({ ...f, type: e.target.value }))}>
                      <option>Nakit</option><option>Kredi Kartı</option><option>EFT/Havale</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tarih</label>
                    <input type="date" className="form-control" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Açıklama</label>
                    <input type="text" className="form-control" placeholder="2. Taksit" value={paymentForm.description} onChange={e => setPaymentForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                <button type="submit" className="btn btn-accent">Tahsil Et</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suda Dynamics Filigranı */}
      <div className="suda-dynamics-watermark">
        Suda Dynamics Projesidir
      </div>

    </div>
  );
}

export default App;

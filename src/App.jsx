 import { useState, useEffect, useCallback, useRef } from "react";

// ─── Utilities ───────────────────────────────────────────────────────────────
const generateId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `#${id}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const paymentTermsDays = { "Net 1 Day": 1, "Net 7 Days": 7, "Net 14 Days": 14, "Net 30 Days": 30 };

const calcTotal = (items) =>
  items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseInt(i.qty) || 0), 0);

const formatCurrency = (n) =>
  `£ ${parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const INITIAL_INVOICES = [
  {
    id: "#RT3080", status: "paid",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "Jensen Huang", clientEmail: "jensenhuang@mail.com",
    clientStreet: "106 Kendell Street", clientCity: "Sharrington", clientPostCode: "NR24 5WQ", clientCountry: "United Kingdom",
    invoiceDate: "2021-08-19", paymentTerms: "Net 1 Day", description: "Graphic Design",
    items: [{ id: 1, name: "Brand Guidelines", qty: 1, price: 1800.90 }],
  },
  {
    id: "#XM9141", status: "pending",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "Alex Grim", clientEmail: "alexgrim@mail.com",
    clientStreet: "84 Church Way", clientCity: "Bradford", clientPostCode: "BD1 9PB", clientCountry: "United Kingdom",
    invoiceDate: "2021-08-21", paymentTerms: "Net 30 Days", description: "Graphic Design",
    items: [{ id: 1, name: "Banner Design", qty: 1, price: 156.00 }, { id: 2, name: "Email Design", qty: 2, price: 200.00 }],
  },
  {
    id: "#RG0314", status: "paid",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "John Morrison", clientEmail: "johnmorrison@mail.com",
    clientStreet: "79 Dover Road", clientCity: "Westhall", clientPostCode: "IP19 3PF", clientCountry: "United Kingdom",
    invoiceDate: "2021-09-01", paymentTerms: "Net 30 Days", description: "Web Design",
    items: [{ id: 1, name: "Website Redesign", qty: 1, price: 14002.33 }],
  },
  {
    id: "#RT2080", status: "pending",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "Alysa Werner", clientEmail: "alysawerner@mail.com",
    clientStreet: "48 Langley Lane", clientCity: "Stevenage", clientPostCode: "SG1 6AH", clientCountry: "United Kingdom",
    invoiceDate: "2021-09-12", paymentTerms: "Net 30 Days", description: "Logo Design",
    items: [{ id: 1, name: "Logo Concept", qty: 1, price: 102.04 }],
  },
  {
    id: "#AA1449", status: "pending",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "Mellisa Clarke", clientEmail: "mellisaclarke@mail.com",
    clientStreet: "46 Abbey Row", clientCity: "Cambridge", clientPostCode: "CB5 6EG", clientCountry: "United Kingdom",
    invoiceDate: "2021-09-14", paymentTerms: "Net 30 Days", description: "Re-branding",
    items: [{ id: 1, name: "New Branding Strategy", qty: 1, price: 2756.00 }, { id: 2, name: "Brand guidelines", qty: 1, price: 1276.33 }],
  },
  {
    id: "#TY9141", status: "pending",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "Thomas Wayne", clientEmail: "thomaswayne@mail.com",
    clientStreet: "3 Romford Road", clientCity: "Stratford", clientPostCode: "E15 4BX", clientCountry: "United Kingdom",
    invoiceDate: "2021-10-01", paymentTerms: "Net 30 Days", description: "Landing Page Design",
    items: [{ id: 1, name: "Web Page Design", qty: 3, price: 2051.97 }],
  },
  {
    id: "#FV2353", status: "draft",
    billFrom: { street: "19 Union Terrace", city: "London", postCode: "E1 3EZ", country: "United Kingdom" },
    clientName: "Anita Wainwright", clientEmail: "anitawainwright@mail.com",
    clientStreet: "", clientCity: "", clientPostCode: "", clientCountry: "",
    invoiceDate: "2021-11-12", paymentTerms: "Net 30 Days", description: "Branding",
    items: [{ id: 1, name: "Branding Booklet", qty: 2, price: 1551.02 }],
  },
];

const EMPTY_FORM = {
  billFrom: { street: "", city: "", postCode: "", country: "" },
  clientName: "", clientEmail: "", clientStreet: "", clientCity: "", clientPostCode: "", clientCountry: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  paymentTerms: "Net 30 Days",
  description: "",
  items: [{ id: Date.now(), name: "", qty: 1, price: "" }],
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const createStyles = (dark) => ({
  // layout
  app: {
    display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    background: dark ? "#141625" : "#F8F8FB", color: dark ? "#FFF" : "#0C0E16",
    transition: "background 0.3s, color 0.3s",
  },
  sidebar: {
    width: 80, background: dark ? "#1E2139" : "#373B53",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "space-between", paddingBottom: 24,
    borderRadius: "0 20px 20px 0", position: "fixed", top: 0, left: 0,
    height: "100vh", zIndex: 100,
  },
  sidebarTop: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
  logo: {
    width: 80, height: 80, background: "linear-gradient(to bottom, #7C5DFA, #9277FF)",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "0 20px 20px 0", cursor: "pointer", position: "relative", overflow: "hidden",
  },
  logoHalf: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
    background: "rgba(0,0,0,0.15)", borderRadius: "20px 20px 0 0",
  },
  sidebarBottom: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  themeBtn: {
    background: "none", border: "none", cursor: "pointer", padding: 8,
    color: dark ? "#858BB2" : "#7E88C3", fontSize: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    border: "2px solid #494E6E", overflow: "hidden", cursor: "pointer",
    background: "#9277FF", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#FFF", fontWeight: 700, fontSize: 14,
  },
  // main
  main: { marginLeft: 80, flex: 1, padding: "40px 48px", maxWidth: 780, width: "100%" },
  // header row
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 },
  pageTitle: { fontSize: 32, fontWeight: 700, margin: 0, color: dark ? "#FFF" : "#0C0E16" },
  pageSubtitle: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", marginTop: 4 },
  // filter
  filterArea: { display: "flex", alignItems: "center", gap: 16 },
  filterDropBtn: {
    background: "none", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 8,
    color: dark ? "#FFF" : "#0C0E16", fontWeight: 700, fontSize: 15,
    fontFamily: "inherit",
  },
  filterMenu: {
    position: "absolute", top: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)",
    background: dark ? "#252945" : "#FFF", borderRadius: 8, padding: 24, minWidth: 192,
    boxShadow: dark ? "0 10px 20px rgba(0,0,0,0.5)" : "0 10px 20px rgba(72,84,159,0.25)",
    zIndex: 200,
  },
  filterItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "6px 0",
    cursor: "pointer", fontSize: 15, fontWeight: 700, userSelect: "none",
    color: dark ? "#FFF" : "#0C0E16",
  },
  checkbox: (checked, dark) => ({
    width: 16, height: 16, borderRadius: 2, border: `1px solid ${checked ? "#7C5DFA" : dark ? "#1E2139" : "#DFE3FA"}`,
    background: checked ? "#7C5DFA" : dark ? "#1E2139" : "#DFE3FA",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  }),
  // new invoice btn
  newBtn: {
    background: "#7C5DFA", color: "#FFF", border: "none", borderRadius: 24,
    padding: "14px 14px 14px 6px", display: "flex", alignItems: "center", gap: 12,
    cursor: "pointer", fontWeight: 700, fontSize: 15, fontFamily: "inherit",
    transition: "background 0.2s",
  },
  newBtnIcon: {
    width: 32, height: 32, borderRadius: "50%", background: "#FFF",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#7C5DFA",
    fontSize: 18, fontWeight: 700,
  },
  // invoice list
  invoiceCard: (dark, hover) => ({
    background: dark ? "#1E2139" : "#FFF",
    border: `1px solid ${dark ? "#252945" : "#FFF"}`,
    borderRadius: 8, padding: "24px 24px 24px 32px",
    display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
    marginBottom: 16, transition: "border-color 0.2s",
    borderColor: hover ? "#7C5DFA" : dark ? "#252945" : "#FFF",
  }),
  invoiceId: { fontWeight: 700, color: dark ? "#FFF" : "#0C0E16", minWidth: 80, fontSize: 15 },
  invoiceDue: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", minWidth: 120 },
  invoiceName: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", flex: 1 },
  invoiceAmt: { fontWeight: 700, fontSize: 16, color: dark ? "#FFF" : "#0C0E16", minWidth: 100, textAlign: "right" },
  // status badge
  statusBadge: (status, dark) => {
    const map = {
      paid: { bg: dark ? "rgba(51,214,159,0.06)" : "rgba(51,214,159,0.06)", color: "#33D69F" },
      pending: { bg: dark ? "rgba(255,143,0,0.06)" : "rgba(255,143,0,0.06)", color: "#FF8F00" },
      draft: { bg: dark ? "rgba(223,227,250,0.06)" : "rgba(55,59,83,0.06)", color: dark ? "#DFE3FA" : "#373B53" },
    };
    const s = map[status] || map.draft;
    return {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: s.bg, color: s.color,
      padding: "10px 16px", borderRadius: 6, fontWeight: 700, fontSize: 15, minWidth: 104,
      justifyContent: "center",
    };
  },
  dot: (status) => {
    const colors = { paid: "#33D69F", pending: "#FF8F00", draft: "#373B53" };
    return { width: 8, height: 8, borderRadius: "50%", background: colors[status] || "#373B53" };
  },
  chevron: { color: "#7C5DFA", fontSize: 14, marginLeft: 8 },
  // empty state
  emptyState: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "80px 0", textAlign: "center",
  },
  emptyImg: { width: 240, marginBottom: 40 },
  emptyTitle: { fontSize: 24, fontWeight: 700, marginBottom: 16, color: dark ? "#FFF" : "#0C0E16" },
  emptyText: { color: dark ? "#DFE3FA" : "#888EB0", fontSize: 13, maxWidth: 220, lineHeight: 1.8 },
  // detail view
  goBack: {
    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
    background: "none", border: "none", fontWeight: 700, fontSize: 15,
    color: dark ? "#FFF" : "#0C0E16", fontFamily: "inherit", marginBottom: 32, padding: 0,
  },
  detailCard: {
    background: dark ? "#1E2139" : "#FFF", borderRadius: 8, padding: 48, marginBottom: 24,
  },
  detailHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  actionBar: {
    background: dark ? "#1E2139" : "#FFF", borderRadius: 8, padding: "24px 32px",
    display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
  },
  statusLabel: { color: dark ? "#DFE3FA" : "#888EB0", fontSize: 13, marginRight: "auto" },
  editBtn: {
    background: dark ? "#252945" : "#F9FAFE", color: dark ? "#DFE3FA" : "#7E88C3",
    border: "none", borderRadius: 24, padding: "14px 24px", fontWeight: 700,
    fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s",
  },
  deleteBtn: {
    background: "#EC5757", color: "#FFF", border: "none", borderRadius: 24,
    padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer",
    fontFamily: "inherit", transition: "background 0.2s",
  },
  markPaidBtn: {
    background: "#7C5DFA", color: "#FFF", border: "none", borderRadius: 24,
    padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer",
    fontFamily: "inherit", transition: "background 0.2s",
  },
  // detail content
  invoiceNum: { fontSize: 16, fontWeight: 700, color: dark ? "#FFF" : "#0C0E16" },
  invoiceDesc: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", marginTop: 4 },
  billFromAddr: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", lineHeight: 2.0, textAlign: "right" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, marginBottom: 40 },
  detailLabel: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", marginBottom: 8 },
  detailValue: { fontSize: 15, fontWeight: 700, color: dark ? "#FFF" : "#0C0E16" },
  detailValueSm: { fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", lineHeight: 2.0 },
  itemsTable: {
    background: dark ? "#252945" : "#F9FAFE", borderRadius: "8px 8px 0 0", padding: 32,
  },
  itemsHeader: {
    display: "grid", gridTemplateColumns: "1fr 80px 100px 100px",
    fontSize: 13, color: dark ? "#DFE3FA" : "#888EB0", marginBottom: 16,
  },
  itemRow: {
    display: "grid", gridTemplateColumns: "1fr 80px 100px 100px",
    alignItems: "center", marginBottom: 16, fontSize: 15,
  },
  itemName: { fontWeight: 700, color: dark ? "#FFF" : "#0C0E16" },
  itemMeta: { color: dark ? "#888EB0" : "#888EB0", fontWeight: 700 },
  amountDue: {
    background: dark ? "#0C0E16" : "#373B53", borderRadius: "0 0 8px 8px",
    padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
    color: "#FFF",
  },
  amtLabel: { fontSize: 13 },
  amtValue: { fontSize: 28, fontWeight: 700 },
  // drawer overlay
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300,
    display: "flex",
  },
  drawer: {
    background: dark ? "#141625" : "#FFF",
    width: "min(616px, 100vw)", height: "100vh",
    overflow: "hidden", position: "relative",
    display: "flex", flexDirection: "column",
    borderRadius: "0 20px 20px 0",
  },
  drawerScroll: { flex: 1, overflowY: "auto", padding: "56px 56px 32px" },
  drawerTitle: { fontSize: 24, fontWeight: 700, marginBottom: 40, color: dark ? "#FFF" : "#0C0E16" },
  drawerTitleSpan: { color: "#888EB0" },
  sectionLabel: { color: "#7C5DFA", fontSize: 15, fontWeight: 700, marginBottom: 24 },
  fieldGroup: { marginBottom: 24 },
  fieldLabel: { fontSize: 13, color: dark ? "#DFE3FA" : "#7E88C3", marginBottom: 8, display: "block" },
  fieldInput: (dark, error) => ({
    width: "100%", padding: "14px 16px", borderRadius: 4,
    border: `1px solid ${error ? "#EC5757" : dark ? "#252945" : "#DFE3FA"}`,
    background: dark ? "#1E2139" : "#FFF", color: dark ? "#FFF" : "#0C0E16",
    fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  }),
  fieldSelect: (dark) => ({
    width: "100%", padding: "14px 16px", borderRadius: 4,
    border: `1px solid ${dark ? "#252945" : "#DFE3FA"}`,
    background: dark ? "#1E2139" : "#FFF", color: dark ? "#FFF" : "#0C0E16",
    fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none",
    appearance: "none", boxSizing: "border-box", cursor: "pointer",
  }),
  threeCol: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  itemListHeader: {
    display: "grid", gridTemplateColumns: "1fr 64px 100px 80px 40px",
    gap: 16, fontSize: 13, color: "#888EB0", marginBottom: 8,
  },
  itemListRow: {
    display: "grid", gridTemplateColumns: "1fr 64px 100px 80px 40px",
    gap: 16, alignItems: "center", marginBottom: 16,
  },
  addItemBtn: {
    width: "100%", padding: 14, background: dark ? "#252945" : "#F9FAFE",
    border: "none", borderRadius: 24, color: dark ? "#DFE3FA" : "#7E88C3",
    fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
    marginTop: 8, transition: "background 0.2s",
  },
  drawerActions: {
    background: dark ? "#1E2139" : "#FFF",
    padding: "20px 56px", display: "flex", alignItems: "center",
    boxShadow: dark ? "-10px 0 20px rgba(0,0,0,0.5)" : "-10px 0 20px rgba(0,0,0,0.1)",
  },
  discardBtn: {
    background: "none", border: "none", color: dark ? "#DFE3FA" : "#7E88C3",
    fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
    marginRight: "auto",
  },
  draftBtn: {
    background: dark ? "#252945" : "#373B53", color: dark ? "#DFE3FA" : "#888EB0",
    border: "none", borderRadius: 24, padding: "14px 24px",
    fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
    marginRight: 8, transition: "background 0.2s",
  },
  saveBtn: {
    background: "#7C5DFA", color: "#FFF", border: "none", borderRadius: 24,
    padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer",
    fontFamily: "inherit", transition: "background 0.2s",
  },
  saveChangesBtn: {
    background: "#7C5DFA", color: "#FFF", border: "none", borderRadius: 24,
    padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer",
    fontFamily: "inherit", transition: "background 0.2s",
  },
  cancelBtn: {
    background: dark ? "#252945" : "#F9FAFE", color: dark ? "#DFE3FA" : "#7E88C3",
    border: "none", borderRadius: 24, padding: "14px 24px",
    fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
    marginRight: 8, transition: "background 0.2s",
  },
  deleteTrash: {
    background: "none", border: "none", cursor: "pointer", padding: 4,
    color: "#888EB0", fontSize: 18, display: "flex", alignItems: "center",
    transition: "color 0.2s",
  },
  errorText: { color: "#EC5757", fontSize: 11, marginTop: 4 },
  // modal
  modal: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500,
  },
  modalBox: {
    background: dark ? "#1E2139" : "#FFF", borderRadius: 8, padding: 48, maxWidth: 480, width: "90%",
  },
  modalTitle: { fontSize: 24, fontWeight: 700, marginBottom: 16, color: dark ? "#FFF" : "#0C0E16" },
  modalText: { color: dark ? "#DFE3FA" : "#888EB0", fontSize: 13, marginBottom: 32, lineHeight: 1.8 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 8 },
});

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, dark }) {
  const S = createStyles(dark);
  return (
    <span style={S.statusBadge(status, dark)}>
      <span style={S.dot(status)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Field({ label, value, onChange, error, type = "text", placeholder = "", dark, S }) {
  return (
    <div style={S.fieldGroup}>
      <label style={{ ...S.fieldLabel, color: error ? "#EC5757" : S.fieldLabel.color }}>
        {label}{error ? <span style={{ float: "right" }}>{error}</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={S.fieldInput(dark, Boolean(error))}
      />
    </div>
  );
}

// ─── Invoice Form Drawer ──────────────────────────────────────────────────────
function InvoiceForm({ dark, invoice, onClose, onSave }) {
  const isEdit = Boolean(invoice);
  const [form, setForm] = useState(invoice ? {
    billFrom: { ...invoice.billFrom },
    clientName: invoice.clientName, clientEmail: invoice.clientEmail,
    clientStreet: invoice.clientStreet, clientCity: invoice.clientCity,
    clientPostCode: invoice.clientPostCode, clientCountry: invoice.clientCountry,
    invoiceDate: invoice.invoiceDate, paymentTerms: invoice.paymentTerms,
    description: invoice.description,
    items: invoice.items.map(i => ({ ...i })),
  } : { ...EMPTY_FORM, billFrom: { ...EMPTY_FORM.billFrom }, items: [{ id: 1, name: "", qty: 1, price: "" }] });

  const [errors, setErrors] = useState({});
  const S = createStyles(dark);
  const drawerRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setBillFrom = (key, val) => setForm(f => ({ ...f, billFrom: { ...f.billFrom, [key]: val } }));

  const addItem = () => set("items", [...form.items, { id: Date.now(), name: "", qty: 1, price: "" }]);
  const removeItem = (id) => set("items", form.items.filter(i => i.id !== id));
  const updateItem = (id, key, val) => set("items", form.items.map(i => i.id === id ? { ...i, [key]: val } : i));

  const validate = () => {
    const e = {};
    if (!form.billFrom.street) e.billStreet = "required";
    if (!form.billFrom.city) e.billCity = "required";
    if (!form.billFrom.postCode) e.billPostCode = "required";
    if (!form.billFrom.country) e.billCountry = "required";
    if (!form.clientName) e.clientName = "required";
    if (!form.clientEmail) e.clientEmail = "required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) e.clientEmail = "invalid email";
    if (!form.clientStreet) e.clientStreet = "required";
    if (!form.clientCity) e.clientCity = "required";
    if (!form.clientPostCode) e.clientPostCode = "required";
    if (!form.clientCountry) e.clientCountry = "required";
    if (!form.invoiceDate) e.invoiceDate = "required";
    if (!form.description) e.description = "required";
    if (form.items.length === 0) e.items = "At least one item required";
    form.items.forEach((item, i) => {
      if (!item.name) e[`item_name_${i}`] = "required";
      if (!item.qty || item.qty <= 0) e[`item_qty_${i}`] = "required";
      if (!item.price || item.price <= 0) e[`item_price_${i}`] = "required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (asDraft = false) => {
    if (!asDraft && !validate()) return;
    const paymentDue = addDays(form.invoiceDate, paymentTermsDays[form.paymentTerms] || 30);
    onSave({
      ...form,
      id: invoice?.id || generateId(),
      status: asDraft ? "draft" : (invoice?.status === "paid" ? "paid" : "pending"),
      paymentDue,
    });
  };

   return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.drawer} ref={drawerRef} role="dialog" aria-modal="true" aria-label={isEdit ? `Edit invoice ${invoice.id}` : "New Invoice"}>
        <div style={S.drawerScroll}>
          <h2 style={S.drawerTitle}>
            {isEdit ? <>Edit <span style={S.drawerTitleSpan}>{invoice.id}</span></> : "New Invoice"}
          </h2>

          <p style={S.sectionLabel}>Bill From</p>
          <Field S={S} dark={dark} label="Street Address" value={form.billFrom.street} onChange={v => setBillFrom("street", v)} error={errors.billStreet} />
          <div style={S.threeCol}>
            <Field S={S} dark={dark} label="City" value={form.billFrom.city} onChange={v => setBillFrom("city", v)} error={errors.billCity} />
            <Field S={S} dark={dark} label="Post Code" value={form.billFrom.postCode} onChange={v => setBillFrom("postCode", v)} error={errors.billPostCode} />
            <Field S={S} dark={dark} label="Country" value={form.billFrom.country} onChange={v => setBillFrom("country", v)} error={errors.billCountry} />
          </div>

          <p style={{ ...S.sectionLabel, marginTop: 8 }}>Bill To</p>
          <Field S={S} dark={dark} label="Client's Name" value={form.clientName} onChange={v => set("clientName", v)} error={errors.clientName} />
          <Field S={S} dark={dark} label="Client's Email" value={form.clientEmail} onChange={v => set("clientEmail", v)} error={errors.clientEmail} type="email" placeholder="e.g. email@example.com" />
          <Field S={S} dark={dark} label="Street Address" value={form.clientStreet} onChange={v => set("clientStreet", v)} error={errors.clientStreet} />
          <div style={S.threeCol}>
            <Field S={S} dark={dark} label="City" value={form.clientCity} onChange={v => set("clientCity", v)} error={errors.clientCity} />
            <Field S={S} dark={dark} label="Post Code" value={form.clientPostCode} onChange={v => set("clientPostCode", v)} error={errors.clientPostCode} />
            <Field S={S} dark={dark} label="Country" value={form.clientCountry} onChange={v => set("clientCountry", v)} error={errors.clientCountry} />
          </div>

          <div style={S.twoCol}>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel}>Invoice Date</label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={e => set("invoiceDate", e.target.value)}
                  style={{ ...S.fieldInput(dark, false), paddingRight: 40 }}
                  disabled={isEdit}
                />
              </div>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel}>Payment Terms</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.paymentTerms}
                  onChange={e => set("paymentTerms", e.target.value)}
                  style={S.fieldSelect(dark)}
                >
                  {Object.keys(paymentTermsDays).map(t => <option key={t}>{t}</option>)}
                </select>
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#7C5DFA" }}>▾</span>
              </div>
            </div>
          </div>

          <Field S={S} dark={dark} label="Project Description" value={form.description} onChange={v => set("description", v)} error={errors.description} placeholder="e.g. Graphic Design Service" />

          <p style={{ color: "#777F98", fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Item List</p>
          {errors.items && <p style={S.errorText}>{errors.items}</p>}
          <div style={S.itemListHeader}>
            <span>Item Name</span>
            <span>Qty.</span>
            <span>Price</span>
            <span>Total</span>
            <span />
          </div>
          {form.items.map((item, idx) => (
            <div key={item.id} style={S.itemListRow}>
              <input
                value={item.name}
                onChange={e => updateItem(item.id, "name", e.target.value)}
                style={{ ...S.fieldInput(dark, Boolean(errors[`item_name_${idx}`])), marginBottom: 0 }}
              />
              <input
                type="number" min="1"
                value={item.qty}
                onChange={e => updateItem(item.id, "qty", e.target.value)}
                style={{ ...S.fieldInput(dark, Boolean(errors[`item_qty_${idx}`])), marginBottom: 0, textAlign: "center" }}
              />
              <input
                type="number" min="0" step="0.01"
                value={item.price}
                onChange={e => updateItem(item.id, "price", e.target.value)}
                style={{ ...S.fieldInput(dark, Boolean(errors[`item_price_${idx}`])), marginBottom: 0 }}
              />
              <span style={{ color: dark ? "#888EB0" : "#888EB0", fontWeight: 700 }}>
                {formatCurrency((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0))}
              </span>
              <button onClick={() => removeItem(item.id)} style={S.deleteTrash} aria-label="Remove item">
                <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
                  <path d="M11.583 3.556h-2.334V2.667A1.336 1.336 0 008 1.333H5.333A1.336 1.336 0 004 2.667v.889H1.667A.667.667 0 001.667 5H2.5v8.89A1.336 1.336 0 003.833 15.22h5.667a1.336 1.336 0 001.333-1.333V5h.75a.667.667 0 000-1.444zM5.333 2.667H8v.889H5.333v-.889zM9.5 13.889H3.833V5H9.5v8.889z" fill="currentColor" />
                </svg>
              </button>
            </div>
          ))}
          <button onClick={addItem} style={S.addItemBtn}>+ Add New Item</button>
          <div style={{ height: 40 }} />
        </div>

        <div style={S.drawerActions}>
          {!isEdit && <button onClick={onClose} style={S.discardBtn}>Discard</button>}
          {!isEdit && <button onClick={() => handleSave(true)} style={S.draftBtn}>Save as Draft</button>}
          {!isEdit && <button onClick={() => handleSave(false)} style={S.saveBtn}>Save &amp; Send</button>}
          {isEdit && <button onClick={onClose} style={S.cancelBtn}>Cancel</button>}
          {isEdit && <button onClick={() => handleSave(false)} style={S.saveChangesBtn}>Save Changes</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ invoiceId, dark, onCancel, onConfirm }) {
  const S = createStyles(dark);
  const confirmRef = useRef();
  useEffect(() => { confirmRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);
  return (
    <div style={S.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div style={S.modalBox}>
        <h2 id="modal-title" style={S.modalTitle}>Confirm Deletion</h2>
        <p style={S.modalText}>
          Are you sure you want to delete invoice {invoiceId}? This action cannot be undone.
        </p>
        <div style={S.modalActions}>
          <button onClick={onCancel} style={{ ...S.editBtn, marginRight: 8 }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} style={S.deleteBtn}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Detail ───────────────────────────────────────────────────────────
function InvoiceDetail({ invoice, dark, onBack, onEdit, onDelete, onMarkPaid }) {
  const [showDelete, setShowDelete] = useState(false);
  const S = createStyles(dark);
  const total = calcTotal(invoice.items);
  const paymentDue = invoice.paymentDue || addDays(invoice.invoiceDate, paymentTermsDays[invoice.paymentTerms] || 30);

  return (
    <div style={S.main}>
      <button onClick={onBack} style={S.goBack} aria-label="Go back to invoices">
        <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M6 1L2 5l4 4" stroke="#7C5DFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Go back
      </button>

      <div style={S.actionBar}>
        <span style={S.statusLabel}>Status</span>
        <StatusBadge status={invoice.status} dark={dark} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {invoice.status !== "paid" && <button onClick={onEdit} style={S.editBtn}>Edit</button>}
          <button onClick={() => setShowDelete(true)} style={S.deleteBtn}>Delete</button>
          {invoice.status === "pending" && <button onClick={onMarkPaid} style={S.markPaidBtn}>Mark as Paid</button>}
          {invoice.status === "draft" && <button onClick={() => onMarkPaid("pending")} style={S.markPaidBtn}>Send Invoice</button>}
        </div>
      </div>

      <div style={S.detailCard}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={S.invoiceNum}>{invoice.id}</p>
            <p style={S.invoiceDesc}>{invoice.description}</p>
          </div>
          <div style={S.billFromAddr}>
            {invoice.billFrom.street}<br />
            {invoice.billFrom.city}<br />
            {invoice.billFrom.postCode}<br />
            {invoice.billFrom.country}
          </div>
        </div>

        <div style={S.detailGrid}>
          <div>
            <p style={S.detailLabel}>Invoice Date</p>
            <p style={S.detailValue}>{formatDate(invoice.invoiceDate)}</p>
            <p style={{ ...S.detailLabel, marginTop: 32 }}>Payment Due</p>
            <p style={S.detailValue}>{formatDate(paymentDue)}</p>
          </div>
          <div>
            <p style={S.detailLabel}>Bill To</p>
            <p style={S.detailValue}>{invoice.clientName}</p>
            <p style={S.detailValueSm}>
              {invoice.clientStreet}<br />
              {invoice.clientCity}<br />
              {invoice.clientPostCode}<br />
              {invoice.clientCountry}
            </p>
          </div>
          <div>
            <p style={S.detailLabel}>Sent to</p>
            <p style={S.detailValue}>{invoice.clientEmail}</p>
          </div>
        </div>

        <div style={S.itemsTable}>
          <div style={S.itemsHeader}>
            <span>Item Name</span>
            <span style={{ textAlign: "center" }}>QTY.</span>
            <span style={{ textAlign: "right" }}>Price</span>
            <span style={{ textAlign: "right" }}>Total</span>
          </div>
          {invoice.items.map(item => (
            <div key={item.id} style={S.itemRow}>
              <span style={S.itemName}>{item.name}</span>
              <span style={{ ...S.itemMeta, textAlign: "center" }}>{item.qty}</span>
              <span style={{ ...S.itemMeta, textAlign: "right" }}>{formatCurrency(item.price)}</span>
              <span style={{ ...S.itemName, textAlign: "right" }}>{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div style={S.amountDue}>
          <span style={S.amtLabel}>Amount Due</span>
          <span style={S.amtValue}>{formatCurrency(total)}</span>
        </div>
      </div>

      {showDelete && (
        <DeleteModal
          invoiceId={invoice.id}
          dark={dark}
          onCancel={() => setShowDelete(false)}
          onConfirm={() => { onDelete(invoice.id); setShowDelete(false); }}
        />
      )}
    </div>
  );
}

// ─── Invoice List ─────────────────────────────────────────────────────────────
function InvoiceList({ invoices, dark, filter, setFilter, onNew, onSelect }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef();
  const S = createStyles(dark);
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = invoices.filter(inv => filter.length === 0 || filter.includes(inv.status));

  const toggleFilter = (status) => {
    setFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const filterLabels = { draft: "Draft", pending: "Pending", paid: "Paid" };

  const subtitle = invoices.length === 0 ? "No invoices"
    : filtered.length === 0 ? "No results"
    : `There are ${filtered.length} total invoice${filtered.length !== 1 ? "s" : ""}`;

  return (
    <div style={S.main}>
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Invoices</h1>
          <p style={S.pageSubtitle}>{subtitle}</p>
        </div>
        <div style={S.filterArea}>
          <div style={{ position: "relative" }} ref={filterRef}>
            <button
              style={S.filterDropBtn}
              onClick={() => setFilterOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={filterOpen}
            >
              Filter by status
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                <path d={filterOpen ? "M1 6l4.5-4.5L10 6" : "M1 1l4.5 4.5L10 1"} stroke="#7C5DFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {filterOpen && (
              <div style={S.filterMenu} role="menu">
                {["draft", "pending", "paid"].map(status => (
                  <div
                    key={status}
                    style={S.filterItem}
                    onClick={() => toggleFilter(status)}
                    role="menuitemcheckbox"
                    aria-checked={filter.includes(status)}
                  >
                    <div style={S.checkbox(filter.includes(status), dark)}>
                      {filter.includes(status) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {filterLabels[status]}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button style={S.newBtn} onClick={onNew}>
            <span style={S.newBtnIcon}>+</span>
            New Invoice
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={S.emptyState}>
          <svg width="240" height="200" viewBox="0 0 242 200" fill="none" style={{ marginBottom: 40 }}>
            <ellipse cx="121" cy="100" rx="100" ry="80" fill={dark ? "#252945" : "#F3F3F5"} />
            <rect x="75" y="55" width="92" height="110" rx="8" fill={dark ? "#7C5DFA" : "#9277FF"} opacity="0.3" />
            <rect x="82" y="75" width="60" height="8" rx="4" fill={dark ? "#7C5DFA" : "#9277FF"} />
            <rect x="82" y="91" width="40" height="6" rx="3" fill={dark ? "#888EB0" : "#DFE3FA"} />
            <rect x="82" y="105" width="50" height="6" rx="3" fill={dark ? "#888EB0" : "#DFE3FA"} />
            <circle cx="155" cy="65" r="20" fill={dark ? "#1E2139" : "#FFF"} />
            <text x="155" y="71" textAnchor="middle" fill="#7C5DFA" fontSize="20" fontWeight="700">!</text>
          </svg>
          <h2 style={S.emptyTitle}>There is nothing here</h2>
          <p style={S.emptyText}>
            Create an invoice by clicking the <strong>New Invoice</strong> button and get started
          </p>
        </div>
      ) : (
        filtered.map(inv => {
          const paymentDue = inv.paymentDue || addDays(inv.invoiceDate, paymentTermsDays[inv.paymentTerms] || 30);
          return (
            <div
              key={inv.id}
              style={S.invoiceCard(dark, hoveredId === inv.id)}
              onClick={() => onSelect(inv.id)}
              onMouseEnter={() => setHoveredId(inv.id)}
              onMouseLeave={() => setHoveredId(null)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && onSelect(inv.id)}
              aria-label={`Invoice ${inv.id}, ${inv.clientName}, ${formatCurrency(calcTotal(inv.items))}, ${inv.status}`}
            >
              <span style={S.invoiceId}>{inv.id}</span>
              <span style={S.invoiceDue}>Due {formatDate(paymentDue)}</span>
              <span style={S.invoiceName}>{inv.clientName}</span>
              <span style={S.invoiceAmt}>{formatCurrency(calcTotal(inv.items))}</span>
              <StatusBadge status={inv.status} dark={dark} />
              <svg width="7" height="10" viewBox="0 0 7 10" fill="none" style={S.chevron}>
                <path d="M1 1l5 4-5 4" stroke="#7C5DFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("invoice-theme") === "dark"; } catch { return false; }
  });
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem("invoices");
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch { return INITIAL_INVOICES; }
  });
  const [filter, setFilter] = useState([]);
  const [view, setView] = useState("list"); // list | detail
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  useEffect(() => {
    try { localStorage.setItem("invoices", JSON.stringify(invoices)); } catch (err) { void err; }
  }, [invoices]);

  useEffect(() => {
    try { localStorage.setItem("invoice-theme", dark ? "dark" : "light"); } catch (err) { void err; }
  }, [dark]);

  const selectedInvoice = invoices.find(i => i.id === selectedId);
  const S = createStyles(dark);

  const handleSave = useCallback((data) => {
    setInvoices(prev => {
      const exists = prev.find(i => i.id === data.id);
      if (exists) return prev.map(i => i.id === data.id ? data : i);
      return [data, ...prev];
    });
    setShowForm(false);
    setEditInvoice(null);
  }, []);

  const handleDelete = useCallback((id) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    setView("list");
    setSelectedId(null);
  }, []);

  const handleMarkPaid = useCallback((newStatus = "paid") => {
    setInvoices(prev => prev.map(i => i.id === selectedId ? { ...i, status: newStatus } : i));
  }, [selectedId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1)" : "none"}; }
        select option { background: ${dark ? "#1E2139" : "#FFF"}; color: ${dark ? "#FFF" : "#0C0E16"}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${dark ? "#252945" : "#DFE3FA"}; border-radius: 3px; }
        button:focus-visible, a:focus-visible { outline: 2px solid #7C5DFA; outline-offset: 2px; }
        @media (max-width: 768px) {
          .invoice-card-grid { flex-direction: column !important; }
          .main-content { padding: 24px 16px !important; }
        }
      `}</style>
      <div style={S.app}>
        {/* Sidebar */}
        <aside style={S.sidebar} aria-label="Navigation">
          <div style={S.sidebarTop}>
            <div style={S.logo} onClick={() => setView("list")} role="button" tabIndex={0} aria-label="Home">
              <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M20.513 0C24.4 2.535 27 6.792 27 11.667c0 4.874-2.6 9.131-6.487 11.666L14 0l6.513 0z" fill="white" opacity="0.5" />
                <path fillRule="evenodd" clipRule="evenodd" d="M7.487 23.333C3.6 20.799 1 16.541 1 11.667c0-4.875 2.6-9.132 6.487-11.667L14 23.333H7.487z" fill="white" />
              </svg>
              <div style={S.logoHalf} />
            </div>
          </div>
          <div style={S.sidebarBottom}>
            <button
              style={S.themeBtn}
              onClick={() => setDark(d => !d)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 15a5 5 0 100-10 5 5 0 000 10zM10 0a1 1 0 011 1v1a1 1 0 11-2 0V1a1 1 0 011-1zm0 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3.22 3.22a1 1 0 011.42 0l.7.7a1 1 0 11-1.42 1.42l-.7-.7a1 1 0 010-1.42zm12.02 12.02a1 1 0 011.42 0l.7.7a1 1 0 11-1.42 1.42l-.7-.7a1 1 0 010-1.42zM0 10a1 1 0 011-1h1a1 1 0 110 2H1a1 1 0 01-1-1zm17 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM3.22 16.78a1 1 0 010-1.42l.7-.7a1 1 0 011.42 1.42l-.7.7a1 1 0 01-1.42 0zM15.24 4.76a1 1 0 010-1.42l.7-.7a1 1 0 011.42 1.42l-.7.7a1 1 0 01-1.42 0z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <div style={{ width: "80%", height: 1, background: "#494E6E" }} />
            <div style={S.avatar} aria-label="User profile">A</div>
          </div>
        </aside>

        {/* Content */}
        {view === "list" ? (
          <InvoiceList
            invoices={invoices}
            dark={dark}
            filter={filter}
            setFilter={setFilter}
            onNew={() => { setEditInvoice(null); setShowForm(true); }}
            onSelect={(id) => { setSelectedId(id); setView("detail"); }}
          />
        ) : selectedInvoice ? (
          <InvoiceDetail
            invoice={selectedInvoice}
            dark={dark}
            onBack={() => setView("list")}
            onEdit={() => { setEditInvoice(selectedInvoice); setShowForm(true); }}
            onDelete={handleDelete}
            onMarkPaid={handleMarkPaid}
          />
        ) : null}

        {/* Form Drawer */}
        {showForm && (
          <InvoiceForm
            dark={dark}
            invoice={editInvoice}
            onClose={() => { setShowForm(false); setEditInvoice(null); }}
            onSave={handleSave}
          />
        )}
      </div>
    </>
  );
}
# Invoice Management App

A fully responsive Invoice Management Application built with React. Users can create, view, edit, and delete invoices, save drafts, mark invoices as paid, filter by status, and toggle between light and dark mode — all with data persisted via localStorage.

---

## Live Demo

> Add your Vercel / Netlify URL here

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/invoice-app.git
   cd invoice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add the app component**
   - Copy `InvoiceApp.jsx` into `src/App.jsx` (replace the existing file)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy to Vercel, Netlify, or any static host.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Architecture Explanation

The entire application lives in a single `App.jsx` file, structured around these key pieces:

### Component Structure

```
App (root)
├── Sidebar — navigation, theme toggle, avatar
├── InvoiceList — list view with filter and empty state
│   └── StatusBadge — reusable status pill (Draft/Pending/Paid)
├── InvoiceDetail — full invoice view with action bar
│   ├── StatusBadge
│   └── DeleteModal — confirmation dialog
└── InvoiceForm — slide-in drawer for create and edit
```

### State Management

All state is managed locally with React `useState` and `useEffect` hooks — no external state library is needed at this scale.

| State | Location | Purpose |
|---|---|---|
| `invoices` | App | Master list of all invoices |
| `dark` | App | Current theme preference |
| `filter` | App | Active status filters |
| `view` | App | Current page (list or detail) |
| `selectedId` | App | Which invoice is open |
| `showForm` | App | Whether the drawer is open |
| `editInvoice` | App | Invoice being edited (null for new) |

### Data Persistence

localStorage is used for two keys:
- `invoices` — the full invoice array, serialized as JSON
- `invoice-theme` — either `"dark"` or `"light"`

Both are initialized lazily inside `useState` so they only read from localStorage once on mount, and synced back on every change via `useEffect`.

### Invoice Data Shape

```js
{
  id: "#XM9141",
  status: "pending",          // "draft" | "pending" | "paid"
  billFrom: {
    street, city, postCode, country
  },
  clientName: "Alex Grim",
  clientEmail: "alexgrim@mail.com",
  clientStreet, clientCity, clientPostCode, clientCountry,
  invoiceDate: "2021-08-21",  // ISO date string
  paymentTerms: "Net 30 Days",
  paymentDue: "2021-09-20",   // computed on save
  description: "Graphic Design",
  items: [
    { id: 1, name: "Banner Design", qty: 1, price: 156.00 }
  ]
}
```

### Styling Approach

All styles are defined as plain JavaScript objects inside a `createStyles(dark)` function that takes the current theme as a parameter and returns the correct colors for light or dark mode. This avoids any CSS-in-JS library dependency while keeping styles co-located with components.

---

## Trade-offs

### Single file vs multi-file
The entire app is one file for portability and ease of submission. In a production codebase this would be split into `components/`, `hooks/`, and `utils/` folders. The component boundaries are clearly defined so refactoring is straightforward.

### localStorage vs backend
localStorage was chosen to meet the spec without requiring a server. The downside is data is browser-specific — it won't sync across devices or users. Switching to a backend (e.g. a Next.js API route with a database) would only require replacing the `useState` initializer and `useEffect` sync with `fetch` calls.

### Inline styles vs CSS modules
Inline styles via `createStyles(dark)` make theming simple and keep everything in one file. The trade-off is no media query support in JS objects, so responsive breakpoints are handled via a `<style>` tag injected at the top of the render. A production app would benefit from CSS modules or Tailwind for cleaner responsive handling.

### No routing library
Navigation between list and detail views is handled with a `view` state string instead of React Router. This keeps the bundle small but means the URL doesn't update when you open an invoice — the back button won't work as expected. Adding React Router would be a straightforward improvement.

### Form in a single component
The create and edit form share one `InvoiceForm` component, differentiated by whether an `invoice` prop is passed. This reduces duplication but makes the component moderately large. Splitting into `CreateInvoiceForm` and `EditInvoiceForm` would improve readability at the cost of some shared logic duplication.

---

## Accessibility Notes

- **Semantic HTML** — `<aside>`, `<button>`, `<label>`, `<input>`, `<select>` used throughout. No `<div>` click handlers on interactive elements.
- **Form labels** — every input has an associated `<label>` element.
- **Modal focus** — the delete confirmation modal uses `role="dialog"` and `aria-modal="true"`. The confirm button receives focus on open via `useRef`. ESC key closes the modal.
- **Drawer** — the invoice form drawer uses `role="dialog"`, `aria-modal="true"`, and `aria-label`. ESC key closes the drawer.
- **Keyboard navigation** — invoice list items are focusable with `tabIndex={0}` and respond to the Enter key.
- **ARIA labels** — all icon-only buttons have `aria-label` (e.g. "Remove item", "Go back to invoices", "Switch to dark mode").
- **Color contrast** — status badge colors (green for Paid, orange for Pending, grey for Draft) meet WCAG AA contrast ratios against their background fills in both light and dark mode.
- **Filter menu** — uses `role="menu"`, `role="menuitemcheckbox"`, and `aria-checked` so screen readers announce the checked state of each filter option.
- **Focus rings** — all interactive elements show a visible purple outline on `:focus-visible` for keyboard users.

---

## Improvements Beyond Requirements

### 1. Pre-loaded sample data
Seven realistic invoices are seeded on first load so the app is immediately useful to explore, rather than starting completely empty.

### 2. Payment due date auto-calculation
When saving an invoice, the payment due date is automatically computed from the invoice date and selected payment terms (Net 1, 7, 14, or 30 days). Users never need to enter it manually.

### 3. Send Invoice flow for drafts
Draft invoices show a **Send Invoice** button in the detail view that promotes them directly to Pending status, matching a real-world invoicing workflow.

### 4. Live item totals
Each line item in the form shows its calculated total (qty × price) updating in real time as the user types, and the grand total is visible at the bottom of the item list.

### 5. Smooth theme transition
The background and text colors transition smoothly over 300ms when toggling between light and dark mode, rather than snapping instantly.

### 6. Scrollable drawer with sticky actions
The create/edit form drawer scrolls independently while the action buttons (Discard, Save as Draft, Save & Send) stay fixed at the bottom, so they are always reachable regardless of how long the form is.

### 7. Custom scrollbar styling
The scrollbar inside the drawer is styled to match the app theme in both light and dark mode for a more polished feel.

### 8. Hover border on invoice cards
Invoice list cards highlight with a purple left-hand border on hover, providing clear visual feedback before clicking.# Invoice Management App

A fully responsive Invoice Management Application built with React. Users can create, view, edit, and delete invoices, save drafts, mark invoices as paid, filter by status, and toggle between light and dark mode — all with data persisted via localStorage.

---

## Live Demo

> https://invoice-management-app-stage-2.vercel.app/

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone 
   cd invoice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add the app component**
   - Copy `InvoiceApp.jsx` into `src/App.jsx` (replace the existing file)

4. **Start the development server**
   ```bash 
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy to Vercel, Netlify, or any static host.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Architecture Explanation

The entire application lives in a single `App.jsx` file, structured around these key pieces:

### Component Structure

```
App (root)
├── Sidebar — navigation, theme toggle, avatar
├── InvoiceList — list view with filter and empty state
│   └── StatusBadge — reusable status pill (Draft/Pending/Paid)
├── InvoiceDetail — full invoice view with action bar
│   ├── StatusBadge
│   └── DeleteModal — confirmation dialog
└── InvoiceForm — slide-in drawer for create and edit
```

### State Management

All state is managed locally with React `useState` and `useEffect` hooks — no external state library is needed at this scale.

| State | Location | Purpose |
|---|---|---|
| `invoices` | App | Master list of all invoices |
| `dark` | App | Current theme preference |
| `filter` | App | Active status filters |
| `view` | App | Current page (list or detail) |
| `selectedId` | App | Which invoice is open |
| `showForm` | App | Whether the drawer is open |
| `editInvoice` | App | Invoice being edited (null for new) |

### Data Persistence

localStorage is used for two keys:
- `invoices` — the full invoice array, serialized as JSON
- `invoice-theme` — either `"dark"` or `"light"`

Both are initialized lazily inside `useState` so they only read from localStorage once on mount, and synced back on every change via `useEffect`.

### Invoice Data Shape

```js
{
  id: "#XM9141",
  status: "pending",          // "draft" | "pending" | "paid"
  billFrom: {
    street, city, postCode, country
  },
  clientName: "Alex Grim",
  clientEmail: "alexgrim@mail.com",
  clientStreet, clientCity, clientPostCode, clientCountry,
  invoiceDate: "2021-08-21",  // ISO date string
  paymentTerms: "Net 30 Days",
  paymentDue: "2021-09-20",   // computed on save
  description: "Graphic Design",
  items: [
    { id: 1, name: "Banner Design", qty: 1, price: 156.00 }
  ]
}
```

### Styling Approach

All styles are defined as plain JavaScript objects inside a `createStyles(dark)` function that takes the current theme as a parameter and returns the correct colors for light or dark mode. This avoids any CSS-in-JS library dependency while keeping styles co-located with components.

---

## Trade-offs

### Single file vs multi-file
The entire app is one file for portability and ease of submission. In a production codebase this would be split into `components/`, `hooks/`, and `utils/` folders. The component boundaries are clearly defined so refactoring is straightforward.

### localStorage vs backend
localStorage was chosen to meet the spec without requiring a server. The downside is data is browser-specific — it won't sync across devices or users. Switching to a backend (e.g. a Next.js API route with a database) would only require replacing the `useState` initializer and `useEffect` sync with `fetch` calls.

### Inline styles vs CSS modules
Inline styles via `createStyles(dark)` make theming simple and keep everything in one file. The trade-off is no media query support in JS objects, so responsive breakpoints are handled via a `<style>` tag injected at the top of the render. A production app would benefit from CSS modules or Tailwind for cleaner responsive handling.

### No routing library
Navigation between list and detail views is handled with a `view` state string instead of React Router. This keeps the bundle small but means the URL doesn't update when you open an invoice — the back button won't work as expected. Adding React Router would be a straightforward improvement.

### Form in a single component
The create and edit form share one `InvoiceForm` component, differentiated by whether an `invoice` prop is passed. This reduces duplication but makes the component moderately large. Splitting into `CreateInvoiceForm` and `EditInvoiceForm` would improve readability at the cost of some shared logic duplication.

---

## Accessibility Notes

- **Semantic HTML** — `<aside>`, `<button>`, `<label>`, `<input>`, `<select>` used throughout. No `<div>` click handlers on interactive elements.
- **Form labels** — every input has an associated `<label>` element.
- **Modal focus** — the delete confirmation modal uses `role="dialog"` and `aria-modal="true"`. The confirm button receives focus on open via `useRef`. ESC key closes the modal.
- **Drawer** — the invoice form drawer uses `role="dialog"`, `aria-modal="true"`, and `aria-label`. ESC key closes the drawer.
- **Keyboard navigation** — invoice list items are focusable with `tabIndex={0}` and respond to the Enter key.
- **ARIA labels** — all icon-only buttons have `aria-label` (e.g. "Remove item", "Go back to invoices", "Switch to dark mode").
- **Color contrast** — status badge colors (green for Paid, orange for Pending, grey for Draft) meet WCAG AA contrast ratios against their background fills in both light and dark mode.
- **Filter menu** — uses `role="menu"`, `role="menuitemcheckbox"`, and `aria-checked` so screen readers announce the checked state of each filter option.
- **Focus rings** — all interactive elements show a visible purple outline on `:focus-visible` for keyboard users.

---

## Improvements Beyond Requirements

### 1. Pre-loaded sample data
Seven realistic invoices are seeded on first load so the app is immediately useful to explore, rather than starting completely empty.

### 2. Payment due date auto-calculation
When saving an invoice, the payment due date is automatically computed from the invoice date and selected payment terms (Net 1, 7, 14, or 30 days). Users never need to enter it manually.

### 3. Send Invoice flow for drafts
Draft invoices show a **Send Invoice** button in the detail view that promotes them directly to Pending status, matching a real-world invoicing workflow.

### 4. Live item totals
Each line item in the form shows its calculated total (qty × price) updating in real time as the user types, and the grand total is visible at the bottom of the item list.

### 5. Smooth theme transition
The background and text colors transition smoothly over 300ms when toggling between light and dark mode, rather than snapping instantly.

### 6. Scrollable drawer with sticky actions
The create/edit form drawer scrolls independently while the action buttons (Discard, Save as Draft, Save & Send) stay fixed at the bottom, so they are always reachable regardless of how long the form is.

### 7. Custom scrollbar styling
The scrollbar inside the drawer is styled to match the app theme in both light and dark mode for a more polished feel.

### 8. Hover border on invoice cards
Invoice list cards highlight with a purple left-hand border on hover, providing clear visual feedback before clicking.# Invoice Management App

A fully responsive Invoice Management Application built with React. Users can create, view, edit, and delete invoices, save drafts, mark invoices as paid, filter by status, and toggle between light and dark mode — all with data persisted via localStorage.

---

## Live Demo

> Add your Vercel / Netlify URL here

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/invoice-app.git
   cd invoice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add the app component**
   - Copy `InvoiceApp.jsx` into `src/App.jsx` (replace the existing file)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy to Vercel, Netlify, or any static host.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Architecture Explanation

The entire application lives in a single `App.jsx` file, structured around these key pieces:

### Component Structure

```
App (root)
├── Sidebar — navigation, theme toggle, avatar
├── InvoiceList — list view with filter and empty state
│   └── StatusBadge — reusable status pill (Draft/Pending/Paid)
├── InvoiceDetail — full invoice view with action bar
│   ├── StatusBadge
│   └── DeleteModal — confirmation dialog
└── InvoiceForm — slide-in drawer for create and edit
```

### State Management

All state is managed locally with React `useState` and `useEffect` hooks — no external state library is needed at this scale.

| State | Location | Purpose |
|---|---|---|
| `invoices` | App | Master list of all invoices |
| `dark` | App | Current theme preference |
| `filter` | App | Active status filters |
| `view` | App | Current page (list or detail) |
| `selectedId` | App | Which invoice is open |
| `showForm` | App | Whether the drawer is open |
| `editInvoice` | App | Invoice being edited (null for new) |

### Data Persistence

localStorage is used for two keys:
- `invoices` — the full invoice array, serialized as JSON
- `invoice-theme` — either `"dark"` or `"light"`

Both are initialized lazily inside `useState` so they only read from localStorage once on mount, and synced back on every change via `useEffect`.

### Invoice Data Shape

```js
{
  id: "#XM9141",
  status: "pending",          // "draft" | "pending" | "paid"
  billFrom: {
    street, city, postCode, country
  },
  clientName: "Alex Grim",
  clientEmail: "alexgrim@mail.com",
  clientStreet, clientCity, clientPostCode, clientCountry,
  invoiceDate: "2021-08-21",  // ISO date string
  paymentTerms: "Net 30 Days",
  paymentDue: "2021-09-20",   // computed on save
  description: "Graphic Design",
  items: [
    { id: 1, name: "Banner Design", qty: 1, price: 156.00 }
  ]
}
```

### Styling Approach

All styles are defined as plain JavaScript objects inside a `createStyles(dark)` function that takes the current theme as a parameter and returns the correct colors for light or dark mode. This avoids any CSS-in-JS library dependency while keeping styles co-located with components.

---

## Trade-offs

### Single file vs multi-file
The entire app is one file for portability and ease of submission. In a production codebase this would be split into `components/`, `hooks/`, and `utils/` folders. The component boundaries are clearly defined so refactoring is straightforward.

### localStorage vs backend
localStorage was chosen to meet the spec without requiring a server. The downside is data is browser-specific — it won't sync across devices or users. Switching to a backend (e.g. a Next.js API route with a database) would only require replacing the `useState` initializer and `useEffect` sync with `fetch` calls.

### Inline styles vs CSS modules
Inline styles via `createStyles(dark)` make theming simple and keep everything in one file. The trade-off is no media query support in JS objects, so responsive breakpoints are handled via a `<style>` tag injected at the top of the render. A production app would benefit from CSS modules or Tailwind for cleaner responsive handling.

### No routing library
Navigation between list and detail views is handled with a `view` state string instead of React Router. This keeps the bundle small but means the URL doesn't update when you open an invoice — the back button won't work as expected. Adding React Router would be a straightforward improvement.

### Form in a single component
The create and edit form share one `InvoiceForm` component, differentiated by whether an `invoice` prop is passed. This reduces duplication but makes the component moderately large. Splitting into `CreateInvoiceForm` and `EditInvoiceForm` would improve readability at the cost of some shared logic duplication.

---

## Accessibility Notes

- **Semantic HTML** — `<aside>`, `<button>`, `<label>`, `<input>`, `<select>` used throughout. No `<div>` click handlers on interactive elements.
- **Form labels** — every input has an associated `<label>` element.
- **Modal focus** — the delete confirmation modal uses `role="dialog"` and `aria-modal="true"`. The confirm button receives focus on open via `useRef`. ESC key closes the modal.
- **Drawer** — the invoice form drawer uses `role="dialog"`, `aria-modal="true"`, and `aria-label`. ESC key closes the drawer.
- **Keyboard navigation** — invoice list items are focusable with `tabIndex={0}` and respond to the Enter key.
- **ARIA labels** — all icon-only buttons have `aria-label` (e.g. "Remove item", "Go back to invoices", "Switch to dark mode").
- **Color contrast** — status badge colors (green for Paid, orange for Pending, grey for Draft) meet WCAG AA contrast ratios against their background fills in both light and dark mode.
- **Filter menu** — uses `role="menu"`, `role="menuitemcheckbox"`, and `aria-checked` so screen readers announce the checked state of each filter option.
- **Focus rings** — all interactive elements show a visible purple outline on `:focus-visible` for keyboard users.

---

## Improvements Beyond Requirements

### 1. Pre-loaded sample data
Seven realistic invoices are seeded on first load so the app is immediately useful to explore, rather than starting completely empty.

### 2. Payment due date auto-calculation
When saving an invoice, the payment due date is automatically computed from the invoice date and selected payment terms (Net 1, 7, 14, or 30 days). Users never need to enter it manually.

### 3. Send Invoice flow for drafts
Draft invoices show a **Send Invoice** button in the detail view that promotes them directly to Pending status, matching a real-world invoicing workflow.

### 4. Live item totals
Each line item in the form shows its calculated total (qty × price) updating in real time as the user types, and the grand total is visible at the bottom of the item list.

### 5. Smooth theme transition
The background and text colors transition smoothly over 300ms when toggling between light and dark mode, rather than snapping instantly.

### 6. Scrollable drawer with sticky actions
The create/edit form drawer scrolls independently while the action buttons (Discard, Save as Draft, Save & Send) stay fixed at the bottom, so they are always reachable regardless of how long the form is.

### 7. Custom scrollbar styling
The scrollbar inside the drawer is styled to match the app theme in both light and dark mode for a more polished feel.

### 8. Hover border on invoice cards
Invoice list cards highlight with a purple left-hand border on hover, providing clear visual feedback before clicking.
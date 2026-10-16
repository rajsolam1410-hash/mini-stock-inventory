// app.js - main logic (vanilla JS + Firebase Firestore modular SDK)
// IMPORTANT: Replace firebaseConfig with your project's config (see README)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/*
  ADD YOUR FIREBASE CONFIG HERE (replace the values)
  You get this from Firebase console > Project settings > SDK setup and configuration
*/
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const itemsCol = collection(db, "items");

// UI elements
const itemForm = document.getElementById("item-form");
const nameInput = document.getElementById("name");
const skuInput = document.getElementById("sku");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const descInput = document.getElementById("description");
const itemsTbody = document.getElementById("items-tbody");
const itemIdInput = document.getElementById("item-id");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

// State
let itemsCache = [];

// Add or update submit
itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = itemIdInput.value.trim();
  const data = {
    name: nameInput.value.trim(),
    sku: skuInput.value.trim(),
    quantity: Number(quantityInput.value),
    price: Number(priceInput.value),
    description: descInput.value.trim(),
    updatedAt: serverTimestamp()
  };

  try {
    if (id) {
      const ref = doc(db, "items", id);
      await updateDoc(ref, data);
      resetForm();
    } else {
      await addDoc(itemsCol, {
        ...data,
        createdAt: serverTimestamp()
      });
      resetForm();
    }
  } catch (err) {
    console.error("Error writing document:", err);
    alert("Error saving item. See console.");
  }
});

cancelBtn.addEventListener("click", () => resetForm());

// Real-time listener
const q = query(itemsCol, orderBy("name"));
onSnapshot(q, (snapshot) => {
  itemsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderItems(itemsCache);
});

function renderItems(items) {
  const search = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  const filtered = items.filter(it => {
    const matchSearch = !search ||
      (it.name && it.name.toLowerCase().includes(search)) ||
      (it.sku && it.sku.toLowerCase().includes(search));

    const matchFilter = filter === "all" || (filter === "low" && it.quantity <= 5);
    return matchSearch && matchFilter;
  });

  itemsTbody.innerHTML = "";

  if (filtered.length === 0) {
    itemsTbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted)">No items found</td></tr>`;
    return;
  }

  filtered.forEach(it => {
    const tr = document.createElement("tr");
    const qtyCell = `<div class="${it.quantity <= 5 ? 'qty-low' : ''}">${it.quantity}</div>`;

    tr.innerHTML = `
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.sku)}</td>
      <td>${qtyCell}</td>
      <td>$${Number(it.price).toFixed(2)}</td>
      <td>${escapeHtml(it.description || "")}</td>
      <td>
        <button class="btn-inline btn-edit" data-id="${it.id}">Edit</button>
        <button class="btn-inline btn-delete" data-id="${it.id}">Delete</button>
      </td>
    `;

    itemsTbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editItem(btn.dataset.id));
  });

  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteItem(btn.dataset.id));
  });
}

function editItem(id) {
  const it = itemsCache.find(x => x.id === id);
  if (!it) return alert("Item not found");

  itemIdInput.value = id;
  nameInput.value = it.name || "";
  skuInput.value = it.sku || "";
  quantityInput.value = it.quantity || 0;
  priceInput.value = it.price || 0;
  descInput.value = it.description || "";
  formTitle.textContent = "Edit Item";
  saveBtn.textContent = "Update Item";
}

async function deleteItem(id) {
  if (!confirm("Delete this item?")) return;

  try {
    await deleteDoc(doc(db, "items", id));
  } catch (err) {
    console.error(err);
    alert("Error deleting item");
  }
}

function resetForm() {
  itemForm.reset();
  itemIdInput.value = "";
  formTitle.textContent = "Add Item";
  saveBtn.textContent = "Add Item";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", () => renderItems(itemsCache));
filterSelect.addEventListener("change", () => renderItems(itemsCache));

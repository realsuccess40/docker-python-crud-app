const grid = document.querySelector("#record-grid");
const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const featuredTitle = document.querySelector("#featured-title");
const featuredDescription = document.querySelector("#featured-description");
const featuredCategory = document.querySelector("#featured-category");
const featuredIcon = document.querySelector("#featured-icon");
const featuredMeta = document.querySelector("#featured-meta");
const surpriseButton = document.querySelector("#surprise-button");
let searchTimer;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

async function loadCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Could not load record categories.");
  const categories = await response.json();
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  }
}

function recordCard(record) {
  return `
    <article class="record-card">
      <div class="card-top">
        <span class="category-tag">${escapeHtml(record.category)}</span>
        <span class="card-icon" aria-hidden="true">${escapeHtml(record.icon)}</span>
      </div>
      <h3>${escapeHtml(record.title)}</h3>
      <p>${escapeHtml(record.achievement)}</p>
      <div class="card-footer">
        <span class="card-holder">${escapeHtml(record.holder)}</span>
        <span>${escapeHtml(record.year)}</span>
      </div>
    </article>`;
}

async function loadRecords() {
  const parameters = new URLSearchParams();
  if (searchInput.value.trim()) parameters.set("q", searchInput.value.trim());
  if (categorySelect.value) parameters.set("category", categorySelect.value);
  const response = await fetch(`/api/records?${parameters.toString()}`);
  if (!response.ok) throw new Error("Could not load records.");
  const records = await response.json();
  grid.innerHTML = records.map(recordCard).join("");
  resultCount.textContent = `${records.length} ${records.length === 1 ? "record" : "records"}`;
  emptyState.querySelector("h3").textContent = "No records found";
  emptyState.querySelector("p").textContent = "Try a different search or choose another category.";
  emptyState.hidden = records.length !== 0;
  grid.hidden = records.length === 0;
}

async function showRandomRecord() {
  surpriseButton.disabled = true;
  try {
    const response = await fetch("/api/records/random");
    if (!response.ok) throw new Error("Could not find a random record.");
    const record = await response.json();
    featuredIcon.textContent = record.icon;
    featuredCategory.textContent = record.category;
    featuredTitle.textContent = record.title;
    featuredDescription.textContent = record.achievement;
    featuredMeta.textContent = `${record.holder} · ${record.year} · ${record.location}`;
  } catch (error) {
    featuredTitle.textContent = "Something went wrong.";
    featuredDescription.textContent = error.message;
  } finally {
    surpriseButton.disabled = false;
  }
}

searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    loadRecords().catch(showLoadError);
  }, 180);
});

categorySelect.addEventListener("change", () => {
  loadRecords().catch(showLoadError);
});

document.querySelector("#clear-search").addEventListener("click", () => {
  searchInput.value = "";
  categorySelect.value = "";
  loadRecords().catch(showLoadError);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    loadRecords().catch(showLoadError);
  }
});

function showLoadError(error) {
  grid.hidden = true;
  emptyState.hidden = false;
  emptyState.querySelector("h3").textContent = "Couldn't load records";
  emptyState.querySelector("p").textContent = error.message;
}

surpriseButton.addEventListener("click", showRandomRecord);
Promise.all([loadCategories(), loadRecords()]).catch(showLoadError);

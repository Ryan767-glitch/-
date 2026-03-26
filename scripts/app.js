const resultList = document.getElementById("resultList");
const resultMeta = document.getElementById("resultMeta");
const searchBtn = document.getElementById("searchBtn");

const fields = {
  region: document.getElementById("region"),
  companySize: document.getElementById("companySize"),
  purpose: document.getElementById("purpose"),
  amount: document.getElementById("amount"),
  status: document.getElementById("status")
};

const amountOrder = ["lt1m", "1m_10m", "10m_50m", "gt50m"];

function amountMatch(filterValue, itemValue) {
  if (filterValue === "any" || itemValue === "any") return true;
  return filterValue === itemValue;
}

function fieldMatch(filterValue, values) {
  if (filterValue === "any") return true;
  return values.includes(filterValue);
}

function statusMatch(filterValue, itemStatus) {
  if (filterValue === "any" || filterValue === "all") return true;
  return filterValue === itemStatus;
}

function score(item, criteria) {
  let point = 0;
  if (criteria.region !== "any" && item.region.includes(criteria.region)) point += 3;
  if (criteria.companySize !== "any" && item.companySize.includes(criteria.companySize)) point += 2;
  if (criteria.purpose !== "any" && item.purpose.includes(criteria.purpose)) point += 4;
  if (criteria.amount !== "any" && amountMatch(criteria.amount, item.amountBand)) point += 2;
  if (criteria.status !== "any" && criteria.status !== "all" && item.status === criteria.status) point += 1;

  if (item.id === "jgrants_local" && criteria.region !== "national") point += 1;
  return point;
}

function render(items, criteria) {
  resultList.innerHTML = "";
  if (items.length === 0) {
    resultMeta.innerHTML = "<p>一致する制度が見つかりませんでした。条件を広げて再検索してください。</p>";
    return;
  }

  resultMeta.innerHTML = `<p><strong>${items.length}件</strong>の候補が見つかりました。スコア順に表示しています。</p>`;

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "result-item";

    li.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.summary}</p>
      <div class="tags">
        ${item.region.map((v) => `<span class="tag">${v}</span>`).join("")}
        ${item.purpose.map((v) => `<span class="tag">${v}</span>`).join("")}
        <span class="tag">status:${item.status}</span>
      </div>
      <p><small>根拠: ${item.source}</small></p>
      <a href="${item.officialUrl}" target="_blank" rel="noopener noreferrer">公式ページを開く</a>
    `;

    resultList.appendChild(li);
  }
}

async function loadData() {
  const response = await fetch("data/subsidies.json");
  return response.json();
}

async function runSearch() {
  const data = await loadData();
  const criteria = {
    region: fields.region.value,
    companySize: fields.companySize.value,
    purpose: fields.purpose.value,
    amount: fields.amount.value,
    status: fields.status.value
  };

  const filtered = data
    .filter((item) => fieldMatch(criteria.region, item.region))
    .filter((item) => fieldMatch(criteria.companySize, item.companySize))
    .filter((item) => fieldMatch(criteria.purpose, item.purpose))
    .filter((item) => amountMatch(criteria.amount, item.amountBand))
    .filter((item) => statusMatch(criteria.status, item.status))
    .map((item) => ({ ...item, matchScore: score(item, criteria) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  render(filtered, criteria);
}

searchBtn.addEventListener("click", runSearch);
runSearch();

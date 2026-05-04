const sampleProducts = [
  { country: "印尼", platform: "Shopee", category: "小家电", product: "便携榨汁机", price: 169, reviews: 1240, rating: 4.6, selling: "便携,大容量,USB充电", negative: "物流慢,噪音,电池" },
  { country: "印尼", platform: "TikTok Shop", category: "小家电", product: "便携榨汁机", price: 149, reviews: 980, rating: 4.4, selling: "低价,视频展示,易清洗", negative: "售后,物流破损" },
  { country: "越南", platform: "Shopee", category: "小家电", product: "便携榨汁机", price: 189, reviews: 760, rating: 4.7, selling: "宿舍,办公室,易清洗", negative: "容量小,噪音" },
  { country: "越南", platform: "TikTok Shop", category: "小家电", product: "便携榨汁机", price: 179, reviews: 640, rating: 4.6, selling: "短视频,便携,高颜值", negative: "电池,清洗" },
  { country: "泰国", platform: "Shopee", category: "小家电", product: "便携榨汁机", price: 209, reviews: 520, rating: 4.5, selling: "生活方式,厨房,健康", negative: "价格,噪音" },
  { country: "泰国", platform: "TikTok Shop", category: "小家电", product: "便携榨汁机", price: 199, reviews: 880, rating: 4.6, selling: "达人推荐,健康,易清洗", negative: "物流,售后" },
  { country: "印尼", platform: "Shopee", category: "美妆", product: "补水面膜", price: 39, reviews: 3200, rating: 4.5, selling: "补水,温和,清真", negative: "刺激,物流破损" },
  { country: "印尼", platform: "TikTok Shop", category: "美妆", product: "补水面膜", price: 35, reviews: 2800, rating: 4.4, selling: "达人,补水,敏感肌", negative: "香味,效果不明显" },
  { country: "越南", platform: "Shopee", category: "美妆", product: "补水面膜", price: 42, reviews: 1900, rating: 4.7, selling: "补水,亮肤,韩系", negative: "精华少,价格" },
  { country: "越南", platform: "TikTok Shop", category: "美妆", product: "补水面膜", price: 45, reviews: 2100, rating: 4.6, selling: "亮肤,痘痘肌,短视频", negative: "刺激,包装" },
  { country: "泰国", platform: "Shopee", category: "美妆", product: "补水面膜", price: 49, reviews: 1500, rating: 4.5, selling: "晒后修复,清爽,补水", negative: "黏腻,价格" },
  { country: "泰国", platform: "TikTok Shop", category: "美妆", product: "补水面膜", price: 52, reviews: 1700, rating: 4.6, selling: "晒后修复,达人,清爽", negative: "香味,物流" }
];

const countryProfiles = {
  "印尼": { market: 86, platform: 78, culture: 62, compliance: 64, logistics: 55, note: "市场规模大，但岛屿物流、清真/本地化和平台竞争需要优先验证。", angle: "人口与电商规模", barrier: "群岛履约、清真认证、本地客服" },
  "越南": { market: 78, platform: 80, culture: 74, compliance: 72, logistics: 76, note: "年轻消费群体活跃，履约复杂度相对可控，适合首轮测试。", angle: "年轻消费与供应链邻近", barrier: "价格敏感、平台竞品密集" },
  "泰国": { market: 74, platform: 82, culture: 78, compliance: 76, logistics: 72, note: "内容营销和达人生态较成熟，适合测试品牌化表达。", angle: "内容电商与生活方式消费", barrier: "本地达人适配、品牌调性" },
  "马来西亚": { market: 70, platform: 74, culture: 66, compliance: 68, logistics: 74, note: "多族群和清真消费重要，适合更明确的合规与语言策略。", angle: "多语市场与区域跳板", barrier: "多族群沟通、合规标签" }
};

const sourceCatalog = [
  { name: "Shopee / TikTok Shop", status: "可接入", use: "竞品价格、评论、内容卖点、销量 proxy" },
  { name: "World Bank / ASEANStats", status: "可接入", use: "宏观市场、人口、消费与数字经济指标" },
  { name: "UN Comtrade", status: "可接入", use: "品类贸易流向、进口依赖与供应链位置" },
  { name: "新闻与政策源", status: "可扩展", use: "监管变化、平台政策、社会舆情风险" },
  { name: "企业销售数据", status: "待上传", use: "SKU 表现、毛利、库存、复购与渠道表现" }
];

let activeData = sampleProducts;

function getInputs() {
  return {
    companyType: document.querySelector("#companyType").value,
    category: document.querySelector("#category").value,
    product: document.querySelector("#product").value.trim(),
    entryMode: document.querySelector("#entryMode").value,
    taskGoal: document.querySelector("#taskGoal").value,
    priceTier: document.querySelector("#priceTier").value,
    dataMaturity: document.querySelector("#dataMaturity").value,
    budget: document.querySelector("#budget").value,
    countries: [...document.querySelectorAll("#countryChecks input:checked")].map((item) => item.value)
  };
}

function keywordMode(items, field) {
  const counts = {};
  items.flatMap((item) => String(item[field] || "").split(",")).forEach((word) => {
    const key = word.trim();
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
}

function scoreCountry(country, rows, inputs) {
  const profile = countryProfiles[country] || countryProfiles["越南"];
  const countryRows = rows.filter((row) => row.country === country);
  const avgReviews = countryRows.reduce((sum, row) => sum + Number(row.reviews || 0), 0) / Math.max(countryRows.length, 1);
  const competitionPenalty = Math.min(18, countryRows.length * 3 + avgReviews / 500);
  const resourceFit = inputs.budget === "低" ? 62 : inputs.budget === "高" ? 82 : 74;
  const platformFit = inputs.entryMode.includes("TikTok") ? profile.platform : profile.platform - 3;
  const dataBoost = inputs.dataMaturity.includes("企业销售") ? 4 : inputs.dataMaturity.includes("API") ? 2 : 0;

  const score = Math.round(
    profile.market * 0.24 +
      platformFit * 0.2 +
      profile.culture * 0.16 +
      profile.compliance * 0.14 +
      profile.logistics * 0.14 +
      resourceFit * 0.12 -
      competitionPenalty * 0.18 +
      dataBoost
  );

  return {
    country,
    score: Math.max(45, Math.min(92, score)),
    rows: countryRows,
    note: profile.note,
    angle: profile.angle,
    barrier: profile.barrier
  };
}

function analyze() {
  const inputs = getInputs();
  if (!inputs.product || inputs.countries.length === 0) {
    alert("请至少填写具体产品，并选择一个目标国家。");
    return;
  }

  const rows = activeData.filter((row) => inputs.countries.includes(row.country) && row.category === inputs.category);
  const usedRows = rows.length ? rows : activeData.filter((row) => inputs.countries.includes(row.country));
  const scores = inputs.countries.map((country) => scoreCountry(country, usedRows, inputs)).sort((a, b) => b.score - a.score);
  const top = scores[0];
  const avgPrice = Math.round(usedRows.reduce((sum, row) => sum + Number(row.price || 0), 0) / Math.max(usedRows.length, 1));
  const avgReviews = Math.round(usedRows.reduce((sum, row) => sum + Number(row.reviews || 0), 0) / Math.max(usedRows.length, 1));
  const topKeyword = keywordMode(usedRows, "selling");

  renderDashboard(inputs, usedRows, scores, { avgPrice, avgReviews, topKeyword });
  renderEvidence(inputs, usedRows);
  renderStrategy(inputs, scores, { avgPrice, avgReviews, topKeyword, count: usedRows.length });
  renderRiskMatrix(scores);
  renderReport(inputs, scores, { avgPrice, avgReviews, topKeyword, count: usedRows.length });

  document.querySelector("#summaryTitle").textContent = `${top.country}优先进入，${scores[1]?.country || "其他市场"}作为对比验证`;
  document.querySelector("#summaryText").textContent = `本次目标是“${inputs.taskGoal}”。${top.country}当前综合适配度最高，建议先验证价格带、竞品密度、本地化卖点和履约条件，再决定是否扩大投入。`;
  document.querySelector("#topScore").textContent = top.score;
}

function renderDashboard(inputs, rows, scores, meta) {
  document.querySelector("#countryScores").innerHTML = scores.map((item) => `
    <div class="score-row">
      <strong>${item.country}</strong>
      <div class="bar"><span style="width:${item.score}%"></span></div>
      <em>${item.score}</em>
      <small>${item.angle}</small>
    </div>
  `).join("");

  document.querySelector("#decisionTags").innerHTML = [
    inputs.taskGoal,
    inputs.dataMaturity,
    `${inputs.entryMode}`,
    `${inputs.priceTier}价格带`
  ].map((item) => `<span>${item}</span>`).join("");

  document.querySelector("#pipelineStrip").innerHTML = [
    ["01", "识别任务", `把“${inputs.product}能去哪国卖”转成可比较问题`],
    ["02", "检查数据", `${inputs.dataMaturity}支撑当前判断，并标出缺口`],
    ["03", "多国排序", `对${inputs.countries.join("、")}做机会与风险评分`],
    ["04", "生成交付", "输出报告、风险矩阵和30天验证计划"]
  ].map(([step, title, text]) => `
    <div class="pipeline-step">
      <span>${step}</span>
      <strong>${title}</strong>
      <p>${text}</p>
    </div>
  `).join("");

  document.querySelector("#sampleMeta").textContent = `${rows.length} 条商品样本`;
  document.querySelector("#avgPrice").textContent = meta.avgPrice ? `${meta.avgPrice}` : "-";
  document.querySelector("#avgReviews").textContent = meta.avgReviews ? `${meta.avgReviews}` : "-";
  document.querySelector("#competitorCount").textContent = rows.length;
  document.querySelector("#topKeyword").textContent = meta.topKeyword;

  const insights = [
    `${scores[0].country}适合优先验证，但仍需补充平台真实竞品数据。`,
    inputs.category === "美妆" ? "美妆品类需关注清真认证、肤质需求、气候和本地达人话术。" : "小家电品类需关注物流破损、售后、噪音和使用场景展示。",
    `当前进入方式为${inputs.entryMode}，报告会优先关注平台价格带和内容转化。`,
    `${inputs.dataMaturity === "样本数据" ? "当前版本适合课堂演示和前期初筛，真实决策仍需 API 或企业数据校验。" : "数据成熟度提升后，可把结论从定性建议推进到可复核的经营指标。"}`
  ];
  document.querySelector("#localizationList").innerHTML = insights.map((item) => `<li>${item}</li>`).join("");

  const gaps = [
    { title: "平台销量 proxy", text: "补充商品排名、评论增速、达人带货频率，避免只看价格和评论存量。" },
    { title: "合规与标签", text: inputs.category === "美妆" ? "确认化妆品备案、成分限制、清真认证与功效表达边界。" : "确认插头标准、认证要求、售后退换与物流破损责任。" },
    { title: "企业约束", text: "接入毛利、库存、交付周期和客服能力，判断推荐国家是否真的适合该企业。" }
  ];
  document.querySelector("#dataGaps").innerHTML = gaps.map((item) => `
    <div class="gap-card">
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </div>
  `).join("");
}

function renderEvidence(inputs, rows) {
  document.querySelector("#sampleRows").innerHTML = rows.map((row) => `
    <tr>
      <td>${row.country}</td>
      <td>${row.platform}</td>
      <td>${row.price}</td>
      <td>${row.rating}</td>
      <td>${row.reviews}</td>
      <td>${row.selling}</td>
      <td>${row.negative}</td>
    </tr>
  `).join("");

  document.querySelector("#sourceStatus").innerHTML = sourceCatalog.map((source) => {
    const active = inputs.dataMaturity === "样本数据"
      ? source.name.includes("Shopee") || source.name.includes("World Bank")
      : inputs.dataMaturity === "平台 API"
        ? !source.name.includes("企业销售")
        : true;
    return `
      <div class="source-item ${active ? "active" : ""}">
        <div>
          <strong>${source.name}</strong>
          <p>${source.use}</p>
        </div>
        <span>${active ? source.status : "后续"}</span>
      </div>
    `;
  }).join("");
}

function renderStrategy(inputs, scores, meta) {
  const top = scores[0];
  const second = scores[1];
  const steps = [
    { title: "首轮国家选择", text: `优先选择${top.country}，用${second?.country || "备选国家"}作为对照样本，避免单一国家结论过拟合。` },
    { title: "平台验证", text: `围绕${inputs.entryMode}采集价格、评论、达人内容和搜索词，验证${meta.topKeyword}是否真是有效卖点。` },
    { title: "产品本地化", text: inputs.category === "美妆" ? "比较肤质、气候、功效表达与认证要求，形成版本化卖点。" : "比较使用场景、插头/电压、破损率、保修与清洁便利性。" },
    { title: "投放与复盘", text: "用30天小预算测试点击、转化、评论关键词和退货原因，再决定扩大市场或调整国家优先级。" }
  ];

  document.querySelector("#strategySteps").innerHTML = steps.map((step, index) => `
    <div class="timeline-item">
      <span>${index + 1}</span>
      <div>
        <strong>${step.title}</strong>
        <p>${step.text}</p>
      </div>
    </div>
  `).join("");

  const actions = [
    { title: "课堂可展示", text: "切换品类、国家和数据成熟度，展示结论如何变化。" },
    { title: "期末可扩展", text: "接入 API 后把样本表替换成真实平台数据，报告框架不变。" },
    { title: "企业可使用", text: "上传企业 CSV 后，把国家推荐和 SKU 策略绑定到实际资源。" }
  ];
  document.querySelector("#actionCards").innerHTML = actions.map((item) => `
    <div class="action-card">
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </div>
  `).join("");
}

function riskLevel(score, type) {
  if (type === "竞争风险") return score.rows.length >= 2 ? "高" : "中";
  if (type === "物流风险") return score.country === "印尼" ? "高" : "中";
  if (type === "文化适配") return score.country === "印尼" ? "中" : "中低";
  if (type === "合规风险") return score.country === "印尼" || score.country === "马来西亚" ? "中" : "中低";
  return "中";
}

function riskClass(level) {
  if (level === "高") return "high";
  if (level === "中") return "medium";
  return "low";
}

function renderRiskMatrix(scores) {
  const types = ["竞争风险", "物流风险", "文化适配", "合规风险"];
  const header = [`<div class="risk-cell header">风险类型</div>`, ...scores.map((s) => `<div class="risk-cell header">${s.country}</div>`)].join("");
  const body = types.map((type) => {
    return `<div class="risk-cell header">${type}</div>${scores.map((score) => {
      const level = riskLevel(score, type);
      return `<div class="risk-cell ${riskClass(level)}">${level}</div>`;
    }).join("")}`;
  }).join("");
  document.querySelector("#riskMatrix").style.gridTemplateColumns = `170px repeat(${scores.length}, minmax(140px, 1fr))`;
  document.querySelector("#riskMatrix").innerHTML = header + body;
  document.querySelector("#riskNotes").innerHTML = scores.map((score) => `
    <div>
      <strong>${score.country}</strong>
      <p>主要机会：${score.angle}。优先验证：${score.barrier}。</p>
    </div>
  `).join("");
}

function renderReport(inputs, scores, meta) {
  const top = scores[0];
  const text = `《${inputs.product}进入东南亚市场初筛报告》

一、执行摘要
当前企业类型为${inputs.companyType}，任务目标为“${inputs.taskGoal}”，计划以${inputs.entryMode}进入${inputs.countries.join("、")}市场。基于${inputs.dataMaturity}、内置平台样本和国别知识卡，${top.country}综合适配度最高，建议作为首轮测试市场。

二、国别比较
${scores.map((item) => `${item.country}：综合评分 ${item.score}。机会是${item.angle}，需优先验证${item.barrier}。${item.note}`).join("\n")}

三、平台样本观察
当前样本共 ${meta.count} 条，平均价格 ${meta.avgPrice}，平均评论数 ${meta.avgReviews}，高频卖点为“${meta.topKeyword}”。这些数据只能作为前期初筛依据，后续需要补充更大样本和真实平台数据。

四、进入策略
建议先用 ${inputs.entryMode} 测试价格带、卖点表达和评论反馈。产品策略应围绕本地使用场景展开，避免直接复制国内卖点。若首轮转化和评论反馈较好，再进一步验证本地仓储、售后和合规条件。

五、数据缺口
下一阶段应优先补充平台销量 proxy、达人内容表现、合规要求、企业毛利与履约能力。只有把外部市场数据和企业内部约束合并，智能体输出才不会停留在一般性建议。

六、30天调研计划
第1周：收集目标国家平台竞品价格、评论、销量 proxy 和卖点。
第2周：分析消费者好评和差评关键词，识别产品改进方向。
第3周：补充物流、认证、广告规则和本地合作方资料。
第4周：形成国家优先级、SKU 组合和首轮投放建议。
`;
  document.querySelector("#reportText").textContent = text;
}

function parseCsv(text) {
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const headers = head.split(",").map((item) => item.trim());
  return lines.map((line) => {
    const values = line.split(",").map((item) => item.trim());
    return headers.reduce((obj, key, index) => {
      obj[key] = values[index];
      return obj;
    }, {});
  });
}

document.querySelector("#generateBtn").addEventListener("click", analyze);

document.querySelector("#category").addEventListener("change", (event) => {
  document.querySelector("#product").value = event.target.value === "美妆" ? "补水面膜" : "便携榨汁机";
});

document.querySelector("#csvUpload").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  activeData = parseCsv(text);
  document.querySelector("#dataHint").textContent = `当前使用上传数据：${file.name}，共 ${activeData.length} 条。`;
  document.querySelector("#useSample").classList.remove("active");
});

document.querySelector("#useSample").addEventListener("click", () => {
  activeData = sampleProducts;
  document.querySelector("#dataHint").textContent = "当前使用内置样本数据：小家电与美妆平台样本。";
  document.querySelector("#useSample").classList.add("active");
});

document.querySelector("#copyReport").addEventListener("click", async () => {
  await navigator.clipboard.writeText(document.querySelector("#reportText").textContent);
  document.querySelector("#copyReport").textContent = "已复制";
  setTimeout(() => (document.querySelector("#copyReport").textContent = "复制报告"), 1200);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

analyze();

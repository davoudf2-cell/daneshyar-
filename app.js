/* =========================================================
   اپلیکیشن حسابداری دانشیار
   app.js
   ========================================================= */

let transactions = JSON.parse(
  localStorage.getItem("daneshyar_transactions") || "[]"
);

/* =========================================================
   ابزارهای عمومی
   ========================================================= */

function numberValue(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function formatMoney(value) {
  return new Intl.NumberFormat("fa-IR").format(
    Math.round(numberValue(value))
  );
}

function saveData() {
  localStorage.setItem(
    "daneshyar_transactions",
    JSON.stringify(transactions)
  );
}

function getAccountName(account) {
  return String(account || "").trim().toLowerCase();
}

/* =========================================================
   اطلاعات شرکت
   ========================================================= */

function saveCompany() {
  const companyName =
    document.getElementById("companyName").value;

  const fiscalYear =
    document.getElementById("fiscalYear").value;

  const currency =
    document.getElementById("currency").value;

  localStorage.setItem(
    "daneshyar_company",
    JSON.stringify({
      companyName,
      fiscalYear,
      currency
    })
  );

  alert("اطلاعات شرکت با موفقیت ذخیره شد.");
}

function loadCompany() {
  const data = JSON.parse(
    localStorage.getItem("daneshyar_company") || "null"
  );

  if (!data) return;

  document.getElementById("companyName").value =
    data.companyName || "شرکت فرضی دانشیار";

  document.getElementById("fiscalYear").value =
    data.fiscalYear || "1405";

  document.getElementById("currency").value =
    data.currency || "ریال";
}

/* =========================================================
   نمایش بخش‌ها
   ========================================================= */

function showSection(id, button) {

  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".menu button").forEach(btn => {
    btn.classList.remove("active");
  });

  const section = document.getElementById(id);

  if (section) {
    section.classList.add("active");
  }

  if (button) {
    button.classList.add("active");
  }
}

/* =========================================================
   ثبت تراکنش
   ========================================================= */

function addTransaction() {

  const date =
    document.getElementById("date").value.trim();

  const description =
    document.getElementById("description").value.trim();

  const account =
    document.getElementById("account").value.trim();

  const debit =
    numberValue(document.getElementById("debit").value);

  const credit =
    numberValue(document.getElementById("credit").value);

  if (!account) {
    alert("نام حساب را وارد کنید.");
    return;
  }

  if (debit === 0 && credit === 0) {
    alert("مبلغ بدهکار یا بستانکار را وارد کنید.");
    return;
  }

  transactions.push({
    id: Date.now(),
    date: date || "-",
    description: description || "-",
    account,
    debit,
    credit
  });

  saveData();

  document.getElementById("date").value = "";
  document.getElementById("description").value = "";
  document.getElementById("account").value = "";
  document.getElementById("debit").value = "";
  document.getElementById("credit").value = "";

  renderTransactions();
  calculateAll();
}

/* =========================================================
   نمایش تراکنش‌ها
   ========================================================= */

function renderTransactions() {

  const table =
    document.getElementById("transactionTable");

  if (!table) return;

  table.innerHTML = "";

  transactions.forEach((t, index) => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.account}</td>
      <td>${formatMoney(t.debit)}</td>
      <td>${formatMoney(t.credit)}</td>
      <td>
        <button
          class="btn-red"
          onclick="deleteTransaction(${t.id})">
          حذف
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}

/* =========================================================
   حذف تراکنش
   ========================================================= */

function deleteTransaction(id) {

  if (!confirm("آیا از حذف این تراکنش مطمئن هستید؟")) {
    return;
  }

  transactions =
    transactions.filter(t => t.id !== id);

  saveData();

  renderTransactions();
  calculateAll();
}

/* =========================================================
   دفتر حساب‌ها
   ========================================================= */

function getAccounts() {

  const accounts = {};

  transactions.forEach(t => {

    const name = t.account;

    if (!accounts[name]) {
      accounts[name] = {
        debit: 0,
        credit: 0
      };
    }

    accounts[name].debit += numberValue(t.debit);
    accounts[name].credit += numberValue(t.credit);
  });

  return accounts;
}

/* =========================================================
   تشخیص نوع حساب
   ========================================================= */

function accountType(account) {

  const a = getAccountName(account);

  /* دارایی */
  if (
    a.includes("صندوق") ||
    a.includes("بانک") ||
    a.includes("وجه نقد") ||
    a.includes("موجودی نقد") ||
    a.includes("حساب دریافتنی") ||
    a.includes("دریافتنی") ||
    a.includes("موجودی کالا") ||
    a.includes("مواد") ||
    a.includes("ماشین آلات") ||
    a.includes("ماشین‌آلات") ||
    a.includes("تجهیزات") ||
    a.includes("ساختمان") ||
    a.includes("زمین") ||
    a.includes("وسایل") ||
    a.includes("سرمایه گذاری") ||
    a.includes("سرمایه‌گذاری")
  ) {
    return "asset";
  }

  /* بدهی */
  if (
    a.includes("حساب پرداختنی") ||
    a.includes("پرداختنی") ||
    a.includes("وام") ||
    a.includes("تسهیلات") ||
    a.includes("بستانکاران") ||
    a.includes("مالیات پرداختنی") ||
    a.includes("حقوق پرداختنی")
  ) {
    return "liability";
  }

  /* حقوق مالکانه */
  if (
    a.includes("سرمایه") ||
    a.includes("اندوخته") ||
    a.includes("سود انباشته") ||
    a.includes("حقوق مالکانه")
  ) {
    return "equity";
  }

  /* درآمد */
  if (
    a.includes("فروش") ||
    a.includes("درآمد") ||
    a.includes("درآمد عملیاتی")
  ) {
    return "revenue";
  }

  /* هزینه */
  if (
    a.includes("هزینه") ||
    a.includes("اجاره") ||
    a.includes("حقوق و دستمزد") ||
    a.includes("دستمزد") ||
    a.includes("حقوق") ||
    a.includes("آب و برق") ||
    a.includes("برق") ||
    a.includes("استهلاک") ||
    a.includes("تبلیغات") ||
    a.includes("بیمه")
  ) {
    return "expense";
  }

  return "unknown";
}

/* =========================================================
   مانده حساب
   ========================================================= */

function accountBalance(accountData, type) {

  const debit = numberValue(accountData.debit);
  const credit = numberValue(accountData.credit);

  if (type === "asset" || type === "expense") {
    return debit - credit;
  }

  return credit - debit;
}

/* =========================================================
   محاسبه اطلاعات مالی
   ========================================================= */

function calculateFinancialData() {

  const accounts = getAccounts();

  let assets = 0;
  let liabilities = 0;
  let equity = 0;
  let revenue = 0;
  let expenses = 0;

  const assetAccounts = [];
  const liabilityAccounts = [];
  const equityAccounts = [];
  const revenueAccounts = [];
  const expenseAccounts = [];

  Object.keys(accounts).forEach(name => {

    const data = accounts[name];
    const type = accountType(name);

    const balance =
      accountBalance(data, type);

    if (type === "asset") {
      assets += balance;

      assetAccounts.push({
        name,
        balance
      });
    }

    else if (type === "liability") {
      liabilities += balance;

      liabilityAccounts.push({
        name,
        balance
      });
    }

    else if (type === "equity") {
      equity += balance;

      equityAccounts.push({
        name,
        balance
      });
    }

    else if (type === "revenue") {
      revenue += balance;

      revenueAccounts.push({
        name,
        balance
      });
    }

    else if (type === "expense") {
      expenses += balance;

      expenseAccounts.push({
        name,
        balance
      });
    }
  });

  const netProfit =
    revenue - expenses;

  return {
    accounts,
    assets,
    liabilities,
    equity,
    revenue,
    expenses,
    netProfit,
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    revenueAccounts,
    expenseAccounts
  };
}

/* =========================================================
   صورت سود و زیان
   ========================================================= */

function renderIncomeStatement(data) {

  const table =
    document.getElementById("incomeTable");

  if (!table) return;

  table.innerHTML = "";

  data.revenueAccounts.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${formatMoney(item.balance)}</td>
      </tr>
    `;
  });

  table.innerHTML += `
    <tr>
      <th>جمع درآمدها</th>
      <th>${formatMoney(data.revenue)}</th>
    </tr>
  `;

  data.expenseAccounts.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>(${formatMoney(item.balance)})</td>
      </tr>
    `;
  });

  table.innerHTML += `
    <tr>
      <th>جمع هزینه‌ها</th>
      <th>(${formatMoney(data.expenses)})</th>
    </tr>

    <tr>
      <th>سود / زیان خالص</th>
      <th>${formatMoney(data.netProfit)}</th>
    </tr>
  `;
}

/* =========================================================
   ترازنامه
   ========================================================= */

function renderBalanceSheet(data) {

  const table =
    document.getElementById("balanceTable");

  if (!table) return;

  table.innerHTML = "";

  table.innerHTML += `
    <tr>
      <th colspan="2">دارایی‌ها</th>
    </tr>
  `;

  data.assetAccounts.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${formatMoney(item.balance)}</td>
      </tr>
    `;
  });

  table.innerHTML += `
    <tr>
      <th>جمع دارایی‌ها</th>
      <th>${formatMoney(data.assets)}</th>
    </tr>

    <tr>
      <th colspan="2">بدهی‌ها</th>
    </tr>
  `;

  data.liabilityAccounts.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${formatMoney(item.balance)}</td>
      </tr>
    `;
  });

  table.innerHTML += `
    <tr>
      <th>جمع بدهی‌ها</th>
      <th>${formatMoney(data.liabilities)}</th>
    </tr>

    <tr>
      <th colspan="2">حقوق مالکانه</th>
    </tr>
  `;

  data.equityAccounts.forEach(item => {

    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${formatMoney(item.balance)}</td>
      </tr>
    `;
  });

  table.innerHTML += `
    <tr>
      <td>سود / زیان خالص</td>
      <td>${formatMoney(data.netProfit)}</td>
    </tr>

    <tr>
      <th>جمع حقوق مالکانه</th>
      <th>${formatMoney(
        data.equity + data.netProfit
      )}</th>
    </tr>

    <tr>
      <th>جمع بدهی + حقوق مالکانه</th>
      <th>${formatMoney(
        data.liabilities +
        data.equity +
        data.netProfit
      )}</th>
    </tr>
  `;
}

/* =========================================================
   جریان وجوه نقد
   ========================================================= */

function renderCashFlow(data) {

  const table =
    document.getElementById("cashflowTable");

  if (!table) return;

  let operating = 0;
  let investing = 0;
  let financing = 0;

  transactions.forEach(t => {

    const type = accountType(t.account);

    const cashEffect =
      numberValue(t.debit) -
      numberValue(t.credit);

    /*
      این نسخه اولیه جریان نقد را بر اساس
      نوع حساب محاسبه می‌کند.
    */

    if (
      type === "revenue" ||
      type === "expense"
    ) {
      operating += cashEffect;
    }

    else if (
      type === "asset"
    ) {

      if (
        getAccountName(t.account).includes("زمین") ||
        getAccountName(t.account).includes("ساختمان") ||
        getAccountName(t.account).includes("ماشین") ||
        getAccountName(t.account).includes("تجهیزات")
      ) {
        investing += cashEffect;
      }
    }

    else if (
      type === "liability" ||
      type === "equity"
    ) {
      financing += cashEffect;
    }
  });

  const netCash =
    operating +
    investing +
    financing;

  table.innerHTML = `

    <tr>
      <td>فعالیت‌های عملیاتی</td>
      <td>${formatMoney(operating)}</td>
    </tr>

    <tr>
      <td>فعالیت‌های سرمایه‌گذاری</td>
      <td>${formatMoney(investing)}</td>
    </tr>

    <tr>
      <td>فعالیت‌های تأمین مالی</td>
      <td>${formatMoney(financing)}</td>
    </tr>

    <tr>
      <th>خالص تغییرات وجه نقد</th>
      <th>${formatMoney(netCash)}</th>
    </tr>
  `;
}

/* =========================================================
   حقوق مالکانه
   ========================================================= */

function renderEquity(data) {

  const table =
    document.getElementById("equityTable");

  if (!table) return;

  const endingEquity =
    data.equity + data.netProfit;

  table.innerHTML = `

    <tr>
      <td>حقوق مالکانه ابتدای دوره</td>
      <td>${formatMoney(data.equity)}</td>
    </tr>

    <tr>
      <td>سود / زیان دوره</td>
      <td>${formatMoney(data.netProfit)}</td>
    </tr>

    <tr>
      <th>حقوق مالکانه پایان دوره</th>
      <th>${formatMoney(endingEquity)}</th>
    </tr>
  `;
}

/* =========================================================
   نسبت‌های مالی
   ========================================================= */

function renderRatios(data) {

  const currentAssets =
    data.assetAccounts
      .filter(x =>
        !(
          x.name.includes("زمین") ||
          x.name.includes("ساختمان") ||
          x.name.includes("ماشین") ||
          x.name.includes("تجهیزات")
        )
      )
      .reduce(
        (sum, x) => sum + x.balance,
        0
      );

  const currentLiabilities =
    data.liabilityAccounts.reduce(
      (sum, x) => sum + x.balance,
      0
    );

  const currentRatio =
    currentLiabilities !== 0
      ? currentAssets / currentLiabilities
      : 0;

  const debtRatio =
    data.assets !== 0
      ? (data.liabilities / data.assets) * 100
      : 0;

  const roa =
    data.assets !== 0
      ? (data.netProfit / data.assets) * 100
      : 0;

  const totalEquity =
    data.equity + data.netProfit;

  const roe =
    totalEquity !== 0
      ? (data.netProfit / totalEquity) * 100
      : 0;

  document.getElementById("currentRatio").textContent =
    currentRatio.toFixed(2);

  document.getElementById("debtRatio").textContent =
    debtRatio.toFixed(2) + "%";

  document.getElementById("roa").textContent =
    roa.toFixed(2) + "%";

  document.getElementById("roe").textContent =
    roe.toFixed(2) + "%";
}

/* =========================================================
   تحلیل نقدینگی
   ========================================================= */

function renderLiquidity(data) {

  const box =
    document.getElementById("liquidityResult");

  if (!box) return;

  const currentAssets =
    data.assetAccounts
      .filter(x =>
        !(
          x.name.includes("زمین") ||
          x.name.includes("ساختمان") ||
          x.name.includes("ماشین") ||
          x.name.includes("تجهیزات")
        )
      )
      .reduce(
        (sum, x) => sum + x.balance,
        0
      );

  const currentLiabilities =
    data.liabilityAccounts.reduce(
      (sum, x) => sum + x.balance,
      0
    );

  const ratio =
    currentLiabilities !== 0
      ? currentAssets / currentLiabilities
      : 0;

  let result = "";

  if (currentLiabilities === 0) {
    result =
      "⚠️ بدهی جاری ثبت نشده است؛ بنابراین نسبت جاری قابل محاسبه دقیق نیست.";
  }

  else if (ratio >= 2) {
    result =
      "🟢 وضعیت نقدینگی مناسب است.";
  }

  else if (ratio >= 1) {
    result =
      "🟡 وضعیت نقدینگی قابل قبول است ولی باید کنترل شود.";
  }

  else {
    result =
      "🔴 هشدار: دارایی‌های جاری برای پوشش بدهی‌های جاری کافی نیست.";
  }

  box.innerHTML = `
    <p>
      دارایی‌های جاری:
      <strong>${formatMoney(currentAssets)}</strong>
    </p>

    <p>
      بدهی‌های جاری:
      <strong>${formatMoney(currentLiabilities)}</strong>
    </p>

    <p>
      نسبت جاری:
      <strong>${ratio.toFixed(2)}</strong>
    </p>

    <hr>

    <p>${result}</p>
  `;
}

/* =========================================================
   داشبورد
   ========================================================= */

function renderDashboard(data) {

  document.getElementById("dashAssets").textContent =
    formatMoney(data.assets);

  document.getElementById("dashLiabilities").textContent =
    formatMoney(data.liabilities);

  document.getElementById("dashEquity").textContent =
    formatMoney(
      data.equity + data.netProfit
    );

  document.getElementById("dashProfit").textContent =
    formatMoney(data.netProfit);
}

/* =========================================================
   کنترل توازن حسابداری
   ========================================================= */

function checkAccountingBalance() {

  let totalDebit = 0;
  let totalCredit = 0;

  transactions.forEach(t => {

    totalDebit += numberValue(t.debit);
    totalCredit += numberValue(t.credit);

  });

  const difference =
    totalDebit - totalCredit;

  return {
    totalDebit,
    totalCredit,
    difference,
    balanced: Math.abs(difference) < 0.01
  };
}

/* =========================================================
   محاسبه همه بخش‌ها
   ========================================================= */

function calculateAll() {

  const data =
    calculateFinancialData();

  renderIncomeStatement(data);

  renderBalanceSheet(data);

  renderCashFlow(data);

  renderEquity(data);

  renderRatios(data);

  renderLiquidity(data);

  renderDashboard(data);

  const balance =
    checkAccountingBalance();

  console.log("جمع بدهکار:", balance.totalDebit);
  console.log("جمع بستانکار:", balance.totalCredit);
  console.log("مغایرت:", balance.difference);
}

/* =========================================================
   خروجی Excel
   ========================================================= */

function exportExcel() {

  if (typeof XLSX === "undefined") {
    alert("کتابخانه Excel هنوز بارگذاری نشده است.");
    return;
  }

  const data =
    calculateFinancialData();

  const workbook =
    XLSX.utils.book_new();

  /* -------------------------
     شیت 1: داده‌های خام
     ------------------------- */

  const rawRows = transactions.map(t => ({
    "تاریخ": t.date,
    "شرح": t.description,
    "حساب": t.account,
    "بدهکار": t.debit,
    "بستانکار": t.credit
  }));

  const rawSheet =
    XLSX.utils.json_to_sheet(rawRows);

  XLSX.utils.book_append_sheet(
    workbook,
    rawSheet,
    "داده های خام"
  );

  /* -------------------------
     شیت 2: طبقه‌بندی جریان نقد
     ------------------------- */

  const cashRows = transactions.map(t => {

    let category = "نامشخص";

    const type =
      accountType(t.account);

    if (
      type === "revenue" ||
      type === "expense"
    ) {
      category = "عملیاتی";
    }

    else if (
      type === "asset" &&
      (
        t.account.includes("زمین") ||
        t.account.includes("ساختمان") ||
        t.account.includes("ماشین") ||
        t.account.includes("تجهیزات")
      )
    ) {
      category = "سرمایه‌گذاری";
    }

    else if (
      type === "liability" ||
      type === "equity"
    ) {
      category = "تأمین مالی";
    }

    return {
      "تاریخ": t.date,
      "حساب": t.account,
      "شرح": t.description,
      "طبقه جریان نقد": category,
      "بدهکار": t.debit,
      "بستانکار": t.credit
    };
  });

  const cashClassSheet =
    XLSX.utils.json_to_sheet(cashRows);

  XLSX.utils.book_append_sheet(
    workbook,
    cashClassSheet,
    "طبقه بندی جریان نقد"
  );

  /* -------------------------
     شیت 3: جریان وجوه نقد
     ------------------------- */

  const cashFlowRows = [
    {
      "عنوان": "فعالیت‌های عملیاتی",
      "مبلغ": calculateCashOperating()
    },
    {
      "عنوان": "فعالیت‌های سرمایه‌گذاری",
      "مبلغ": calculateCashInvesting()
    },
    {
      "عنوان": "فعالیت‌های تأمین مالی",
      "مبلغ": calculateCashFinancing()
    }
  ];

  const cashFlowSheet =
    XLSX.utils.json_to_sheet(cashFlowRows);

  XLSX.utils.book_append_sheet(
    workbook,
    cashFlowSheet,
    "صورت جریان وجوه نقد"
  );

  /* -------------------------
     شیت 4: محاسبات و شاخص‌ها
     ------------------------- */

  const ratiosSheet =
    XLSX.utils.json_to_sheet([
      {
        "شاخص": "دارایی‌ها",
        "مقدار": data.assets
      },
      {
        "شاخص": "بدهی‌ها",
        "مقدار": data.liabilities
      },
      {
        "شاخص": "حقوق مالکانه",
        "مقدار":
          data.equity + data.netProfit
      },
      {
        "شاخص": "درآمد",
        "مقدار": data.revenue
      },
      {
        "شاخص": "هزینه",
        "مقدار": data.expenses
      },
      {
        "شاخص": "سود خالص",
        "مقدار": data.netProfit
      }
    ]);

  XLSX.utils.book_append_sheet(
    workbook,
    ratiosSheet,
    "محاسبات و شاخص ها"
  );

  /* -------------------------
     شیت 5: تحلیل نقدینگی
     ------------------------- */

  const liquiditySheet =
    XLSX.utils.json_to_sheet([
      {
        "شاخص": "نسبت جاری",
        "مقدار":
          calculateCurrentRatio(data)
      },
      {
        "شاخص": "بدهی به دارایی",
        "مقدار":
          data.assets !== 0
            ? data.liabilities / data.assets
            : 0
      }
    ]);

  XLSX.utils.book_append_sheet(
    workbook,
    liquiditySheet,
    "تحلیل نقدینگی"
  );

  /* -------------------------
     شیت 6: داشبورد
     ------------------------- */

  const dashboardSheet =
    XLSX.utils.json_to_sheet([
      {
        "شاخص": "دارایی‌ها",
        "مقدار": data.assets
      },
      {
        "شاخص": "بدهی‌ها",
        "مقدار": data.liabilities
      },
      {
        "شاخص": "حقوق مالکانه",
        "مقدار":
          data.equity + data.netProfit
      },
      {
        "شاخص": "سود خالص",
        "مقدار": data.netProfit
      }
    ]);

  XLSX.utils.book_append_sheet(
    workbook,
    dashboardSheet,
    "داشبورد"
  );

  const company =
    document.getElementById("companyName").value ||
    "دانشیار";

  XLSX.writeFile(
    workbook,
    `${company}-گزارش-مالی.xlsx`
  );
}

/* =========================================================
   محاسبات جریان نقد برای Excel
   ========================================================= */

function calculateCashOperating() {

  let total = 0;

  transactions.forEach(t => {

    const type =
      accountType(t.account);

    if (
      type === "revenue" ||
      type === "expense"
    ) {
      total +=
        numberValue(t.debit) -
        numberValue(t.credit);
    }
  });

  return total;
}

function calculateCashInvesting() {

  let total = 0;

  transactions.forEach(t => {

    const name =
      getAccountName(t.account);

    if (
      name.includes("زمین") ||
      name.includes("ساختمان") ||
      name.includes("ماشین") ||
      name.includes("تجهیزات")
    ) {
      total +=
        numberValue(t.debit) -
        numberValue(t.credit);
    }
  });

  return total;
}

function calculateCashFinancing() {

  let total = 0;

  transactions.forEach(t => {

    const type =
      accountType(t.account);

    if (
      type === "liability" ||
      type === "equity"
    ) {
      total +=
        numberValue(t.debit) -
        numberValue(t.credit);
    }
  });

  return total;
}

function calculateCurrentRatio(data) {

  const currentAssets =
    data.assetAccounts
      .filter(x =>
        !(
          x.name.includes("زمین") ||
          x.name.includes("ساختمان") ||
          x.name.includes("ماشین") ||
          x.name.includes("تجهیزات")
        )
      )
      .reduce(
        (sum, x) => sum + x.balance,
        0
      );

  const currentLiabilities =
    data.liabilityAccounts.reduce(
      (sum, x) => sum + x.balance,
      0
    );

  return currentLiabilities !== 0
    ? currentAssets / currentLiabilities
    : 0;
}

/* =========================================================
   ورود فایل Excel
   ========================================================= */

function importExcel(event) {

  const file =
    event.target.files[0];

  if (!file) return;

  if (typeof XLSX === "undefined") {
    alert("کتابخانه Excel بارگذاری نشده است.");
    return;
  }

  const reader =
    new FileReader();

  reader.onload = function(e) {

    try {

      const workbook =
        XLSX.read(
          e.target.result,
          {
            type: "array"
          }
        );

      const sheetName =
        workbook.SheetNames[0];

      const sheet =
        workbook.Sheets[sheetName];

      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: ""
          }
        );

      const imported = [];

      rows.forEach(row => {

        const date =
          row["تاریخ"] ||
          row["Date"] ||
          "";

        const description =
          row["شرح"] ||
          row["Description"] ||
          "";

        const account =
          row["حساب"] ||
          row["Account"] ||
          "";

        const debit =
          numberValue(
            row["بدهکار"] ||
            row["Debit"] ||
            0
          );

        const credit =
          numberValue(
            row["بستانکار"] ||
            row["Credit"] ||
            0
          );

        if (account) {

          imported.push({
            id:
              Date.now() +
              Math.random(),

            date,
            description,
            account,
            debit,
            credit
          });
        }
      });

      if (imported.length === 0) {

        alert(
          "در فایل Excel تراکنش قابل شناسایی پیدا نشد."
        );

        return;
      }

      if (
        !confirm(
          `${imported.length} تراکنش پیدا شد. اطلاعات فعلی جایگزین شود؟`
        )
      ) {
        return;
      }

      transactions = imported;

      saveData();

      renderTransactions();

      calculateAll();

      alert(
        "اطلاعات Excel با موفقیت وارد شد."
      );

    }

    catch(error) {

      console.error(error);

      alert(
        "خطا در خواندن فایل Excel."
      );
    }
  };

  reader.readAsArrayBuffer(file);
}

/* =========================================================
   بررسی اولیه
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadCompany();

    renderTransactions();

    calculateAll();

  }
);

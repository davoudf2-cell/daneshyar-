// تابعی برای نمایش اپلیکیشن حسابداری (باز کردن بخش حسابداری)
function openApp() {
    document.querySelector('.categories').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    const appSection = document.getElementById('accounting-app');
    appSection.style.display = 'block';
    window.scrollTo(0, 0);
}

// تابع محاسبه و تولید صورت‌های مالی
function calculateFinancials() {
    const company = document.getElementById('companyName').value || "شرکت فرضی";
    const year = document.getElementById('fiscalYear').value || "۱۴۰۲";
    
    const currentAssets = parseFloat(document.getElementById('currentAssets').value) || 0;
    const currentLiabilities = parseFloat(document.getElementById('currentLiabilities').value) || 0;
    const netIncome = parseFloat(document.getElementById('netIncome').value) || 0;

    const formatNum = (num) => num.toLocaleString('fa-IR');
    const resultsArea = document.getElementById('resultsArea');
    
    resultsArea.innerHTML = `
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-right: 5px solid #3498db; margin-bottom: 15px;">
            <h3 style="color: #2c3e50;">نتیجه محاسبات برای: ${company} - سال مالی ${year}</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
            <tr style="background: #34495e; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd;">عنوان صورت مالی</th>
                <th style="padding: 10px; border: 1px solid #ddd;">شرح</th>
                <th style="padding: 10px; border: 1px solid #ddd;">مبلغ (ریال)</th>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">ترازنامه (بخشی)</td>
                <td style="padding: 10px; border: 1px solid #ddd;">دارایی جاری</td>
                <td style="padding: 10px; border: 1px solid #ddd; direction: ltr; text-align: right;">${formatNum(currentAssets)}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">ترازنامه (بخشی)</td>
                <td style="padding: 10px; border: 1px solid #ddd;">بدهی جاری</td>
                <td style="padding: 10px; border: 1px solid #ddd; direction: ltr; text-align: right;">${formatNum(currentLiabilities)}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">صورت سود و زیان</td>
                <td style="padding: 10px; border: 1px solid #ddd;">سود خالص</td>
                <td style="padding: 10px; border: 1px solid #ddd; direction: ltr; text-align: right;">${formatNum(netIncome)}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">نسبت‌های مالی</td>
                <td style="padding: 10px; border: 1px solid #ddd;">نسبت جاری (دارایی ÷ بدهی)</td>
                <td style="padding: 10px; border: 1px solid #ddd; direction: ltr; text-align: right;">${currentLiabilities ? (currentAssets / currentLiabilities).toFixed(2) : 'تعریف نشده'}</td>
            </tr>
        </table>
        
        <p style="color: #e67e22; font-weight: bold;">⚠️ توجه: این نسخه آزمایشی است و در گام‌های بعدی، جدول‌های کامل و خروجی اکسل به آن اضافه می‌شود.</p>
    `;
}
// تابع تولید و دانلود فایل اکسل
function exportToExcel() {
    const company = document.getElementById('companyName').value || "شرکت فرضی";
    const year = document.getElementById('fiscalYear').value || "۱۴۰۲";
    const currentAssets = parseFloat(document.getElementById('currentAssets').value) || 0;
    const currentLiabilities = parseFloat(document.getElementById('currentLiabilities').value) || 0;
    const netIncome = parseFloat(document.getElementById('netIncome').value) || 0;

    const operatingCashFlow = netIncome + (currentLiabilities - currentAssets);

    const rawData = [
        ["نام شرکت", company],
        ["سال مالی", year],
        ["دارایی جاری", currentAssets],
        ["بدهی جاری", currentLiabilities],
        ["سود خالص", netIncome]
    ];

    const cashFlowData = [
        ["شرح", "مبلغ (ریال)"],
        ["جریان نقدی عملیاتی", operatingCashFlow],
        ["جریان نقدی سرمایه‌گذاری", 0],
        ["جریان نقدی تامین مالی", 0],
        ["خالص افزایش/کاهش نقد", operatingCashFlow]
    ];

    const wb = XLSX.utils.book_new();
    const wsRaw = XLSX.utils.aoa_to_sheet(rawData);
    const wsCashFlow = XLSX.utils.aoa_to_sheet(cashFlowData);

    XLSX.utils.book_append_sheet(wb, wsRaw, "داده های خام");
    XLSX.utils.book_append_sheet(wb, wsCashFlow, "جریان وجوه نقد");

    XLSX.writeFile(wb, `گزارش_${company}_${year}.xlsx`);
    
    const resultsArea = document.getElementById('resultsArea');
    const cashFlowHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white;">
            <tr style="background: #34495e; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd;" colspan="2">صورت جریان وجوه نقد (خلاصه)</th>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">جریان نقدی عملیاتی</td>
                <td style="padding: 10px; border: 1px solid #ddd; direction: ltr; text-align: right;">${operatingCashFlow.toLocaleString('fa-IR')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">خالص افزایش/کاهش نقد</td>
                <td style="padding: 10px; border: 1px solid #ddd; direction: ltr; text-align: right;">${operatingCashFlow.toLocaleString('fa-IR')}</td>
            </tr>
        </table>
    `;
    resultsArea.innerHTML += cashFlowHTML;
                    }

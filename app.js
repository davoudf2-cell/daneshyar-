// تابعی برای نمایش اپلیکیشن حسابداری
function openApp() {
    // پنهان کردن بخش کارت‌ها
    document.querySelector('.categories').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    
    // نمایش بخش اپلیکیشن
    const appSection = document.getElementById('accounting-app');
    appSection.style.display = 'block';
    
    // اسکرول به بالا
    window.scrollTo(0, 0);
}

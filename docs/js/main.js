document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('language-select');
  
  // Default language
  let currentLang = 'en';

  // Try to get language from URL param or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  const storedLang = localStorage.getItem('anime_poc_lang');

  if (langParam && translations[langParam]) {
    currentLang = langParam;
  } else if (storedLang && translations[storedLang]) {
    currentLang = storedLang;
  } else {
    // Try browser language
    const browserLang = navigator.language.slice(0, 2);
    if (translations[browserLang]) {
      currentLang = browserLang;
    }
  }

  // Initialize
  setLanguage(currentLang);
  languageSelect.value = currentLang;

  // Event Listener
  languageSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLang = lang;
    localStorage.setItem('anime_poc_lang', lang);
    
    // Update URL without reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('lang', lang);
    window.history.pushState({}, '', newUrl);

    // Update Text Content
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });

    // Handle RTL for Arabic
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.classList.remove('rtl');
    }
  }
});

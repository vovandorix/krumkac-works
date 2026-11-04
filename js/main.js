(() => {
  const root = document.documentElement;
  const supportedLanguages = ['en', 'bel', 'ru'];
  const defaultLanguage = 'en';
  const dictionaries = window.KW_LANGUAGES || {};
  // Application data

  function applyAppData() {
    const apps = window.KW_APPS || {};

    document.querySelectorAll('[data-app]').forEach(card => {
      const app = apps[card.dataset.app];

      if (!app) return;

      // Application logo
      const logo = card.querySelector('[data-app-logo]');

      if (logo && app.visual?.src) {
        logo.src = `${logo.dataset.appLogoPrefix || ""}${app.visual.src}`;
        logo.alt = app.name;
      }

      // Application name
      const name = card.querySelector('[data-app-name]');

      if (name) {
        name.textContent = app.name;
      }


    });
  }

  applyAppData();

  // Render application cards

  if (window.KW_RENDER_APP_CARDS) {
    window.KW_RENDER_APP_CARDS(
      ".program-section .project-grid",
      "home"
    );

    window.KW_RENDER_APP_CARDS(
      ".listing-grid",
      "catalog"
    );
  }

  const themeButton = document.querySelector('.theme-toggle');
  const languageToggle = document.querySelector('.language-toggle');
  const savedTheme = localStorage.getItem('kw-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

  function currentLanguage() {
    const saved = localStorage.getItem('kw-language');
    return supportedLanguages.includes(saved) ? saved : defaultLanguage;
  }

  // Случайная заметка Field Notes
  function renderFieldNote() {

    const quote = document.getElementById("field-note-quote");
    const sign = document.getElementById("field-note-sign");

    if (!quote || !sign || !window.KW_FIELD_NOTES?.length) return;

    const language = currentLanguage();

    const noteLanguage = {
      en: "eng",
      bel: "bel",
      ru: "rus"
    }[language];

    const note = window.KW_FIELD_NOTES[
      Math.floor(Math.random() * window.KW_FIELD_NOTES.length)
    ];

    quote.textContent = note.text[noteLanguage] || note.text.eng;

    const topic = note.topic[noteLanguage] || note.topic.eng;

    sign.textContent =
      `Krumkač Works · ${topic} · field note № ${String(note.id).padStart(2, "0")}`;
  }

  function translate(language) {
    const dictionary = dictionaries[language] || dictionaries[defaultLanguage] || {};
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = dictionary[element.dataset.i18n];
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const value = dictionary[element.dataset.i18nHtml];
      if (value !== undefined) element.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const [attribute, key] = element.dataset.i18nAttr.split(':');
      if (dictionary[key] !== undefined) element.setAttribute(attribute, dictionary[key]);
    });
    const title = document.querySelector('title[data-i18n]');
    if (title && dictionary[title.dataset.i18n]) document.title = dictionary[title.dataset.i18n];
    root.lang = language === 'bel' ? 'be' : language;
    languageToggle?.querySelectorAll('[data-lang]').forEach(button => {
      const active = button.dataset.lang === language;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateThemeLabel(language);
  }

  function updateThemeLabel(language = currentLanguage()) {
    if (!themeButton) return;
    const light = root.dataset.theme === 'light';
    const labels = {
      en: light ? 'Dark theme' : 'Light theme',
      bel: light ? 'Цёмная тэма' : 'Светлая тэма',
      ru: light ? 'Тёмная тема' : 'Светлая тема'
    };
    const label = themeButton.querySelector('.theme-label');
    if (label) label.textContent = labels[language];
    themeButton.querySelector('.theme-icon').textContent = light ? '☾' : '☼';
    themeButton.setAttribute('aria-label', labels[language]);
    themeButton.setAttribute('title', labels[language]);
  }

  translate(currentLanguage());
  renderFieldNote();
  languageToggle?.addEventListener('click', event => {
    const button = event.target.closest('[data-lang]');
    if (!button || !supportedLanguages.includes(button.dataset.lang)) return;
    localStorage.setItem('kw-language', button.dataset.lang);
    translate(button.dataset.lang);
    renderFieldNote();
  });

  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('kw-theme', root.dataset.theme);
    updateThemeLabel();
  });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menuButton?.addEventListener('click', () => nav?.classList.toggle('open'));


  // Application page tabs

  const appTabs = document.querySelectorAll('.app-tab');
  const appPanels = document.querySelectorAll('.app-tab-panel');

  appTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      appTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });

      appPanels.forEach(panel => {
        const active = panel.id === `panel-${target}`;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });

  // PDF Navigator screenshot lightbox

  const lightbox = document.getElementById('screenshot-lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext = lightbox?.querySelector('.lightbox-next');

  const screenshotButtons = document.querySelectorAll('.screenshot-item');
  const screenshotImages = Array.from(screenshotButtons).map(button => ({
    src: button.dataset.full,
    alt: button.querySelector('img')?.alt || ''
  }));

  let currentScreenshot = 0;

  if (lightbox && lightboxImage && lightboxClose &&
    lightboxPrev && lightboxNext) {

    const showScreenshot = index => {
      currentScreenshot = (index + screenshotImages.length) % screenshotImages.length;

      lightboxImage.src = screenshotImages[currentScreenshot].src;
      lightboxImage.alt = screenshotImages[currentScreenshot].alt;
    };

    screenshotButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        showScreenshot(index);
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
      });
    });

    const closeLightbox = () => {
      lightbox.hidden = true;
      lightboxImage.src = '';
      document.body.classList.remove('lightbox-open');
    };

    lightboxClose.addEventListener('click', closeLightbox);

    lightboxPrev.addEventListener('click', () => {
      showScreenshot(currentScreenshot - 1);
    });

    lightboxNext.addEventListener('click', () => {
      showScreenshot(currentScreenshot + 1);
    });

    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', event => {
      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        showScreenshot(currentScreenshot - 1);
      }

      if (event.key === 'ArrowRight') {
        showScreenshot(currentScreenshot + 1);
      }
    });
  }

})();

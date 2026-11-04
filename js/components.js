
(() => {

  // Проверка данных приложения
  function validateApp(app) {

    if (!app || typeof app !== "object") {
      return "отсутствует запись приложения";
    }

    if (!app.name) {
      return "отсутствует название";
    }

    if (!app.page) {
      return "отсутствует ссылка на страницу";
    }

    if (!app.visual || typeof app.visual !== "object") {
      return "отсутствует визуальный блок";
    }

    if (!["image", "html"].includes(app.visual.type)) {
      return "неизвестный тип визуального блока";
    }

    if (app.visual.type === "image" && !app.visual.src) {
      return "отсутствует путь к изображению";
    }

    if (app.visual.type === "html" && !app.visual.html) {
      return "отсутствует HTML-содержимое";
    }

    return null;
  }


  function createAppCard(app, mode) {

    const card = document.createElement("article");
    card.className = "project-card";

    if (app.quiet) {
      card.classList.add("project-card-quiet");
    }

    // Визуальная область
    const visual = document.createElement("div");
    visual.className = "project-visual";

    // Статус приложения
    if (["development", "coming", "archived"].includes(app.status)) {
      const status = document.createElement("span");
      status.className = `project-status project-status-${app.status}`;
      status.dataset.i18n = `project.status.${app.status}`;
      visual.appendChild(status);
    }

    if (app.visual.class) {
      visual.classList.add(app.visual.class);
    }

    if (app.visual.type === "image") {
      const img = document.createElement("img");
      img.className = "project-logo";
      img.src = app.visual.src;
      img.alt = app.name;
      visual.appendChild(img);

    } else {
      visual.insertAdjacentHTML("beforeend", app.visual.html);
    }

    // Информационная область
    const info = document.createElement("div");
    info.className = "project-info";

    // Категория и платформа
    const meta = document.createElement("div");
    meta.className = "card-meta";

    if (app.category) {
      const category = document.createElement("span");
      category.dataset.i18n = app.category;
      meta.appendChild(category);
    }

    if (app.platform) {
      const platform = document.createElement("span");
      platform.textContent = app.platform;
      meta.appendChild(platform);
    }


    if (meta.children.length > 0) {
      info.appendChild(meta);
    }

    // Название
    const title = document.createElement("h3");
    title.textContent = app.name;
    info.appendChild(title);

    // Описание
    const descriptionKey = app.descriptions?.[mode];

    if (descriptionKey) {
      const description = document.createElement("p");
      description.dataset.i18n = descriptionKey;
      info.appendChild(description);
    }

    // Ссылка
    const link = document.createElement("a");
    link.className = "card-link";
    link.href = app.page;

    link.dataset.i18n =
      mode === "home"
        ? "common.learn_more"
        : "common.project_page";

    info.appendChild(link);

    card.append(visual, info);

    return card;
  }


  // Публичная функция генерации карточек
  window.KW_RENDER_APP_CARDS = function (target, mode) {

    const container = document.querySelector(target);
    const apps = window.KW_APPS || {};

    if (!container) return;

    container.replaceChildren();

    Object.values(apps)
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
      .forEach(app => {

        if (mode === "home" && !app.featured) {
          return;
        }

        const error = validateApp(app);

        if (error) {
          console.warn(
            `[KW] Приложение "${app?.name || "без названия"}" пропущено: ${error}`
          );
          return;
        }

        container.appendChild(createAppCard(app, mode));

      });

  };

})();

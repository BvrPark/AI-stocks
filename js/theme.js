const THEME_KEY = "wafer-theme";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
});


function initTheme() {

  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme("light");
  }


  const button = document.getElementById("theme-toggle-button");

  if (button) {
    button.addEventListener("click", toggleTheme);
  }

}



function toggleTheme() {

  const currentTheme = document.body.dataset.theme;

  if (currentTheme === "dark") {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }

}



function applyTheme(theme) {

  document.body.dataset.theme = theme;

  localStorage.setItem(
    THEME_KEY,
    theme
  );

  updateThemeButton(theme);

}



function updateThemeButton(theme) {

  const button =
    document.getElementById(
      "theme-toggle-button"
    );


  if (!button) return;


  button.textContent =
    theme === "dark"
      ? "☀️ 주간"
      : "🌙 야간";

}

const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

function updateSidebarImages(isDark) {
  document.querySelectorAll('.sidebar-icon').forEach(img => {
    img.src = isDark ? img.dataset.srcDark : img.dataset.srcLight;
  });
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateSidebarImages(isDark);
}

updateSidebarImages(savedTheme === 'dark');

document.getElementById('darkModeToggle').addEventListener('click', function (e) {
  e.preventDefault();
  toggleTheme();
});


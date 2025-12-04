function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');

    if (sun && moon) {
        if (theme === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
        }
    }
}

// Init Theme
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

document.addEventListener('DOMContentLoaded', checkAdminAuth);

function checkAdminAuth() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const authToken = localStorage.getItem('authToken');
    
    if (!isAdmin || !authToken) {
        window.location.href = 'index.html';
        return;
    }
}

// auth.js (Frontend)
const checkAuth = () => {
    const token = localStorage.getItem('token');
    
    // If no token found, redirect to login
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    
    return token;
};

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    updateAuthButtons();
    window.location.href = 'login.html';
};

const updateAuthButtons = () => {
    const token = localStorage.getItem('token');
    const loginBtn = document.querySelector('.login-btn');
    const logoutBtn = document.querySelector('.logout-btn') || document.createElement('button');
    
    if (token) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        
        if (!document.querySelector('.logout-btn')) {
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = handleLogout;
            if (loginBtn) {
                loginBtn.parentNode.insertBefore(logoutBtn, loginBtn);
            }
        }
        logoutBtn.style.display = 'block';
    } else {
        // User is logged out
        if (loginBtn) loginBtn.style.display = 'block';
        if (document.querySelector('.logout-btn')) {
            logoutBtn.style.display = 'none';
        }
    }
};

// Check auth state on page load
document.addEventListener('DOMContentLoaded', updateAuthButtons);
const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
             throw new Error(data.error || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

async function checkAuth() {
    try {
        const user = await fetchAPI('/auth/me');
        return user;
    } catch (err) {
        return null;
    }
}

async function logout() {
    try {
        await fetchAPI('/auth/logout', { method: 'POST' });
    } catch (err) {
        console.error('Logout response:', err);
    } finally {
        window.location.href = '/index.html';
    }
}

function showAlert(message, type = 'error', id = 'form-alert') {
    const alertEl = document.getElementById(id);
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.className = `alert alert-${type}`;
        alertEl.style.display = 'block';
        setTimeout(() => { alertEl.style.display = 'none'; }, 5000);
    } else {
        alert(message);
    }
}

const API = location.origin.replace(/\/$/, '') + '/api';

// Hide loading screen when page is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 2000); // Show for 2 seconds
});

function saveSession({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  console.log('Saving session for user:', user);
  if (user.role === 'customer') location.href = '/customer.html';
  if (user.role === 'admin') location.href = '/admin.html';
  if (user.role === 'master') location.href = '/master.html';
}

const signinBtn = document.getElementById('signin-btn');
if (signinBtn) {
  signinBtn.onclick = async () => {
    const email = document.getElementById('si-email').value.trim();
    const password = document.getElementById('si-password').value;
    
    if (!email || !password) {
      return alert('Please enter both email and password');
    }
    
    console.log('Attempting login with:', email);
    console.log('API endpoint:', API + '/auth/signin');
    
    try {
      const res = await fetch(API + '/auth/signin', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password }) 
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Login response:', data);
      
      if (!res.ok) {
        console.error('Login failed:', data.message);
        return alert(data.message || 'Invalid credentials');
      }
      
      console.log('Login successful! Redirecting...');
      saveSession(data);
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check if the server is running.');
    }
  };
}

const signupBtn = document.getElementById('signup-btn');
if (signupBtn) {
  signupBtn.onclick = async () => {
    const name = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const password = document.getElementById('su-password').value;
    
    if (!name || !email || !password) {
      return alert('Please fill in all fields');
    }
    
    if (password.length < 6) {
      return alert('Password must be at least 6 characters');
    }
    
    // Always register as customer - admins are created through backend
    const role = 'customer';
    
    const res = await fetch(API + '/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role }) });
    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Failed');
    saveSession(data);
  };
}

// shared logout link handling
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
  logoutLink.onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/';
  };
}




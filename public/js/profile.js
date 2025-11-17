const API = location.origin.replace(/\/$/, '') + '/api';
const token = localStorage.getItem('token');
const headers = token ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } : { 'Content-Type': 'application/json' };

function guardRole() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) location.href = '/';
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('user-role').textContent = user.role;
  document.getElementById('user-points').textContent = user.points ?? '-';
}
guardRole();

async function loadOrders() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.role !== 'customer') {
    document.getElementById('orders').innerHTML = '<p>Only customers have order history.</p>';
    return;
  }
  const res = await fetch(API + '/orders/my', { headers });
  const data = await res.json();
  document.getElementById('orders').innerHTML = data.map(o => `
    <div class="card">
      <div><strong>Order:</strong> ${o._id}</div>
      <div><strong>Date:</strong> ${new Date(o.createdAt).toLocaleString()}</div>
      <div><strong>Total:</strong> $${o.total.toFixed(2)}</div>
      <div>${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
    </div>
  `).join('');
}

loadOrders();

const logoutLink = document.getElementById('logout-link');
if (logoutLink) { logoutLink.onclick = () => { localStorage.clear(); location.href = '/'; }; }



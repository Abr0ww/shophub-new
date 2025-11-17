const API = location.origin.replace(/\/$/, '') + '/api';
const token = localStorage.getItem('token');
const headers = token ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } : { 'Content-Type': 'application/json' };

// Hide loading screen when page is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 2000);
});

function guardRole() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'master') location.href = '/';
}
guardRole();

// Tab Navigation
function setActiveTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  document.querySelectorAll('.admin-bottom-nav .nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`.admin-bottom-nav .nav-item[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

document.querySelectorAll('.admin-bottom-nav .nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    setActiveTab(tab);
  });
});

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

async function loadAllProducts() {
  try {
    const res = await fetch(API + '/products');
    const products = await res.json();
    
    const listEl = document.getElementById('products-list');
    if (!listEl) return;
    
    if (!Array.isArray(products) || products.length === 0) {
      listEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No products found.</p>';
      return;
    }
    
    console.log('Products data:', products.map(p => ({ name: p.name, isAvailable: p.isAvailable, type: typeof p.isAvailable })));
    
    listEl.innerHTML = products.map(p => {
      const isAvailable = p.isAvailable !== undefined ? p.isAvailable : true;
      return `
      <div class="master-product-card">
        <img src="${p.imageUrl || 'https://via.placeholder.com/100'}" alt="${p.name}" class="master-product-image" />
        <div class="master-product-info">
          <h3>${p.name}</h3>
          <p class="master-product-price">$${p.price.toFixed(2)} ${p.offerPercent > 0 ? `<span class="discount">-${p.offerPercent}%</span>` : ''}</p>
          <div class="master-product-details">
            <span class="detail-badge">Stock: ${p.stock || 0}</span>
            <span class="detail-badge">SKU: ${p.sku || 'N/A'}</span>
          </div>
          <div class="master-product-status">
            <span class="status-badge ${isAvailable === true ? 'available' : 'unavailable'}">
              ${isAvailable === true ? '✓ Available' : '✗ Unavailable'}
            </span>
          </div>
        </div>
        <div class="master-product-actions">
          <button class="edit-btn" onclick="openEditProductModal('${p._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteProduct('${p._id}')">Delete</button>
        </div>
      </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load products error:', err);
  }
}

function openEditProductModal(productId) {
  fetch(API + `/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById('edit-p-id').value = product._id;
      document.getElementById('edit-p-name').value = product.name;
      document.getElementById('edit-p-price').value = product.price;
      document.getElementById('edit-p-desc').value = product.description || '';
      document.getElementById('edit-p-stock').value = product.stock || 0;
      document.getElementById('edit-p-sku').value = product.sku || '';
      document.getElementById('edit-p-brand').value = product.brand || '';
      document.getElementById('edit-p-weight').value = product.weight || '';
      document.getElementById('edit-p-dimensions').value = product.dimensions || '';
      document.getElementById('edit-p-offer').value = product.offerPercent || 0;
      document.getElementById('edit-p-available').checked = product.isAvailable;
      
      document.getElementById('edit-product-modal').style.display = 'flex';
    })
    .catch(err => {
      console.error('Load product error:', err);
      alert('Failed to load product details');
    });
}

function closeEditProductModal() {
  document.getElementById('edit-product-modal').style.display = 'none';
}

async function saveProductEdit() {
  const productId = document.getElementById('edit-p-id').value;
  const updateData = {
    name: document.getElementById('edit-p-name').value.trim(),
    price: Number(document.getElementById('edit-p-price').value),
    description: document.getElementById('edit-p-desc').value.trim(),
    stock: Number(document.getElementById('edit-p-stock').value),
    sku: document.getElementById('edit-p-sku').value.trim(),
    brand: document.getElementById('edit-p-brand').value.trim(),
    weight: document.getElementById('edit-p-weight').value.trim(),
    dimensions: document.getElementById('edit-p-dimensions').value.trim(),
    offerPercent: Number(document.getElementById('edit-p-offer').value || 0),
    isAvailable: document.getElementById('edit-p-available').checked
  };
  
  try {
    const res = await fetch(API + `/products/${productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to update product');
    }
    
    alert('✅ Product updated successfully!');
    closeEditProductModal();
    loadAllProducts();
    
  } catch (err) {
    console.error('Update product error:', err);
    alert('Failed to update product');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  try {
    const res = await fetch(API + `/products/${productId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to delete product');
    }
    
    alert('✅ Product deleted successfully!');
    loadAllProducts();
    
  } catch (err) {
    console.error('Delete product error:', err);
    alert('Failed to delete product');
  }
}

// ============================================
// DEALS MANAGEMENT
// ============================================

async function loadAllDeals() {
  try {
    const res = await fetch(API + '/deals');
    const deals = await res.json();
    
    const listEl = document.getElementById('deals-list');
    if (!listEl) return;
    
    if (!Array.isArray(deals) || deals.length === 0) {
      listEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No deals found.</p>';
      return;
    }
    
    listEl.innerHTML = deals.map(d => {
      const discountText = d.discountType === 'percentage' 
        ? `${d.discountValue}%` 
        : d.discountType === 'fixed'
        ? `$${d.discountValue}`
        : 'Free Item';
      
      return `
        <div class="master-deal-card">
          <img src="${d.imageUrl || 'https://via.placeholder.com/100'}" alt="${d.title}" class="master-deal-image" />
          <div class="master-deal-info">
            <h3>${d.title}</h3>
            <p class="master-deal-discount">${discountText} OFF</p>
            <p class="master-deal-meta">
              <span>💎 ${d.pointsCost} pts</span> • 
              <span>Min: $${d.minOrderValue || 0}</span> • 
              <span>Max uses: ${d.maxUses}</span> • 
              <span>${d.isActive ? '✅ Active' : '❌ Inactive'}</span>
            </p>
            <p class="master-deal-desc">${d.description}</p>
          </div>
          <div class="master-deal-actions">
            <button class="edit-btn" onclick="openEditDealModal('${d._id}')">Edit</button>
            <button class="delete-btn" onclick="toggleDealStatus('${d._id}', ${d.isActive})">
              ${d.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Load deals error:', err);
  }
}

function openEditDealModal(dealId) {
  fetch(API + `/deals/${dealId}`)
    .then(res => res.json())
    .then(deal => {
      document.getElementById('edit-d-id').value = deal._id;
      document.getElementById('edit-d-title').value = deal.title;
      document.getElementById('edit-d-description').value = deal.description;
      document.getElementById('edit-d-points').value = deal.pointsCost;
      document.getElementById('edit-d-type').value = deal.discountType;
      document.getElementById('edit-d-value').value = deal.discountValue;
      document.getElementById('edit-d-min-order').value = deal.minOrderValue || 0;
      document.getElementById('edit-d-max-uses').value = deal.maxUses;
      document.getElementById('edit-d-active').checked = deal.isActive;
      
      document.getElementById('edit-deal-modal').style.display = 'flex';
    })
    .catch(err => {
      console.error('Load deal error:', err);
      alert('Failed to load deal details');
    });
}

function closeEditDealModal() {
  document.getElementById('edit-deal-modal').style.display = 'none';
}

async function saveDealEdit() {
  const dealId = document.getElementById('edit-d-id').value;
  const updateData = {
    title: document.getElementById('edit-d-title').value.trim(),
    description: document.getElementById('edit-d-description').value.trim(),
    pointsCost: Number(document.getElementById('edit-d-points').value),
    discountType: document.getElementById('edit-d-type').value,
    discountValue: Number(document.getElementById('edit-d-value').value),
    minOrderValue: Number(document.getElementById('edit-d-min-order').value || 0),
    maxUses: Number(document.getElementById('edit-d-max-uses').value),
    isActive: document.getElementById('edit-d-active').checked
  };
  
  try {
    const res = await fetch(API + `/deals/${dealId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to update deal');
    }
    
    alert('✅ Deal updated successfully!');
    closeEditDealModal();
    loadAllDeals();
    
  } catch (err) {
    console.error('Update deal error:', err);
    alert('Failed to update deal');
  }
}

async function toggleDealStatus(dealId, currentStatus) {
  const action = currentStatus ? 'deactivate' : 'activate';
  if (!confirm(`Are you sure you want to ${action} this deal?`)) {
    return;
  }
  
  try {
    const res = await fetch(API + `/deals/${dealId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isActive: !currentStatus })
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to toggle deal status');
    }
    
    alert(`✅ Deal ${action}d successfully!`);
    loadAllDeals();
    
  } catch (err) {
    console.error('Toggle deal status error:', err);
    alert('Failed to toggle deal status');
  }
}

// ============================================
// SALES ANALYTICS
// ============================================

async function loadSalesAnalytics() {
  try {
    const [dailyRes, weeklyRes] = await Promise.all([
      fetch(API + '/analytics/daily-sales', { headers }),
      fetch(API + '/analytics/weekly-sales', { headers })
    ]);
    
    const dailyData = await dailyRes.json();
    const weeklyData = await weeklyRes.json();
    
    renderDailySales(dailyData);
    renderWeeklySales(weeklyData);
    renderSalesSummary(dailyData, weeklyData);
    
  } catch (err) {
    console.error('Load sales analytics error:', err);
  }
}

function renderDailySales(data) {
  const chartEl = document.getElementById('daily-sales-chart');
  const tableEl = document.getElementById('daily-sales-table');
  
  if (!chartEl || !tableEl) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    chartEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No daily sales data available</p>';
    tableEl.innerHTML = '';
    return;
  }
  
  // Simple bar chart
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  chartEl.innerHTML = `
    <div class="bar-chart">
      ${data.map(d => {
        const height = maxRevenue > 0 ? (d.revenue / maxRevenue * 100) : 0;
        return `
          <div class="bar-item">
            <div class="bar" style="height: ${height}%;" title="$${d.revenue.toFixed(2)}">
              <span class="bar-value">$${d.revenue.toFixed(0)}</span>
            </div>
            <div class="bar-label">${new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Table
  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Orders</th>
          <th>Revenue</th>
          <th>Avg Order</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(d => `
          <tr>
            <td>${new Date(d.date).toLocaleDateString()}</td>
            <td>${d.orderCount}</td>
            <td>$${d.revenue.toFixed(2)}</td>
            <td>$${d.orderCount > 0 ? (d.revenue / d.orderCount).toFixed(2) : '0.00'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderWeeklySales(data) {
  const chartEl = document.getElementById('weekly-sales-chart');
  const tableEl = document.getElementById('weekly-sales-table');
  
  if (!chartEl || !tableEl) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    chartEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No weekly sales data available</p>';
    tableEl.innerHTML = '';
    return;
  }
  
  // Simple bar chart
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  chartEl.innerHTML = `
    <div class="bar-chart">
      ${data.map(d => {
        const height = maxRevenue > 0 ? (d.revenue / maxRevenue * 100) : 0;
        return `
          <div class="bar-item">
            <div class="bar" style="height: ${height}%;" title="$${d.revenue.toFixed(2)}">
              <span class="bar-value">$${d.revenue.toFixed(0)}</span>
            </div>
            <div class="bar-label">W${d.week}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Table
  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Week</th>
          <th>Year</th>
          <th>Orders</th>
          <th>Revenue</th>
          <th>Avg Order</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(d => `
          <tr>
            <td>Week ${d.week}</td>
            <td>${d.year}</td>
            <td>${d.orderCount}</td>
            <td>$${d.revenue.toFixed(2)}</td>
            <td>$${d.orderCount > 0 ? (d.revenue / d.orderCount).toFixed(2) : '0.00'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderSalesSummary(dailyData, weeklyData) {
  const summaryEl = document.getElementById('sales-summary');
  if (!summaryEl) return;
  
  const totalDailyRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalDailyOrders = dailyData.reduce((sum, d) => sum + d.orderCount, 0);
  const avgDailyRevenue = dailyData.length > 0 ? totalDailyRevenue / dailyData.length : 0;
  
  const totalWeeklyRevenue = weeklyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalWeeklyOrders = weeklyData.reduce((sum, d) => sum + d.orderCount, 0);
  const avgWeeklyRevenue = weeklyData.length > 0 ? totalWeeklyRevenue / weeklyData.length : 0;
  
  summaryEl.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon">📅</div>
        <div class="summary-content">
          <h4>Last 7 Days</h4>
          <p class="summary-value">$${totalDailyRevenue.toFixed(2)}</p>
          <p class="summary-meta">${totalDailyOrders} orders • Avg: $${avgDailyRevenue.toFixed(2)}/day</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">📈</div>
        <div class="summary-content">
          <h4>Last 8 Weeks</h4>
          <p class="summary-value">$${totalWeeklyRevenue.toFixed(2)}</p>
          <p class="summary-meta">${totalWeeklyOrders} orders • Avg: $${avgWeeklyRevenue.toFixed(2)}/week</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <h4>Average Order Value</h4>
          <p class="summary-value">$${totalDailyOrders > 0 ? (totalDailyRevenue / totalDailyOrders).toFixed(2) : '0.00'}</p>
          <p class="summary-meta">Based on last 7 days</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// CUSTOMER PURCHASE HISTORY
// ============================================

let allCustomersData = [];

async function loadCustomerPurchases(filters = {}) {
  try {
    const res = await fetch(API + '/master/customer-purchases', { headers });
    const data = await res.json();
    
    allCustomersData = data;
    renderCustomerList(data, filters);
    
  } catch (err) {
    console.error('Load customer purchases error:', err);
  }
}

function renderCustomerList(data, filters = {}) {
  const listEl = document.getElementById('customers-list');
  if (!listEl) return;
  
  if (!Array.isArray(data) || data.length === 0) {
    listEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No customer purchase data available</p>';
    return;
  }
  
  // Apply filters
  let filteredData = [...data];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.email.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let startDate = new Date();
    
    switch (filters.dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filteredData = filteredData.map(c => ({
      ...c,
      orders: c.orders.filter(o => new Date(o.createdAt) >= startDate),
      totalSpent: c.orders.filter(o => new Date(o.createdAt) >= startDate).reduce((sum, o) => sum + o.total, 0)
    })).filter(c => c.orders.length > 0);
  }
  
  // Sort by total spent (descending)
  filteredData.sort((a, b) => b.totalSpent - a.totalSpent);
  
  listEl.innerHTML = filteredData.map(customer => `
    <div class="customer-card">
      <div class="customer-header">
        <div class="customer-avatar">${customer.name.charAt(0).toUpperCase()}</div>
        <div class="customer-info">
          <h3>${customer.name}</h3>
          <p>${customer.email}</p>
        </div>
        <div class="customer-stats">
          <div class="stat">
            <span class="stat-value">$${customer.totalSpent.toFixed(2)}</span>
            <span class="stat-label">Total Spent</span>
          </div>
          <div class="stat">
            <span class="stat-value">${customer.orders.length}</span>
            <span class="stat-label">Orders</span>
          </div>
          <div class="stat">
            <span class="stat-value">${customer.points || 0}</span>
            <span class="stat-label">Points</span>
          </div>
        </div>
      </div>
      <div class="customer-orders">
        <h4>Recent Orders</h4>
        ${customer.orders.slice(0, 5).map(order => `
          <div class="order-item">
            <div class="order-info">
              <span class="order-id">#${order._id.substring(0, 8)}</span>
              <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="order-details">
              <span class="order-items">${order.items.length} item(s)</span>
              <span class="order-total">$${order.total.toFixed(2)}</span>
            </div>
            <button class="view-order-btn" onclick="viewOrderDetails('${order._id}')">View</button>
          </div>
        `).join('')}
        ${customer.orders.length > 5 ? `<p style="color: var(--muted); text-align: center; margin-top: 10px;">+ ${customer.orders.length - 5} more orders</p>` : ''}
      </div>
    </div>
  `).join('');
}

function viewOrderDetails(orderId) {
  // For now, just show an alert with order ID
  // You can expand this to show a modal with full order details
  alert(`Order Details: ${orderId}\n\nFull order detail modal can be implemented here.`);
}

// Apply filters button
document.getElementById('apply-filters')?.addEventListener('click', () => {
  const search = document.getElementById('search-customer').value.trim();
  const dateRange = document.getElementById('filter-date-range').value;
  
  renderCustomerList(allCustomersData, { search, dateRange });
});

// Real-time search
document.getElementById('search-customer')?.addEventListener('input', (e) => {
  const search = e.target.value.trim();
  const dateRange = document.getElementById('filter-date-range').value;
  
  renderCustomerList(allCustomersData, { search, dateRange });
});

// ============================================
// INITIALIZATION
// ============================================

loadAllProducts();
loadAllDeals();
loadSalesAnalytics();
loadCustomerPurchases();

// Logout
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
  logoutLink.onclick = () => { 
    localStorage.clear(); 
    location.href = '/'; 
  };
}

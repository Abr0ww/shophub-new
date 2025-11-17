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
  }, 2000); // Show for 2 seconds
});

function guardRole() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || (user.role !== 'admin' && user.role !== 'master')) location.href = '/';
}
guardRole();

// Tab Navigation
function setActiveAdminTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Update nav buttons
  document.querySelectorAll('.admin-bottom-nav .nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`.admin-bottom-nav .nav-item[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// Setup bottom nav click handlers
document.querySelectorAll('.admin-bottom-nav .nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    setActiveAdminTab(tab);
  });
});

// Image Upload Helper
let uploadedImages = {}; // Store uploaded image URLs by input ID

async function uploadImage(file, inputId) {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch(API + '/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    // Store the uploaded image URL
    uploadedImages[inputId] = data.imageUrl;
    
    // Show preview
    showImagePreview(inputId, data.imageUrl);
    
    return data.imageUrl;
  } catch (err) {
    console.error('Upload error:', err);
    alert('Failed to upload image: ' + err.message);
    return null;
  }
}

function showImagePreview(inputId, imageUrl) {
  const previewId = inputId + '-preview';
  const preview = document.getElementById(previewId);
  
  if (!preview) return;
  
  preview.innerHTML = `
    <img src="${imageUrl}" alt="Preview" />
    <button class="remove-image" onclick="removeImage('${inputId}')" type="button">×</button>
  `;
  preview.classList.add('active');
}

function removeImage(inputId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(inputId + '-preview');
  
  if (input) input.value = '';
  if (preview) {
    preview.innerHTML = '';
    preview.classList.remove('active');
  }
  
  delete uploadedImages[inputId];
}

// Setup file input handlers
function setupFileInputs() {
  ['o-image', 'p-image', 'd-image'].forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            input.value = '';
            return;
          }
          
          // Validate file size (5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            input.value = '';
            return;
          }
          
          await uploadImage(file, inputId);
        }
      });
    }
  });
}

// Call setup after DOM loads
setTimeout(setupFileInputs, 100);

// Offer banner load/save
async function loadOffer() {
  const res = await fetch(API + '/offer');
  const data = await res.json();
  
  // Show existing image if available
  if (data.imageUrl) {
    uploadedImages['o-image'] = data.imageUrl;
    showImagePreview('o-image', data.imageUrl);
  }
  
  document.getElementById('o-headline').value = data.headline || '';
  document.getElementById('o-subtext').value = data.subtext || '';
}

document.getElementById('save-offer').onclick = async () => {
  const imageUrl = uploadedImages['o-image'] || '';
  const headline = document.getElementById('o-headline').value.trim();
  const subtext = document.getElementById('o-subtext').value.trim();
  
  if (!imageUrl) {
    return alert('Please upload an image');
  }
  
  const res = await fetch(API + '/offer', { method: 'PUT', headers, body: JSON.stringify({ imageUrl, headline, subtext }) });
  const data = await res.json();
  if (!res.ok) return alert(data.message || 'Failed to save offer');
  alert('✅ Offer saved successfully!');
};

// Categories Management
async function loadCategoriesForDropdown() {
  try {
    const res = await fetch(API + '/categories');
    const categories = await res.json();
    
    const selectEl = document.getElementById('p-category');
    if (!selectEl) return;
    
    selectEl.innerHTML = '<option value="">Select Category (optional)</option>' +
      categories.map(cat => `<option value="${cat._id}">${cat.icon} ${cat.name}</option>`).join('');
    
  } catch (err) {
    console.error('Load categories error:', err);
  }
}

document.getElementById('create-category').onclick = async () => {
  const name = document.getElementById('c-name').value.trim();
  const icon = document.getElementById('c-icon').value.trim();
  const description = document.getElementById('c-desc').value.trim();
  const displayOrder = Number(document.getElementById('c-order').value || 0);
  
  if (!name) return alert('Category name is required');
  
  const res = await fetch(API + '/categories', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, icon: icon || '🍽️', description, displayOrder })
  });
  const data = await res.json();
  
  if (!res.ok) return alert(data.message || 'Failed to create category');
  
  alert('✨ Category created successfully!');
  
  // Clear form
  document.getElementById('c-name').value = '';
  document.getElementById('c-icon').value = '';
  document.getElementById('c-desc').value = '';
  document.getElementById('c-order').value = '';
  
  // Reload dropdown
  loadCategoriesForDropdown();
};

document.getElementById('create-product').onclick = async () => {
  const name = document.getElementById('p-name').value.trim();
  const imageUrl = uploadedImages['p-image'] || '';
  const price = Number(document.getElementById('p-price').value);
  const categoryId = document.getElementById('p-category').value;
  const offerPercent = Number(document.getElementById('p-offer').value || '0');
  const description = document.getElementById('p-desc').value;
  const tags = document.getElementById('p-tags').value.split(',').map(t => t.trim()).filter(t => t);
  
  // E-commerce fields
  const stock = Number(document.getElementById('p-stock').value || '0');
  const sku = document.getElementById('p-sku').value.trim();
  const brand = document.getElementById('p-brand').value.trim();
  const weight = document.getElementById('p-weight').value.trim();
  const dimensions = document.getElementById('p-dimensions').value.trim();
  const isAvailable = document.getElementById('p-available').checked;
  
  if (!name) {
    return alert('Please enter product name');
  }
  
  if (!imageUrl) {
    return alert('Please upload a product image');
  }
  
  if (!price || price <= 0) {
    return alert('Please enter a valid price');
  }
  
  const res = await fetch(API + '/products', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      imageUrl,
      price,
      categoryId: categoryId || null,
      description,
      offerPercent,
      tags,
      stock,
      sku,
      brand,
      weight,
      dimensions,
      isAvailable
    })
  });
  const data = await res.json();
  
  if (!res.ok) return alert(data.message || 'Failed');
  
  alert('✅ Product created successfully!');
  
  // Clear form
  document.getElementById('p-name').value = '';
  document.getElementById('p-image').value = '';
  document.getElementById('p-image-preview').innerHTML = '';
  uploadedImages['p-image'] = '';
  document.getElementById('p-price').value = '';
  document.getElementById('p-category').value = '';
  document.getElementById('p-offer').value = '';
  document.getElementById('p-desc').value = '';
  document.getElementById('p-tags').value = '';
  document.getElementById('p-stock').value = '0';
  document.getElementById('p-sku').value = '';
  document.getElementById('p-brand').value = '';
  document.getElementById('p-weight').value = '';
  document.getElementById('p-dimensions').value = '';
  document.getElementById('p-available').checked = true;
};

async function loadAnalytics() {
  const [dRes, wRes] = await Promise.all([
    fetch(API + '/analytics/daily-sales', { headers }),
    fetch(API + '/analytics/weekly-sales', { headers })
  ]);
  document.getElementById('daily-sales').textContent = JSON.stringify(await dRes.json(), null, 2);
  document.getElementById('weekly-sales').textContent = JSON.stringify(await wRes.json(), null, 2);
}

// Deals Management
async function loadDeals() {
  try {
    const res = await fetch(API + '/deals');
    const deals = await res.json();
    
    const dealsListEl = document.getElementById('deals-list');
    if (!dealsListEl) return;
    
    if (!Array.isArray(deals) || deals.length === 0) {
      dealsListEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No deals created yet.</p>';
      return;
    }
    
    dealsListEl.innerHTML = deals.map(deal => {
      const discountText = deal.discountType === 'percentage' 
        ? `${deal.discountValue}%` 
        : deal.discountType === 'fixed'
        ? `$${deal.discountValue}`
        : 'Free Item';
      
      const expiryText = deal.expiryDate 
        ? new Date(deal.expiryDate).toLocaleDateString()
        : 'No expiry';
      
      return `
        <div class="admin-deal-item">
          <img src="${deal.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop'}" 
               alt="${deal.title}" 
               class="admin-deal-image" />
          <div class="admin-deal-content">
            <h3 class="admin-deal-title">${deal.title}</h3>
            <p class="admin-deal-description">${deal.description}</p>
            <div class="admin-deal-meta">
              <div class="admin-deal-meta-item">
                <span>⭐</span>
                <strong>${deal.pointsCost} pts</strong>
              </div>
              <div class="admin-deal-meta-item">
                <span>💰</span>
                <strong>${discountText} OFF</strong>
              </div>
              <div class="admin-deal-meta-item">
                <span>🛒</span>
                <span>Min: $${deal.minOrderValue || 0}</span>
              </div>
              <div class="admin-deal-meta-item">
                <span>🔄</span>
                <span>Max uses: ${deal.maxUses}</span>
              </div>
              <div class="admin-deal-meta-item">
                <span>📅</span>
                <span>${expiryText}</span>
              </div>
              <span class="admin-deal-status ${deal.isActive ? 'active' : 'inactive'}">
                ${deal.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div class="admin-deal-actions">
            <button class="admin-deal-edit-btn" data-deal-id="${deal._id}">Edit</button>
            <button class="admin-deal-delete-btn" data-deal-id="${deal._id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');
    
    // Attach event handlers
    document.querySelectorAll('.admin-deal-edit-btn').forEach(btn => {
      btn.onclick = () => openEditDealModal(btn.dataset.dealId);
    });
    
    document.querySelectorAll('.admin-deal-delete-btn').forEach(btn => {
      btn.onclick = () => deleteAdminDeal(btn.dataset.dealId);
    });
    
  } catch (err) {
    console.error('Load deals error:', err);
  }
}

document.getElementById('create-deal').onclick = async () => {
  const title = document.getElementById('d-title').value.trim();
  const description = document.getElementById('d-description').value.trim();
  const imageUrl = uploadedImages['d-image'] || '';
  const pointsCost = Number(document.getElementById('d-points').value);
  const discountType = document.getElementById('d-type').value;
  const discountValue = Number(document.getElementById('d-value').value);
  const minOrderValue = Number(document.getElementById('d-min-order').value || 0);
  const maxUses = Number(document.getElementById('d-max-uses').value || 1);
  const expiryDate = document.getElementById('d-expiry').value;
  
  if (!title || !description || !pointsCost || !discountValue) {
    return alert('Please fill in all required fields (title, description, points cost, discount value)');
  }
  
  if (!imageUrl) {
    return alert('Please upload a deal image');
  }
  
  const dealData = {
    title,
    description,
    imageUrl,
    pointsCost,
    discountType,
    discountValue,
    minOrderValue,
    maxUses,
    expiryDate: expiryDate || undefined
  };
  
  try {
    const res = await fetch(API + '/deals', {
      method: 'POST',
      headers,
      body: JSON.stringify(dealData)
    });
    const data = await res.json();
    
    if (!res.ok) {
      return alert(data.message || 'Failed to create deal');
    }
    
    alert('✨ Deal created successfully!');
    
    // Clear form
    document.getElementById('d-title').value = '';
    document.getElementById('d-description').value = '';
    document.getElementById('d-image').value = '';
    document.getElementById('d-points').value = '';
    document.getElementById('d-value').value = '';
    document.getElementById('d-min-order').value = '';
    document.getElementById('d-max-uses').value = '';
    document.getElementById('d-expiry').value = '';
    
    // Reload deals list
    loadDeals();
    
  } catch (err) {
    console.error('Create deal error:', err);
    alert('Failed to create deal. Please try again.');
  }
};

async function editDeal(dealId) {
  // For now, just show a simple prompt-based edit
  const newTitle = prompt('Enter new title (or leave blank to keep current):');
  const newDescription = prompt('Enter new description (or leave blank to keep current):');
  const newPoints = prompt('Enter new points cost (or leave blank to keep current):');
  
  const updateData = {};
  if (newTitle && newTitle.trim()) updateData.title = newTitle.trim();
  if (newDescription && newDescription.trim()) updateData.description = newDescription.trim();
  if (newPoints && !isNaN(Number(newPoints))) updateData.pointsCost = Number(newPoints);
  
  if (Object.keys(updateData).length === 0) {
    return alert('No changes made');
  }
  
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
    loadDeals();
    
  } catch (err) {
    console.error('Update deal error:', err);
    alert('Failed to update deal. Please try again.');
  }
}

async function toggleDealStatus(dealId) {
  const confirmed = confirm('Are you sure you want to toggle this deal\'s status?');
  if (!confirmed) return;
  
  try {
    const res = await fetch(API + `/deals/${dealId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to toggle deal status');
    }
    
    alert('✅ Deal status updated!');
    loadDeals();
    
  } catch (err) {
    console.error('Toggle deal status error:', err);
    alert('Failed to toggle deal status. Please try again.');
  }
}

// Restaurant Settings Management
async function loadSettings() {
  try {
    const res = await fetch(API + '/settings');
    const settings = await res.json();
    
    // Load basic info
    document.getElementById('s-name').value = settings.restaurantName || '';
    document.getElementById('s-tagline').value = settings.tagline || '';
    document.getElementById('s-description').value = settings.description || '';
    document.getElementById('s-phone').value = settings.phone || '';
    document.getElementById('s-email').value = settings.email || '';
    document.getElementById('s-address').value = settings.address || '';
    
    // Load opening hours
    renderOpeningHours(settings.openingHours || []);
    
  } catch (err) {
    console.error('Load settings error:', err);
  }
}

function renderOpeningHours(hours) {
  const container = document.getElementById('opening-hours-list');
  if (!container) return;
  
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };
  
  container.innerHTML = hours.map(h => `
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <strong style="min-width: 100px;">${dayNames[h.day]}</strong>
        <label style="display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" ${h.isOpen ? 'checked' : ''} data-day="${h.day}" class="hours-open-checkbox" />
          Open
        </label>
        <input type="time" value="${h.openTime}" data-day="${h.day}" class="hours-open-time" style="padding: 6px;" ${!h.isOpen ? 'disabled' : ''} />
        <span>to</span>
        <input type="time" value="${h.closeTime}" data-day="${h.day}" class="hours-close-time" style="padding: 6px;" ${!h.isOpen ? 'disabled' : ''} />
        <span style="margin-left: 12px;">Last order:</span>
        <input type="time" value="${h.lastOrderTime}" data-day="${h.day}" class="hours-last-order-time" style="padding: 6px;" ${!h.isOpen ? 'disabled' : ''} />
        <button data-day="${h.day}" class="save-hours-btn" style="margin-left: auto;">Save</button>
      </div>
    </div>
  `).join('');
  
  // Attach handlers
  container.querySelectorAll('.hours-open-checkbox').forEach(checkbox => {
    checkbox.onchange = () => {
      const day = checkbox.dataset.day;
      const isOpen = checkbox.checked;
      container.querySelectorAll(`[data-day="${day}"]`).forEach(el => {
        if (el.classList.contains('hours-open-time') || 
            el.classList.contains('hours-close-time') || 
            el.classList.contains('hours-last-order-time')) {
          el.disabled = !isOpen;
        }
      });
    };
  });
  
  container.querySelectorAll('.save-hours-btn').forEach(btn => {
    btn.onclick = async () => {
      const day = btn.dataset.day;
      const isOpen = container.querySelector(`.hours-open-checkbox[data-day="${day}"]`).checked;
      const openTime = container.querySelector(`.hours-open-time[data-day="${day}"]`).value;
      const closeTime = container.querySelector(`.hours-close-time[data-day="${day}"]`).value;
      const lastOrderTime = container.querySelector(`.hours-last-order-time[data-day="${day}"]`).value;
      
      try {
        const res = await fetch(API + `/settings/hours/${day}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ isOpen, openTime, closeTime, lastOrderTime })
        });
        
        if (!res.ok) {
          const data = await res.json();
          return alert(data.message || 'Failed to update hours');
        }
        
        alert(`✅ ${day.charAt(0).toUpperCase() + day.slice(1)} hours updated!`);
        
      } catch (err) {
        console.error('Update hours error:', err);
        alert('Failed to update hours');
      }
    };
  });
}

document.getElementById('save-basic-settings').onclick = async () => {
  const restaurantName = document.getElementById('s-name').value.trim();
  const tagline = document.getElementById('s-tagline').value.trim();
  const description = document.getElementById('s-description').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const address = document.getElementById('s-address').value.trim();
  
  try {
    const res = await fetch(API + '/settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        restaurantName,
        tagline,
        description,
        phone,
        email,
        address
      })
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to save settings');
    }
    
    alert('✅ Restaurant settings saved!');
    
  } catch (err) {
    console.error('Save settings error:', err);
    alert('Failed to save settings');
  }
};

// Load all products for admin management
async function loadAdminProducts() {
  try {
    const res = await fetch(API + '/products');
    const products = await res.json();
    
    const listEl = document.getElementById('admin-products-list');
    if (!listEl) return;
    
    if (!Array.isArray(products) || products.length === 0) {
      listEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No products found.</p>';
      return;
    }
    
    listEl.innerHTML = products.map(p => `
      <div class="admin-product-item">
        <img src="${p.imageUrl || 'https://via.placeholder.com/80'}" alt="${p.name}" class="admin-product-img" />
        <div class="admin-product-info">
          <h4>${p.name}</h4>
          <p class="admin-product-price">$${p.price.toFixed(2)} ${p.offerPercent > 0 ? `<span class="discount">-${p.offerPercent}%</span>` : ''}</p>
          <p class="admin-product-meta">Stock: ${p.stock || 0} • SKU: ${p.sku || 'N/A'} • ${p.isAvailable ? '✅ Available' : '❌ Unavailable'}</p>
        </div>
        <div class="admin-product-actions">
          <button class="admin-edit-btn" onclick="openEditProductModal('${p._id}')">Edit</button>
          <button class="admin-delete-btn" onclick="deleteAdminProduct('${p._id}')">Delete</button>
        </div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Load admin products error:', err);
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
    loadAdminProducts();
    
  } catch (err) {
    console.error('Update product error:', err);
    alert('Failed to update product');
  }
}

async function deleteAdminProduct(productId) {
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
    loadAdminProducts();
    
  } catch (err) {
    console.error('Delete product error:', err);
    alert('Failed to delete product');
  }
}

// Deal edit/delete functions for admin
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
    loadDeals();
    
  } catch (err) {
    console.error('Update deal error:', err);
    alert('Failed to update deal');
  }
}

async function deleteAdminDeal(dealId) {
  if (!confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
    return;
  }
  
  try {
    const res = await fetch(API + `/deals/${dealId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || 'Failed to delete deal');
    }
    
    alert('✅ Deal deleted successfully!');
    loadDeals();
    
  } catch (err) {
    console.error('Delete deal error:', err);
    alert('Failed to delete deal');
  }
}

loadAnalytics();
loadOffer();
loadDeals();
loadCategoriesForDropdown();
loadSettings();
loadAdminProducts();

// Feedback Management
let currentFeedbackFilter = 'all';

async function loadFeedback(status = 'all') {
  try {
    const url = status === 'all' 
      ? API + '/feedback/all' 
      : API + `/feedback/all?status=${status}`;
    
    const res = await fetch(url, { headers });
    const feedback = await res.json();
    
    const listEl = document.getElementById('feedback-list');
    if (!listEl) return;
    
    if (feedback.length === 0) {
      listEl.innerHTML = '<p style="color: var(--muted); text-align: center;">No feedback found</p>';
      return;
    }
    
    listEl.innerHTML = feedback.map(f => `
      <div class="feedback-item">
        <div class="feedback-header">
          <span class="feedback-type ${f.type}">${f.type.toUpperCase()}</span>
          <span class="feedback-status ${f.status}">${f.status}</span>
        </div>
        <h3>${f.subject}</h3>
        <p class="feedback-message">${f.message}</p>
        <div class="feedback-meta">
          <span>From: ${f.userId?.name || 'Unknown'} (${f.userId?.email || 'N/A'})</span>
          <span>${new Date(f.createdAt).toLocaleString()}</span>
        </div>
        <div class="feedback-actions">
          <select class="feedback-status-select" data-id="${f._id}">
            <option value="pending" ${f.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="reviewed" ${f.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
            <option value="resolved" ${f.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <button class="delete-feedback-btn" data-id="${f._id}">Delete</button>
        </div>
      </div>
    `).join('');
    
    // Attach event listeners
    document.querySelectorAll('.feedback-status-select').forEach(select => {
      select.onchange = async (e) => {
        const id = e.target.dataset.id;
        const status = e.target.value;
        await updateFeedbackStatus(id, status);
      };
    });
    
    document.querySelectorAll('.delete-feedback-btn').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Delete this feedback?')) {
          await deleteFeedback(id);
        }
      };
    });
    
  } catch (err) {
    console.error('Load feedback error:', err);
  }
}

async function updateFeedbackStatus(id, status) {
  try {
    const res = await fetch(API + `/feedback/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    
    if (res.ok) {
      alert('✅ Status updated');
      loadFeedback(currentFeedbackFilter);
    }
  } catch (err) {
    console.error('Update feedback error:', err);
  }
}

async function deleteFeedback(id) {
  try {
    const res = await fetch(API + `/feedback/${id}`, {
      method: 'DELETE',
      headers
    });
    
    if (res.ok) {
      alert('✅ Feedback deleted');
      loadFeedback(currentFeedbackFilter);
    }
  } catch (err) {
    console.error('Delete feedback error:', err);
  }
}

// Feedback filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFeedbackFilter = btn.dataset.status;
    loadFeedback(currentFeedbackFilter);
  };
});

loadFeedback();

const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
  logoutLink.onclick = () => { localStorage.clear(); location.href = '/'; };
}



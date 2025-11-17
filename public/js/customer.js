const API = location.origin.replace(/\/$/, '') + '/api';
const token = localStorage.getItem('token');
const headers = token ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } : { 'Content-Type': 'application/json' };
const PLACEHOLDER_IMAGE = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ff7a00" offset="0"/><stop stop-color="#ff9f2d" offset="1"/></linearGradient></defs><rect fill="#0b0b0b" width="600" height="400"/><rect fill="url(#g)" opacity="0.32" width="600" height="400"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Segoe UI" font-size="54" fill="#ffffff">Foodie</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
})();
let POINT_VALUE = Number(window.POINT_VALUE || 0.5);

// Hide loading screen when page is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 2000); // Show for 2 seconds
});

function ensureImage(url) {
  if (!url || !url.trim()) return PLACEHOLDER_IMAGE;
  return url;
}

let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

function guardRole() {
  if (!currentUser || currentUser.role !== 'customer') location.href = '/';
}
guardRole();

let pointsAvailable = currentUser?.points || 0;
let pointsToRedeem = 0;
let latestCartSubtotal = 0;

const pointsChipEl = document.getElementById('points-chip');
const pointsCardEl = document.getElementById('points-card');
const pointsAvailableEl = document.getElementById('points-available');
const pointsSliderEl = document.getElementById('points-slider');
const pointsRedeemEl = document.getElementById('points-redeem-display');
const pointsDiscountEl = document.getElementById('points-discount-display');
const pointsMaxBtn = document.getElementById('points-max-btn');

const cart = new Map();
const productCache = new Map(); // Store full product info

function updateStoredUser(nextUser) {
  currentUser = { ...(currentUser || {}), ...nextUser };
  localStorage.setItem('user', JSON.stringify(currentUser));
  pointsAvailable = currentUser?.points || 0;
  renderPointsUI();
  loadProfileHeader();
}

function renderPointsUI() {
  if (pointsChipEl) pointsChipEl.textContent = `${pointsAvailable || 0} pts`;
  if (pointsAvailableEl) pointsAvailableEl.textContent = `${pointsAvailable || 0} pts`;
  updatePointsControls(latestCartSubtotal);
}

function updatePointsControls(subtotal) {
  if (!pointsCardEl) return;
  const hasPoints = pointsAvailable > 0;
  // Stripe requires minimum $0.50 USD payment
  const STRIPE_MIN_AMOUNT = 0.50;
  const maxRedeemable = Math.min(
    pointsAvailable,
    Math.floor(Math.max(subtotal - STRIPE_MIN_AMOUNT, 0) / POINT_VALUE)
  );

  if (!hasPoints) {
    pointsCardEl.classList.remove('active');
    pointsToRedeem = 0;
  } else {
    pointsCardEl.classList.add('active');
    const usable = subtotal > STRIPE_MIN_AMOUNT && maxRedeemable > 0;
    if (pointsSliderEl) {
      pointsSliderEl.max = usable ? maxRedeemable : 0;
      pointsSliderEl.value = usable ? Math.min(pointsToRedeem, maxRedeemable) : 0;
      pointsSliderEl.disabled = !usable;
    }
    if (pointsMaxBtn) pointsMaxBtn.disabled = !usable;
    if (!usable) pointsToRedeem = 0;
  }

  updatePointsLabels(subtotal);
}

function updatePointsLabels(subtotal) {
  const discount = Math.min(pointsToRedeem * POINT_VALUE, subtotal);
  if (pointsRedeemEl) pointsRedeemEl.textContent = `Redeem ${pointsToRedeem} pts`;
  if (pointsDiscountEl) pointsDiscountEl.textContent = discount > 0 ? `- $${discount.toFixed(2)}` : '- $0.00';
  if (pointsChipEl) pointsChipEl.textContent = `${pointsAvailable || 0} pts`;
  if (pointsAvailableEl) pointsAvailableEl.textContent = `${pointsAvailable || 0} pts`;
}

if (pointsSliderEl) {
  pointsSliderEl.addEventListener('input', () => {
    pointsToRedeem = Number(pointsSliderEl.value || 0);
    renderCart();
  });
}

if (pointsMaxBtn) {
  pointsMaxBtn.addEventListener('click', () => {
    if (!pointsSliderEl) return;
    pointsToRedeem = Number(pointsSliderEl.max || 0);
    renderCart();
  });
}

function attachAddToCartHandlers() {
  document.querySelectorAll('.actions button').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      // Find the full product to get image and description
      const fullProduct = productCache.get(id);
      
      const prev = cart.get(id) || {
        productId: id,
        name,
        price,
        quantity: 0,
        imageUrl: fullProduct?.imageUrl || PLACEHOLDER_IMAGE,
        description: fullProduct?.description || 'Chef special made fresh for you'
      };
      prev.quantity += 1;
      cart.set(id, prev);
      renderCart();
    };
  });
}

function renderCart() {
  const el = document.getElementById('cart');
  if (!el) return;
  const items = Array.from(cart.values());
  if (items.length === 0) {
    el.innerHTML = '<div class="cart-empty"><p>Your cart is empty</p><p class="hint">Add items from the menu to get started</p></div>';
    latestCartSubtotal = 0;
    pointsToRedeem = 0;
    updatePointsControls(0);
    return;
  }
  let total = 0;
  el.innerHTML = items.map((i, idx) => {
    const itemTotal = i.price * i.quantity;
    total += itemTotal;
    const product = productCache.get(i.productId) || {};
    const imageUrl = ensureImage(i.imageUrl || product.imageUrl);
    const description = i.description || product.description || 'Chef special made fresh for you';
    return `
      <div class="cart-item fade-in" data-idx="${idx}" data-product-id="${i.productId}">
        <img src="${imageUrl}" alt="${i.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-desc">${description}</div>
          <div class="cart-item-price-row">
            <span class="cart-item-price">$${i.price.toFixed(2)}</span>
            <span class="cart-item-qty">x${i.quantity}</span>
          </div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-remove" data-product-id="${i.productId}" aria-label="Remove">×</button>
          <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('') + (() => {
    const discount = Math.min(pointsToRedeem * POINT_VALUE, total);
    const payable = Math.max(total - discount, 0);
    return `
      <div class="cart-total">
        <div>
          <div class="cart-total-label">Total</div>
          ${discount > 0 ? `<div class="cart-total-savings">Saved $${discount.toFixed(2)} using points</div>` : ''}
        </div>
        <div class="cart-total-amount">$${payable.toFixed(2)}</div>
      </div>
    `;
  })();

  latestCartSubtotal = total;

  // Attach delete handlers
  el.querySelectorAll('.cart-remove').forEach(btn => {
    btn.onclick = () => {
      const productId = btn.dataset.productId;
      cart.delete(productId);
      renderCart();
    };
  });

  updatePointsControls(latestCartSubtotal);
}

function productCard(p) {
  const price = p.price * (1 - (p.offerPercent || 0)/100);
  const description = p.description && p.description.trim().length > 0 ? p.description : 'Premium quality product';
  const imageSrc = ensureImage(p.imageUrl);
  const inStock = p.stock === undefined || p.stock > 0;
  const rating = p.rating || 4.5; // Default rating for now
  
  return `
    <div class="product ${!inStock ? 'out-of-stock' : ''}" onclick="showProductDetail('${p._id}')" style="cursor: pointer;">
      <img src="${imageSrc}" alt="${p.name}" />
      ${!inStock ? '<div class="stock-badge">Out of Stock</div>' : ''}
      ${p.offerPercent ? `<div class="discount-badge">-${p.offerPercent}%</div>` : ''}
      <div class="content">
        <h4>${p.name}</h4>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5-Math.floor(rating))}</span>
          <span class="rating-value">${rating}</span>
        </div>
        <p>${description}</p>
      </div>
      <div class="actions">
        <div class="price-container">
          ${p.offerPercent ? `<span class="original-price">$${p.price.toFixed(2)}</span>` : ''}
          <div class="price">$${price.toFixed(2)}</div>
        </div>
        <button data-id="${p._id}" data-name="${p.name}" data-price="${price}" ${!inStock ? 'disabled' : ''} onclick="event.stopPropagation(); addToCartQuick(this)">
          ${inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  `;
}

// Quick add to cart from product card
function addToCartQuick(button) {
  const productId = button.dataset.id;
  const productName = button.dataset.name;
  const productPrice = parseFloat(button.dataset.price);
  
  if (cart.has(productId)) {
    const existingItem = cart.get(productId);
    cart.set(productId, { ...existingItem, quantity: existingItem.quantity + 1 });
  } else {
    const product = productCache.get(productId);
    cart.set(productId, {
      productId,
      name: productName,
      price: productPrice,
      imageUrl: product?.imageUrl || '',
      quantity: 1
    });
  }
  
  // Visual feedback
  button.textContent = '✓ Added!';
  button.style.background = 'linear-gradient(135deg, var(--success), var(--success))';
  setTimeout(() => {
    button.textContent = 'Add to Cart';
    button.style.background = '';
  }, 1000);
  
  renderCart();
}

// Show product detail modal
window.showProductDetail = async function(productId) {
  const product = productCache.get(productId);
  if (!product) {
    console.error('Product not found:', productId);
    return;
  }
  
  const modal = document.getElementById('product-detail-modal');
  const mainImage = document.getElementById('product-main-image');
  const nameEl = document.getElementById('product-detail-name');
  const starsEl = document.getElementById('product-detail-stars');
  const ratingValueEl = document.getElementById('product-detail-rating-value');
  const reviewCountEl = document.getElementById('product-detail-review-count');
  const originalPriceEl = document.getElementById('product-detail-original-price');
  const priceEl = document.getElementById('product-detail-price');
  const discountEl = document.getElementById('product-detail-discount');
  const stockEl = document.getElementById('product-detail-stock');
  const descriptionEl = document.getElementById('product-detail-description');
  const specsEl = document.getElementById('product-specs');
  const addToCartBtn = document.getElementById('add-to-cart-detail');
  
  // Populate modal
  mainImage.src = ensureImage(product.imageUrl);
  nameEl.textContent = product.name;
  
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 128;
  starsEl.textContent = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  ratingValueEl.textContent = `${rating}`;
  reviewCountEl.textContent = `(${reviewCount} reviews)`;
  
  const price = product.price * (1 - (product.offerPercent || 0) / 100);
  
  if (product.offerPercent) {
    originalPriceEl.textContent = `$${product.price.toFixed(2)}`;
    originalPriceEl.style.display = 'inline';
    discountEl.textContent = `-${product.offerPercent}%`;
    discountEl.style.display = 'inline-block';
  } else {
    originalPriceEl.style.display = 'none';
    discountEl.style.display = 'none';
  }
  
  priceEl.textContent = `$${price.toFixed(2)}`;
  
  const inStock = product.stock === undefined || product.stock > 0;
  if (inStock) {
    stockEl.textContent = product.stock ? `✓ In Stock (${product.stock} available)` : '✓ In Stock';
    stockEl.className = 'product-detail-stock in-stock';
    addToCartBtn.disabled = false;
  } else {
    stockEl.textContent = '✗ Out of Stock';
    stockEl.className = 'product-detail-stock out-of-stock';
    addToCartBtn.disabled = true;
  }
  
  descriptionEl.textContent = product.description || 'Premium quality product';
  
  // Product specifications
  const specs = [];
  if (product.brand) specs.push({ label: 'Brand', value: product.brand });
  if (product.sku) specs.push({ label: 'SKU', value: product.sku });
  if (product.weight) specs.push({ label: 'Weight', value: product.weight });
  if (product.dimensions) specs.push({ label: 'Dimensions', value: product.dimensions });
  if (product.categoryId?.name) specs.push({ label: 'Category', value: product.categoryId.name });
  
  if (specs.length > 0) {
    specsEl.innerHTML = `
      <h3>Specifications</h3>
      ${specs.map(spec => `
        <div class="spec-row">
          <span class="spec-label">${spec.label}</span>
          <span class="spec-value">${spec.value}</span>
        </div>
      `).join('')}
    `;
    specsEl.style.display = 'block';
  } else {
    specsEl.style.display = 'none';
  }
  
  // Add to cart button
  addToCartBtn.onclick = function() {
    if (cart.has(productId)) {
      const existingItem = cart.get(productId);
      cart.set(productId, { ...existingItem, quantity: existingItem.quantity + 1 });
    } else {
      cart.set(productId, {
        productId,
        name: product.name,
        price: price,
        imageUrl: product.imageUrl,
        quantity: 1
      });
    }
    
    addToCartBtn.textContent = '✓ Added to Cart!';
    addToCartBtn.style.background = 'linear-gradient(135deg, var(--success), var(--success))';
    setTimeout(() => {
      addToCartBtn.textContent = 'Add to Cart';
      addToCartBtn.style.background = '';
    }, 1500);
    
    renderCart();
  };
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Close product detail modal
document.getElementById('close-product-detail')?.addEventListener('click', function() {
  const modal = document.getElementById('product-detail-modal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
});

// Close modal when clicking outside
document.getElementById('product-detail-modal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
    document.body.style.overflow = '';
  }
});

const dummyCatalog = [
  { _id: 'd1', name: 'Classic Burger', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop', price: 8.99, description: 'Beef, cheddar, lettuce, tomato.', offerPercent: 10 },
  { _id: 'd2', name: 'Margherita Pizza', imageUrl: 'https://images.unsplash.com/photo-1548365328-9f547fb09530?q=80&w=1200&auto=format&fit=crop', price: 12.5, description: 'Tomato, mozzarella, basil.', offerPercent: 0 },
  { _id: 'd3', name: 'Chicken Wrap', imageUrl: 'https://images.unsplash.com/photo-1604908554037-8d9777bdf35f?q=80&w=1200&auto=format&fit=crop', price: 7.5, description: 'Grilled chicken, veggies, sauce.', offerPercent: 15 },
  { _id: 'd4', name: 'Sushi Platter', imageUrl: 'https://images.unsplash.com/photo-1542528180-a1208c5169a6?q=80&w=1200&auto=format&fit=crop', price: 18.0, description: 'Assorted fresh rolls.', offerPercent: 0 },
  { _id: 'd5', name: 'Pasta Alfredo', imageUrl: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop', price: 11.0, description: 'Creamy parmesan sauce.', offerPercent: 5 },
  { _id: 'd6', name: 'Vegan Salad Bowl', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop', price: 9.0, description: 'Greens, quinoa, chickpeas.', offerPercent: 0 }
];

async function loadProductsByCategory() {
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(API + '/categories'),
      fetch(API + '/products')
    ]);
    
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];
    const allProducts = productsRes.ok ? await productsRes.json() : [];
    
    const menuContainer = document.getElementById('menu-by-category');
    if (!menuContainer) return;
    
    if (categories.length === 0 || allProducts.length === 0) {
      menuContainer.innerHTML = '<p style="color: var(--muted); text-align: center;">No products available</p>';
      return;
    }
    
    // Group products by category
    const productsByCategory = {};
    allProducts.forEach(product => {
      if (product.categoryId && product.categoryId._id) {
        const catId = product.categoryId._id;
        if (!productsByCategory[catId]) {
          productsByCategory[catId] = [];
        }
        productsByCategory[catId].push(product);
      }
    });
    
    // Render each category section
    menuContainer.innerHTML = categories.map(category => {
      const products = productsByCategory[category._id] || [];
      
      if (products.length === 0) return ''; // Skip empty categories
      
      // Cache products for cart
      products.forEach(p => {
        productCache.set(p._id, {
          ...p,
          imageUrl: ensureImage(p.imageUrl),
          description: p.description && p.description.trim().length ? p.description : 'Chef special made fresh for you'
        });
      });
      
      return `
        <div class="category-section">
          <div class="category-section-header">
            <span class="category-section-icon">${category.icon}</span>
            <h3 class="category-section-title">${category.name}</h3>
            <span class="category-section-description">${category.description}</span>
          </div>
          <div class="grid">
            ${products.map(productCard).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    attachAddToCartHandlers();
    
    // Animate products
    document.querySelectorAll('.product').forEach((card, i) => {
      setTimeout(() => card.classList.add('animate-in'), 40 * i);
    });
    
  } catch (err) {
    console.error('Load products by category error:', err);
  }
}

async function loadProducts() {
  try {
    // Load deals to show in offers section
    const dealsRes = await fetch(API + '/deals', { headers });
    let deals = dealsRes.ok ? await dealsRes.json() : [];
    if (!Array.isArray(deals)) deals = [];
    
    // Filter only active deals and map to offer format
    const activeDeals = deals
      .filter(d => d.isActive)
      .map(d => ({
        ...d,
        imageUrl: ensureImage(d.imageUrl),
        name: d.title,
        offerPercent: d.discountType === 'percentage' ? d.discountValue : null,
        offerText: d.discountType === 'fixed' ? `$${d.discountValue} OFF` : null
      }));
    
    // Show deals in offers section
    setupDealsShow(activeDeals);
  } catch (e) {
    console.error('Failed to load offers:', e);
  }

  // Load products organized by category
  loadProductsByCategory();
}

// Deals slideshow effect for offers section
let offerTimer;
function setupDealsShow(deals) {
  const host = document.getElementById('offers');
  if (!host) return;
  if (!Array.isArray(deals) || deals.length === 0) {
    host.classList.remove('offer-show');
    host.innerHTML = `<div class="offer-placeholder">No active deals</div>`;
    if (offerTimer) { clearInterval(offerTimer); offerTimer = null; }
    return;
  }
  host.classList.add('offer-show');
  let idx = 0;
  const bannerHTML = (deal) => {
    const displayText = deal.offerPercent 
      ? `-${deal.offerPercent}% OFF` 
      : deal.offerText 
      ? deal.offerText 
      : 'SPECIAL DEAL';
    const pointsText = `${deal.pointsCost} Points`;
    
    return `
      <div class="offer-banner fade-in" style="cursor: pointer;" onclick="setActiveTab('deals')">
        <div class="img" style="background-image:url('${deal.imageUrl}')"></div>
        <div class="overlay">
          <div class="text">${displayText}<div class="sub">${deal.name}</div><div class="points-badge">${pointsText}</div></div>
        </div>
      </div>
    `;
  };
  const render = () => {
    host.innerHTML = bannerHTML(deals[idx]);
    idx = (idx + 1) % deals.length;
  };
  render();
  if (offerTimer) clearInterval(offerTimer);
  offerTimer = setInterval(render, 3000);
}

// Admin-defined single banner renderer
function setupOfferBanner(cfg) {
  const host = document.getElementById('offers');
  if (!host) return;
  host.classList.add('offer-show');
  const safeHeadline = cfg.headline && cfg.headline.trim().length ? cfg.headline : '(offer image)';
  const safeSub = cfg.subtext || '';
  const background = ensureImage(cfg.imageUrl);
  host.innerHTML = `
    <div class="offer-banner fade-in" style="cursor: pointer;" onclick="document.getElementById('nav-deals').click()">
      <div class="img" style="background-image:url('${background}')"></div>
      <div class="overlay">
        <div class="text">${safeHeadline}<div class="sub">${safeSub}</div></div>
      </div>
    </div>
  `;
}

// Stripe payment integration
let stripe = null;
let elements = null;
let paymentElement = null;
let currentPaymentIntent = null;

async function initializeStripe() {
  if (stripe) return; // Already initialized
  if (typeof Stripe === 'undefined') {
    throw new Error('Stripe.js not loaded');
  }
  
  // Fetch publishable key from backend
  try {
    const res = await fetch(API + '/config/stripe-key');
    const data = await res.json();
    if (typeof data.pointValue === 'number') {
      POINT_VALUE = Number(data.pointValue);
      window.POINT_VALUE = POINT_VALUE;
      updatePointsControls(latestCartSubtotal);
    }
    const publishableKey = data.publishableKey || 'pk_test_51QYourKeyHere';
    stripe = Stripe(publishableKey);
  } catch (err) {
    console.error('Failed to fetch Stripe key:', err);
    // Fallback to placeholder (will fail in production but allows development)
    stripe = Stripe('pk_test_51QYourKeyHere');
  }
}

async function initializePayment() {
  const items = Array.from(cart.values()).map(i => ({ productId: i.productId, quantity: i.quantity }));
  if (items.length === 0) return alert('Cart is empty');
  
  await initializeStripe();
  
  try {
    // Create payment intent
    const res = await fetch(API + '/payment/create-intent', {
      method: 'POST',
      headers,
      body: JSON.stringify({ items, pointsToRedeem })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Payment intent error:', data);
      // Handle token expiration
      if (res.status === 401 || data.message === 'Invalid token') {
        alert('Your session has expired. Please login again.');
        localStorage.clear();
        window.location.href = '/';
        return;
      }
      return alert(data.message || 'Failed to create payment');
    }
    
    currentPaymentIntent = {
      clientSecret: data.clientSecret,
      items,
      amount: data.amount,
      pointsApplied: data.pointsApplied || 0,
      discount: data.discount || 0
    };
    
    // Initialize payment element (Australia-only)
    console.log('Creating Stripe elements with client secret...');
    elements = stripe.elements({ 
      clientSecret: data.clientSecret,
      locale: 'en-AU'
    });
    
    console.log('Creating payment element...');
    paymentElement = elements.create('payment', {
      layout: 'tabs',
      defaultValues: {
        billingDetails: {
          address: {
            country: 'AU'
          }
        }
      }
    });
    
    console.log('Mounting payment element...');
    paymentElement.mount('#payment-element');
    console.log('Payment element mounted successfully');
    
    // Show payment section, hide order button
    document.getElementById('payment-section').style.display = 'block';
    document.getElementById('order-btn').style.display = 'none';
    const paymentButtonsWrap = document.querySelector('.payment-buttons');
    if (paymentButtonsWrap) paymentButtonsWrap.style.display = 'grid';
    ['google-pay-container', 'apple-pay-container', 'paypal-container'].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = '';
        container.style.display = 'flex';
      }
    });
    
    // Setup payment method buttons
    setupPaymentMethodButtons();
  } catch (err) {
    console.error('Payment initialization error:', err);
    console.error('Error details:', err.message, err.stack);
    alert('Failed to initialize payment: ' + err.message + '\n\nPlease refresh the page and try again.');
    document.getElementById('order-btn').style.display = 'block';
  }
}

async function setupPaymentMethodButtons() {
  if (!stripe || !elements) return;
  const buttonsWrap = document.querySelector('.payment-buttons');
  try {
    const paymentRequest = stripe.paymentRequest({
      country: 'AU',
      currency: 'aud',
      total: {
        label: 'Total',
        amount: Math.round((currentPaymentIntent?.amount || 0) * 100)
      },
      requestPayerName: true,
      requestPayerEmail: true
    });

    const canMakePayment = await paymentRequest.canMakePayment();
    if (!canMakePayment) {
      if (buttonsWrap) buttonsWrap.style.display = 'none';
      return;
    }

    if (canMakePayment.googlePay) {
      const googlePay = elements.create('googlePay', {
        paymentRequest,
        buttonType: 'pay'
      });
      googlePay.mount('#google-pay-container');
    } else {
      const container = document.getElementById('google-pay-container');
      if (container) container.style.display = 'none';
    }

    if (canMakePayment.applePay) {
      const applePay = elements.create('applePay', {
        paymentRequest,
        buttonType: 'pay'
      });
      applePay.mount('#apple-pay-container');
    } else {
      const container = document.getElementById('apple-pay-container');
      if (container) container.style.display = 'none';
    }

    const paypal = elements.create('paypal', {
      paymentRequest,
      buttonType: 'pay'
    });
    try {
      paypal.mount('#paypal-container');
    } catch (e) {
      const container = document.getElementById('paypal-container');
      if (container) container.style.display = 'none';
    }
  } catch (err) {
    console.error('Payment method setup error:', err);
    if (buttonsWrap) buttonsWrap.style.display = 'none';
  }
}

async function handlePayment() {
  if (!stripe || !currentPaymentIntent) {
    console.error('Stripe or payment intent not initialized');
    alert('Payment system not ready. Please try again.');
    return;
  }
  
  const payBtn = document.getElementById('pay-btn');
  payBtn.disabled = true;
  payBtn.textContent = 'Processing...';
  
  try {
    console.log('Confirming payment...');
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/customer.html?payment=success'
      },
      redirect: 'if_required'
    });

    if (error) {
      console.error('Payment error details:', error);
      alert('Payment failed: ' + error.message + '\n\nPlease check:\n- Card number is correct\n- Expiry date is in the future\n- CVC is 3 digits');
      payBtn.disabled = false;
      payBtn.textContent = 'Pay Now';
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      const res = await fetch(API + '/payment/confirm', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          items: currentPaymentIntent.items
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.message || 'Order confirmation failed');
        payBtn.disabled = false;
        payBtn.textContent = 'Pay Now';
        return;
      }

      // Show order success section with delivery platforms
      showOrderSuccess(data);
      
      cart.clear();
      pointsToRedeem = 0;
      if (typeof data.newPoints === 'number') {
        updateStoredUser({ points: data.newPoints });
      }
      resetPaymentUI();
      renderCart();
    }
  } catch (err) {
    console.error('Payment error:', err);
    alert('Payment failed. Please try again.');
    payBtn.disabled = false;
    payBtn.textContent = 'Pay Now';
  }
}

function resetPaymentUI() {
  if (paymentElement) {
    paymentElement.unmount();
    paymentElement = null;
  }
  elements = null;
  currentPaymentIntent = null;
  const section = document.getElementById('payment-section');
  if (section) section.style.display = 'none';
  const orderBtn = document.getElementById('order-btn');
  if (orderBtn) orderBtn.style.display = 'block';
  pointsToRedeem = 0;
  if (pointsSliderEl) pointsSliderEl.value = 0;
  renderCart();
}

// Store the current order ID for delivery platform selection
let currentOrderId = null;

// Show order success section with delivery platforms
function showOrderSuccess(data) {
  const successSection = document.getElementById('order-success-section');
  const successMessage = document.getElementById('order-success-message');
  const cartSection = document.getElementById('cart');
  const pointsCard = document.getElementById('points-card');
  const orderBtn = document.getElementById('order-btn');
  
  if (successSection && successMessage) {
    // Store order ID for later platform selection
    currentOrderId = data.orderId;
    
    // Update success message
    const pointsText = data.pointsEarned > 0 
      ? `You earned ${data.pointsEarned} points!` 
      : '';
    const spentText = data.pointsSpent > 0 
      ? ` You spent ${data.pointsSpent} points.` 
      : '';
    successMessage.textContent = `${pointsText}${spentText}`;
    
    // Hide cart elements and show success section
    if (cartSection) cartSection.style.display = 'none';
    if (pointsCard) pointsCard.style.display = 'none';
    if (orderBtn) orderBtn.style.display = 'none';
    successSection.style.display = 'block';
    
    // Reset delivery platform selection
    document.querySelectorAll('.delivery-option-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.getElementById('delivery-selection-note').style.display = 'none';
    
    // No longer needed - we use shipping options instead of external platforms
    // loadDeliveryPlatformURLs();
  }
}

// Select delivery platform
window.selectDeliveryPlatform = async function(platform) {
  if (!currentOrderId) {
    alert('Order ID not found. Please try again.');
    return;
  }
  
  // Update UI
  document.querySelectorAll('.delivery-option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  const selectedBtn = document.querySelector(`.delivery-option-btn[data-platform="${platform}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }
  
  // Update order in database
  try {
    const res = await fetch(`${API}/orders/${currentOrderId}/delivery-platform`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ deliveryPlatform: platform })
    });
    
    if (!res.ok) {
      throw new Error('Failed to update delivery platform');
    }
    
    // Show confirmation
    const platformNames = {
      pickup: 'Store Pickup',
      standard: 'Standard Shipping',
      express: 'Express Shipping',
      overnight: 'Overnight Delivery'
    };
    
    const platformActions = {
      pickup: 'Your order will be ready for pickup soon! We\'ll notify you.',
      standard: 'Your order will be shipped in 5-7 business days.',
      express: 'Your order will be shipped in 2-3 business days.',
      overnight: 'Your order will be shipped next day!'
    };
    
    document.getElementById('selected-platform-name').textContent = platformNames[platform];
    document.getElementById('platform-action-text').textContent = platformActions[platform];
    document.getElementById('delivery-selection-note').style.display = 'block';
  } catch (err) {
    console.error('Error updating delivery platform:', err);
    alert('Failed to update delivery preference. Please try again.');
  }
}

// Continue shopping after order
window.continueShoppingAfterOrder = function() {
  const successSection = document.getElementById('order-success-section');
  const cartSection = document.getElementById('cart');
  const pointsCard = document.getElementById('points-card');
  const orderBtn = document.getElementById('order-btn');
  
  // Hide success section and show cart elements
  if (successSection) successSection.style.display = 'none';
  if (cartSection) cartSection.style.display = 'block';
  if (pointsCard) pointsCard.style.display = 'block';
  if (orderBtn) orderBtn.style.display = 'block';
  
  // Navigate to menu tab
  setActiveTab('menu');
}

document.getElementById('order-btn').onclick = initializePayment;
document.getElementById('pay-btn').onclick = handlePayment;
document.getElementById('cancel-payment').onclick = resetPaymentUI;

// Check for payment success redirect
if (window.location.search.includes('payment=success')) {
  window.history.replaceState({}, '', '/customer.html');
  alert('Payment successful! Order confirmed.');
}

loadProducts();

// bottom nav handling
const tabs = {
  menu: document.getElementById('tab-menu'),
  order: document.getElementById('tab-order'),
  deals: document.getElementById('tab-deals'),
  profile: document.getElementById('tab-profile')
};

function setActiveTab(name) {
  Object.entries(tabs).forEach(([key, el]) => {
    if (!el) return;
    if (key === name) el.classList.add('active'); else el.classList.remove('active');
  });
  document.querySelectorAll('.bottom-nav .nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  if (name === 'order') renderCart();
}

document.querySelectorAll('.bottom-nav .nav-btn').forEach(btn => {
  btn.onclick = () => setActiveTab(btn.dataset.tab);
});

// Deals uses offers list
async function loadDeals() {
  try {
    // Load points-based deals
    const res = await fetch(API + '/deals');
    const deals = res.ok ? await res.json() : [];
    
    const dealsGrid = document.getElementById('deals-grid');
    if (!dealsGrid) return;
    
    if (deals.length === 0) {
      dealsGrid.innerHTML = `
        <div class="empty-deals">
          <div class="empty-deals-icon">🎁</div>
          <p>No deals available right now. Check back soon!</p>
        </div>
      `;
      return;
    }
    
    dealsGrid.innerHTML = deals.map(deal => {
      const canAfford = pointsAvailable >= deal.pointsCost;
      const discountText = deal.discountType === 'percentage' 
        ? `${deal.discountValue}% OFF` 
        : deal.discountType === 'fixed'
        ? `$${deal.discountValue} OFF`
        : 'FREE ITEM';
      
      return `
        <div class="deal-card" data-deal-id="${deal._id}">
          <img src="${ensureImage(deal.imageUrl)}" alt="${deal.title}" class="deal-card-image" />
          <div class="deal-badge">${discountText}</div>
          <div class="deal-card-content">
            <h3 class="deal-card-title">${deal.title}</h3>
            <p class="deal-card-description">${deal.description}</p>
            ${deal.minOrderValue > 0 ? `<p class="deal-card-description">Min. order: $${deal.minOrderValue}</p>` : ''}
            <div class="deal-card-footer">
              <div class="deal-points-cost">
                <span>⭐</span>
                <span>${deal.pointsCost} pts</span>
              </div>
              <button 
                class="deal-redeem-btn" 
                data-deal-id="${deal._id}"
                ${!canAfford ? 'disabled' : ''}
              >
                ${canAfford ? 'Redeem' : 'Not Enough'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Attach redeem handlers
    document.querySelectorAll('.deal-redeem-btn').forEach(btn => {
      btn.onclick = async () => {
        const dealId = btn.dataset.dealId;
        await redeemDeal(dealId);
      };
    });
    
  } catch (e) {
    console.error('Load deals error:', e);
    const dealsGrid = document.getElementById('deals-grid');
    if (dealsGrid) {
      dealsGrid.innerHTML = `
        <div class="empty-deals">
          <div class="empty-deals-icon">⚠️</div>
          <p>Failed to load deals. Please try again later.</p>
        </div>
      `;
    }
  }
  
  // Load user's redeemed deals
  loadMyDeals();
}

async function redeemDeal(dealId) {
  try {
    const res = await fetch(API + `/deals/redeem/${dealId}`, {
      method: 'POST',
      headers
    });
    const data = await res.json();
    
    if (!res.ok) {
      return alert(data.message || 'Failed to redeem deal');
    }
    
    alert(`✨ ${data.message}\n\nPoints remaining: ${data.pointsRemaining}`);
    
    // Update user points
    updateStoredUser({ points: data.pointsRemaining });
    
    // Reload deals to update UI
    loadDeals();
    
  } catch (err) {
    console.error('Redeem deal error:', err);
    alert('Failed to redeem deal. Please try again.');
  }
}

async function loadMyDeals() {
  try {
    const res = await fetch(API + '/deals/my-deals', { headers });
    const userDeals = res.ok ? await res.json() : [];
    
    const myDealsEl = document.getElementById('my-deals');
    if (!myDealsEl) return;
    
    if (userDeals.length === 0) {
      myDealsEl.innerHTML = `
        <div class="empty-deals">
          <div class="empty-deals-icon">📦</div>
          <p>You haven't redeemed any deals yet.</p>
        </div>
      `;
      return;
    }
    
    myDealsEl.innerHTML = userDeals.map(userDeal => {
      const deal = userDeal.dealId;
      const expiresAt = userDeal.expiresAt ? new Date(userDeal.expiresAt).toLocaleDateString() : 'No expiry';
      const usesLeft = deal.maxUses - userDeal.usedCount;
      
      return `
        <div class="my-deal-item">
          <div class="my-deal-info">
            <h4 class="my-deal-title">${deal.title}</h4>
            <p class="my-deal-meta">Expires: ${expiresAt} • Uses left: ${usesLeft}</p>
          </div>
          <div class="my-deal-status">Active</div>
        </div>
      `;
    }).join('');
    
  } catch (e) {
    console.error('Load my deals error:', e);
  }
}

// Profile details + history
function loadProfileHeader() {
  const nameEl = document.getElementById('user-name');
  if (!nameEl) return;
  nameEl.textContent = currentUser?.name || '';
  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = currentUser?.email || '';
  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = currentUser?.role || '';
  const pointsEl = document.getElementById('user-points');
  if (pointsEl) pointsEl.textContent = currentUser?.points ?? '-';
}

async function loadOrderHistory() {
  const container = document.getElementById('orders');
  if (!container) return;
  if (currentUser?.role !== 'customer') { container.innerHTML = '<p>Only customers have order history.</p>'; return; }
  const res = await fetch(API + '/orders/my', { headers });
  const data = await res.json();
  if (data.length === 0) {
    container.innerHTML = `<div class="orders-dummy" id="orders-dummy"></div>`;
    startDummyOrders();
    return;
  }
  container.innerHTML = data.map(o => {
    const platformNames = {
      pickup: '📍 Store Pickup',
      standard: '📦 Standard Shipping',
      express: '⚡ Express Shipping',
      overnight: '🚀 Overnight Delivery',
      none: '📦 Not selected'
    };
    const deliveryText = o.deliveryPlatform ? platformNames[o.deliveryPlatform] || '📦 Not selected' : '📦 Not selected';
    
    return `
      <div class="card">
        <div><strong>Order:</strong> ${o._id}</div>
        <div><strong>Date:</strong> ${new Date(o.createdAt).toLocaleString()}</div>
        <div><strong>Total Paid:</strong> $${o.total.toFixed(2)}${o.discount ? ` <span class="cart-total-savings">(Saved $${o.discount.toFixed(2)})</span>` : ''}</div>
        <div><strong>Delivery:</strong> ${deliveryText}</div>
        <div>${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
      </div>
    `;
  }).join('');
}

// Dummy dynamic order cards (animated) when no orders exist
const dummyItems = [
  ['Classic Burger', 'Fries'],
  ['Margherita Pizza', 'Cola'],
  ['Chicken Wrap', 'Iced Tea'],
  ['Sushi Platter'],
  ['Pasta Alfredo', 'Garlic Bread']
];
const statuses = ['Preparing', 'Cooking', 'On the way', 'Delivered'];
let dummyTick = 0;
function renderDummyOrders() {
  const host = document.getElementById('orders-dummy');
  if (!host) return;
  const cards = new Array(4).fill(0).map((_, idx) => {
    const items = dummyItems[(idx + dummyTick) % dummyItems.length];
    const status = statuses[(idx + Math.floor(dummyTick/2)) % statuses.length];
    const id = '#D' + String(1000 + ((idx + dummyTick) % 9000));
    return `
      <div class="order-card">
        <div class="title">Order ${id}</div>
        <div class="meta">${new Date(Date.now() - (idx * 3600e3)).toLocaleString()}</div>
        <div>${items.join(', ')}</div>
        <div class="status">${status}</div>
      </div>
    `;
  }).join('');
  host.innerHTML = cards;
}
let dummyTimer;
function startDummyOrders() {
  stopDummyOrders();
  renderDummyOrders();
  dummyTimer = setInterval(() => { dummyTick++; renderDummyOrders(); }, 2000);
}
function stopDummyOrders() { if (dummyTimer) { clearInterval(dummyTimer); dummyTimer = null; } }

// Logout via profile tab button only
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) { logoutBtn.onclick = () => { localStorage.clear(); location.href = '/'; }; }

// Delivery Platform Integration
let deliveryPlatformURLs = {
  ubereats: 'https://www.ubereats.com/au',
  menulog: 'https://www.menulog.com.au/',
  doordash: 'https://www.doordash.com/en-AU'
};

const platformNames = {
  pickup: 'Store Pickup',
  standard: 'Standard Shipping',
  express: 'Express Shipping',
  overnight: 'Overnight Delivery'
};

// Load platform URLs from backend
async function loadDeliveryPlatformURLs() {
  try {
    const res = await fetch(API + '/delivery-platforms');
    const data = await res.json();
    if (res.ok && data.isEnabled !== false) {
      deliveryPlatformURLs = {
        ubereats: data.ubereats,
        menulog: data.menulog,
        doordash: data.doordash
      };
    }
  } catch (err) {
    console.error('Failed to load delivery platform URLs:', err);
  }
}

// Load URLs on page load - no longer needed for shipping options
// loadDeliveryPlatformURLs();

function openDeliveryPlatform(platform) {
  const url = deliveryPlatformURLs[platform];
  const name = platformNames[platform];
  
  if (!url) {
    console.error('Unknown platform:', platform);
    alert('Delivery platform URL not configured. Please contact support.');
    return;
  }
  
  // Open in a popup window (better for logged-in users)
  const width = 800;
  const height = 900;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  
  const popup = window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=yes`
  );
  
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // Popup was blocked
    alert(`Popup blocked! Please allow popups for this site to open ${name}.\n\nAlternatively, you can visit:\n${url}`);
  } else {
    popup.focus();
  }
}

// Close delivery browser
const deliveryBrowserClose = document.getElementById('delivery-browser-close');
const deliveryBrowserBack = document.getElementById('delivery-browser-back');
const deliveryBrowserModal = document.getElementById('delivery-browser-modal');
const deliveryBrowserFrame = document.getElementById('delivery-browser-frame');

if (deliveryBrowserClose) {
  deliveryBrowserClose.onclick = () => {
    if (deliveryBrowserModal) {
      deliveryBrowserModal.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (deliveryBrowserFrame) {
      deliveryBrowserFrame.src = 'about:blank';
    }
  };
}

if (deliveryBrowserBack) {
  deliveryBrowserBack.onclick = () => {
    if (deliveryBrowserModal) {
      deliveryBrowserModal.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (deliveryBrowserFrame) {
      deliveryBrowserFrame.src = 'about:blank';
    }
  };
}

// Feedback/Helpline Modal
const helplineBtn = document.getElementById('helpline-btn');
const feedbackModal = document.getElementById('feedback-modal');
const closeFeedbackModal = document.getElementById('close-feedback-modal');
const feedbackForm = document.getElementById('feedback-form');

if (helplineBtn) {
  helplineBtn.onclick = () => {
    feedbackModal.style.display = 'flex';
  };
}

if (closeFeedbackModal) {
  closeFeedbackModal.onclick = () => {
    feedbackModal.style.display = 'none';
  };
}

// Close modal when clicking outside
window.onclick = (event) => {
  if (event.target === feedbackModal) {
    feedbackModal.style.display = 'none';
  }
};

if (feedbackForm) {
  feedbackForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const type = document.getElementById('feedback-type').value;
    const subject = document.getElementById('feedback-subject').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    
    if (!subject || !message) {
      return alert('Please fill in all fields');
    }
    
    try {
      console.log('Submitting feedback:', { type, subject, message });
      console.log('API endpoint:', API + '/feedback');
      console.log('Headers:', headers);
      
      const res = await fetch(API + '/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, subject, message })
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        console.error('Server error:', data);
        return alert('Failed to submit feedback: ' + (data.message || 'Unknown error'));
      }
      
      alert('✅ Thank you! Your feedback has been submitted successfully.');
      feedbackModal.style.display = 'none';
      feedbackForm.reset();
    } catch (err) {
      console.error('Submit feedback error:', err);
      console.error('Error details:', err.message, err.stack);
      alert('Failed to submit feedback. Error: ' + err.message);
    }
  };
}

// Initial loads
renderPointsUI();
loadDeals();
loadProfileHeader();
loadOrderHistory();
setActiveTab('menu');



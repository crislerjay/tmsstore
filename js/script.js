const cart = JSON.parse(localStorage.getItem('cart')) || {};

const lists = document.querySelector('.lists');
const totalPriceEl = document.querySelector('.total-price');
const cashInput = document.querySelector('.cash-input');
const changeEl = document.querySelector('.change');
const clearBtn = document.querySelector('.clear-cart');
const summary = document.querySelector('.summary');

// 💰 format money
function formatMoney(value) {
  return Number(value).toLocaleString('en-PH');
}

// 🔄 update UI
function updateSummary() {
  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  totalPriceEl.textContent = formatMoney(totalPrice);

  // 🧾 render cart items
  const cartList = document.querySelector('.cart-items');
  cartList.innerHTML = '';

  if (Object.keys(cart).length === 0) {
    cartList.innerHTML = '<li>No items in cart</li>';
    summary.style.display = 'none';
  } else {
    Object.values(cart).forEach(item => {
      summary.style.display = 'block';
      const li = document.createElement('li');
      const total = item.price * item.quantity;
      li.textContent = `${item.name} x${item.quantity} = ₱${total.toLocaleString()}`;
      cartList.appendChild(li);
    });
  }

  // 💵 change calculation
  const cash = Number(cashInput.value) || 0;

  if (cash < totalPrice) {
    changeEl.textContent = 'Insufficient';
  } else {
    changeEl.textContent = formatMoney(cash - totalPrice);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
}

// 📦 fetch items
fetch('./data/db.json')
  .then(res => res.json())
  .then(data => {
    // ✅ SORT ITEMS (A-Z by name)
    data.sort((a, b) => a.name.localeCompare(b.name));
    data.forEach(item => {
      let quantity = cart[item.id]?.quantity || 0;

      const listItem = document.createElement('li');
      const counter = document.createElement('div');
      counter.className = 'counter';

      const name = document.createElement('span');
      name.textContent = `${item.name} - ₱${item.price}`;

      const minusBtn = document.createElement('button');
      minusBtn.textContent = '-';

      const count = document.createElement('span');
      count.textContent = quantity;
      count.classList.add('count');
      count.dataset.id = item.id;

      const plusBtn = document.createElement('button');
      plusBtn.textContent = '+';

      // ➕ ADD
      plusBtn.addEventListener('click', () => {
        quantity++;
        count.textContent = quantity;

        if (!cart[item.id]) {
          cart[item.id] = { ...item, quantity: 0 };
        }

        cart[item.id].quantity++;
        updateSummary();
      });

      // ➖ REMOVE
      minusBtn.addEventListener('click', () => {
        if (quantity > 0) {
          quantity--;
          count.textContent = quantity;

          cart[item.id].quantity--;

          if (cart[item.id].quantity === 0) {
            delete cart[item.id];
          }

          updateSummary();
        }
      });

      counter.appendChild(minusBtn);
      counter.appendChild(count);
      counter.appendChild(plusBtn);

      listItem.appendChild(name);
      listItem.appendChild(counter);

      lists.appendChild(listItem);
    });

    updateSummary();
  })
  .catch(err => console.error(err));

// 🔍 search
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', function () {
  const searchTerm = this.value.toLowerCase();
  const listItems = document.querySelectorAll('.lists li');

  listItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? '' : 'none';
  });
});

// 💵 listen to cash input
cashInput.addEventListener('input', updateSummary);

// 🧹 clear cart
clearBtn.addEventListener('click', () => {
  if (!confirm('Clear cart?')) return;

  // clear cart object
  for (let key in cart) delete cart[key];

  localStorage.removeItem('cart');

  // reset UI counters
  document.querySelectorAll('.count').forEach(el => {
    el.textContent = 0;
  });

  cashInput.value = '';
  changeEl.textContent = 0;

  updateSummary();
});
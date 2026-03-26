
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'simple-secret',
  resave: false,
  saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));

const products = [
  { id: 1, name: 'Basic Tee', price: 499, image: '/static/img/tee.svg' },
  { id: 2, name: 'Mug', price: 299, image: '/static/img/mug.svg' }
];

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

// Root acts as health and home
app.get('/', (req, res) => {
  res.render('index', { products });
});

app.get('/health', (req, res) => res.send('OK'));

app.post('/cart/add', (req, res) => {
  const id = parseInt(req.body.id);
  const prod = products.find(p => p.id === id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  const cart = getCart(req);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1; else cart.push({ ...prod, qty: 1 });
  res.json({ ok: true, cartCount: cart.reduce((n,i)=>n+i.qty,0) });
});

app.get('/cart', (req, res) => {
  const cart = getCart(req);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render('cart', { cart, total });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

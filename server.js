
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
  { id: 1, name: 'Basic Tee', price: 499, image: 'https://webappimages.blob.core.windows.net/images/tea.webp?sp=r&st=2026-04-03T12:49:10Z&se=2026-12-31T21:04:10Z&spr=https&sv=2024-11-04&sr=b&sig=sLtWmhdhNWoAB5js4TBGJ2DP6X43r5GAZdrjwqMnI9I%3D' },
  { id: 2, name: 'Mug', price: 299, image: 'https://webappimages.blob.core.windows.net/images/mug.webp?sp=r&st=2026-04-03T12:47:56Z&se=2027-02-02T21:02:56Z&spr=https&sv=2024-11-04&sr=b&sig=Of%2BacZKvQZX42t8PZKevYTDf%2FcpzqDtyJ%2FP8gkpMgEc%3D' }
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

app.post('/order/place', async (req, res) => {
  const cart = getCart(req);

  if (!cart.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const order = {
    orderId: Date.now().toString(),
    email: "user@example.com",
    status: "COMPLETED",
  };

  try {
    //await axios.post("https://prod-04.centralindia.logic.azure.com:443/workflows/fd50411dc83f4020b0254c4fda604568/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=rGsdJFF1YFCGMR3wv2Hpn0qcNGuUC0UeQPJENyGHSxA", order);

    req.session.cart = [];

    res.json({ ok: true, message: "Order placed & email sent" });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Order placed but email failed" });
  }
});

app.post("/trigger-email", async (req, res) => {
    const response = await fetch("https://prod-04.centralindia.logic.azure.com:443/workflows/fd50411dc83f4020b0254c4fda604568/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=rGsdJFF1YFCGMR3wv2Hpn0qcNGuUC0UeQPJENyGHSxA", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
    });

    const data = await response.text();
    res.send(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

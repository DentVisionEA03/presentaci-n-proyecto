const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.options('*', cors());

app.post('/auth/login', (req, res) => {
  res.json({
    message: 'Login exitoso',
    token: 'token-demo',
    user: { email: req.body.email || 'usuario@demo.com', role: 'user' },
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Backend listo para Render');
});

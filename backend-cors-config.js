const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.post('/auth/login', (req, res) => {
  res.json({ message: 'Login exitoso' });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Backend corriendo');
});

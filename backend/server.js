const express = require('express');
const cors = require('cors');

const app = express();
const appointments = [];

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

const createId = () => `appt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

app.post('/auth/login', (req, res) => {
  res.json({
    message: 'Login exitoso',
    token: 'token-demo',
    user: {
      id: req.body.email || 'demo-user',
      email: req.body.email || 'usuario@demo.com',
      role: 'user',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/appointments', (req, res) => {
  res.json(appointments);
});

app.get('/appointments/admin', (req, res) => {
  res.json(appointments);
});

app.post('/appointments', (req, res) => {
  const appointment = {
    id: createId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...req.body,
  };

  appointments.unshift(appointment);

  res.status(201).json(appointment);
});

app.patch('/appointments/:id', (req, res) => {
  const appointment = appointments.find((item) => item.id === req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }

  Object.assign(appointment, req.body);

  return res.json(appointment);
});

app.delete('/appointments/:id', (req, res) => {
  const appointmentIndex = appointments.findIndex((item) => item.id === req.params.id);

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Cita no encontrada' });
  }

  appointments.splice(appointmentIndex, 1);

  return res.json({ id: req.params.id });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Backend listo para Render');
});

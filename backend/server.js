const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhl.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/bfhl', bfhlRoutes);

app.get('/', (req, res) => {
  res.send('SRM API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

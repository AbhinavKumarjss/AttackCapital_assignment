const express = require('express');
require('dotenv').config();
const connectDB = require('./db');
const app = express();
const BotRoutes = require('./routes/bots')
const Webhooks = require('./routes/webhooks')
const callRoutes = require('./routes/calls')
const PORT = process.env.PORT || 3000;
const cors = require("cors");
connectDB()
app.use(express.json())
app.use(cors());

app.use('/api',BotRoutes)
app.use('/webhook',Webhooks)
app.use('/api',callRoutes)

app.get('/api', async (req, res) => {
    res.json({success:true});
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
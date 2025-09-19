const express = require('express');
const router = express.Router();

const OPENMIC_API_KEY = process.env.OPENMIC_API_KEY;
const OPENMIC_API_URL = process.env.OPENMIC_API_URL;

/////////////////////////////////////////////
//      Fetch Bots Api
/////////////////////////////////////////////
router.get('/bots', async (req, res) => {
    const response = await fetch(OPENMIC_API_URL+'/bots', {
      headers: { "Authorization": `Bearer ${OPENMIC_API_KEY}` }
    });
    const bots = await response.json();
    res.json(bots);
  });

/////////////////////////////////////////////
//      Create Bot Api
/////////////////////////////////////////////
router.post('/bots', async (req, res) => {
    const { name, prompt } = req.body;
    const response = await fetch(OPENMIC_API_URL+'/bots', {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENMIC_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt })
    });
    const bot = await response.json();
    res.json(bot);
  });

/////////////////////////////////////////////////
//      Update Bot Api
/////////////////////////////////////////////////
router.patch('/bots/:uid', async (req, res) => {
    const { uid } = req.params;
    const { prompt } = req.body;
    const { name } = req.body;

    const response = await fetch(`${OPENMIC_API_URL}/bots/${uid}`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${OPENMIC_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({name, prompt })
    });
    const updatedBot = await response.json();
    res.json(updatedBot);
  });

////////////////////////////////////////////////////
//      Delete bot api
////////////////////////////////////////////////////
router.delete('/bots/:uid', async (req, res) => {
    const { uid } = req.params;
    await fetch(`${OPENMIC_API_URL}/bots/${uid}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${OPENMIC_API_KEY}` }
    });
    res.json({ success: true });
});

module.exports = router;

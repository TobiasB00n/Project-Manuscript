import express from "express";

const router = express.Router();

// Пример GET маршрута
router.get('/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

// Пример POST маршрута
router.post('/data', (req, res) => {
    const data = req.body;
    res.json({ receivedData: data });
});

export default router;

const express = require('express');
const app = express();
const port = 3000;

// Use express.json() to parse JSON bodies
app.use(express.json());

// In-memory store for our URLs
const urls = [];

app.get('/', (req, res) => {
    res.send('Hello there, homie!');
});

// Endpoint to save a URL
app.post('/save', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).send({ message: 'URL is required' });
    }

    if (urls.includes(url)) {
        return res.status(409).send({ message: 'URL already saved' });
    }

    urls.push(url);
    res.status(200).send({ message: 'URL saved successfully!' });
});

// Endpoint to list all saved URLs
app.get('/read', (req, res) => {
    res.status(200).send(urls);
});

app.listen(port, () => {
    console.log(`Librarian service listening at http://localhost:${port}`);
}); 
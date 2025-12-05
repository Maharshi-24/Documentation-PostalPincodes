const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Routes
app.get('/', (req, res) => {
    res.render('docs');
});

app.get('/playground', (req, res) => {
    res.render('index');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Documentation server running on http://localhost:${PORT}`);
});

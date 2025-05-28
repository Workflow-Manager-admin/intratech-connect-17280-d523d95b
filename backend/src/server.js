const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const articlesRouter = require('./routes/articles');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Modular API routes
app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/search', searchRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IntraTech Connect API is running.' });
});

app.listen(PORT, () => {
  console.log(`IntraTech Connect backend listening on port ${PORT}`);
});

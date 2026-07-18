function notFound(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  res.status(404).render('404', { title: 'Not Found', layout: false });
}

function errorHandler(err, req, res, next) {
  console.error('❌', err);
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ success: false, message: err.message || 'Internal Server Error' });
  }
  res.status(status).send(`<h1>Something went wrong</h1><p>${err.message}</p>`);
}

module.exports = { notFound, errorHandler };

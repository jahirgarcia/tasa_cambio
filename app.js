const express = require('express');
const tasaCambioService = require('./services/tasa-cambio');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status');

const app = express();

app.get('/', async (req, res, next) => {
  const { year, month } = req.query;

  try {
    const { data } = await tasaCambioService(year, month);
    res.status(OK).json(data);
  } catch(err) {
    return next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || INTERNAL_SERVER_ERROR;
  res.sendStatus(status);
});

module.exports = app;

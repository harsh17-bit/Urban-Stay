const express = require('express');

const router = express.Router();

const ML_SERVICE_URL = (
  process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001'
).replace(/\/$/, '');

const ML_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS || 15000);

const buildMlUrl = (path) => `${ML_SERVICE_URL}${path}`;

const forwardToMl = async ({ method, path, body }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

  try {
    const response = await fetch(buildMlUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = {
        success: false,
        error: 'Invalid response from ML service',
      };
    }

    return {
      status: response.status,
      data: parsed,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        status: 504,
        data: {
          success: false,
          error: 'ML service timeout',
        },
      };
    }

    return {
      status: 503,
      data: {
        success: false,
        error: 'ML service unavailable',
      },
    };
  } finally {
    clearTimeout(timer);
  }
};

router.get('/health', async (req, res) => {
  const result = await forwardToMl({ method: 'GET', path: '/health' });
  res.status(result.status).json(result.data);
});

router.get('/locations', async (req, res) => {
  const result = await forwardToMl({ method: 'GET', path: '/locations' });
  res.status(result.status).json(result.data);
});

router.post('/predict', async (req, res) => {
  // Normalize city to lowercase for consistency with ML service
  if (req.body.city) {
    req.body.city = req.body.city.toLowerCase();
  }
  const result = await forwardToMl({
    method: 'POST',
    path: '/predict',
    body: req.body,
  });
  res.status(result.status).json(result.data);
});

module.exports = router;

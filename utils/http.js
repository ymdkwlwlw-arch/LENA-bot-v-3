const axios = require("axios");

const http = axios.create({
  timeout: Number(process.env.API_TIMEOUT_MS || 15000),
  maxContentLength: 25 * 1024 * 1024,
  maxBodyLength: 25 * 1024 * 1024,
  maxRedirects: 4,
  validateStatus: status => status >= 200 && status < 400
});

async function request(config, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await http.request(config);
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const retryable = !status || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempt === retries) break;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function get(url, options = {}) {
  return request({ method: "GET", url, ...options });
}

async function post(url, data, options = {}) {
  return request({ method: "POST", url, data, ...options }, 1);
}

module.exports = { http, request, get, post };

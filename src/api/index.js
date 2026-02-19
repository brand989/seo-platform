const BASE = `${import.meta.env.VITE_N8N_BASE_URL}${import.meta.env.VITE_N8N_WEBHOOK_PATH}`;

async function req(method, path, body, timeoutMs) {
  const controller = timeoutMs ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: controller?.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Превышено время ожидания (120 сек). Попробуйте снова.');
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const getProjects = () => req('GET', '/api/projects');
export const createProject = (data) => req('POST', '/api/projects', data);
export const getProject = (id) => req('GET', `/api/project?id=${id}`);
export const deleteProject = (id) => req('DELETE', `/api/project?id=${id}`);
export const searchCompetitors = (id) =>
  req('POST', '/api/project/search-competitors', { id });
export const generateTZ = (id, urls) =>
  req('POST', '/api/project/generate', { id, urls }, 120_000);
export const getProjectStatus = (id) =>
  req('GET', `/api/project/status?id=${id}`);

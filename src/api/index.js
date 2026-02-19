const BASE = `${import.meta.env.VITE_N8N_BASE_URL}${import.meta.env.VITE_N8N_WEBHOOK_PATH}`;

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export const getProjects = () => req('GET', '/api/projects');
export const createProject = (data) => req('POST', '/api/projects', data);
export const getProject = (id) => req('GET', `/api/project?id=${id}`);
export const deleteProject = (id) => req('DELETE', `/api/project?id=${id}`);
export const searchCompetitors = (id) =>
  req('POST', '/api/project/search-competitors', { id });
export const generateTZ = (id, urls) =>
  req('POST', '/api/project/generate', { id, urls });
export const getProjectStatus = (id) =>
  req('GET', `/api/project/status?id=${id}`);

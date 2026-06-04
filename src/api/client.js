import axios from 'axios';


let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
    localStorage.setItem('spawnbase_token', token);
};

export const loadStoredToken = () => {
    authToken = localStorage.getItem('spawnbase_token');
    return authToken;
};

// All requests go through the API Gateway
const BASE_URL = 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
    const token = authToken
        || localStorage.getItem('spawnbase_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Dashboard ──────────────────────────────
export const getDashboard = () =>
    api.get('/api/admin/dashboard');

// ── Instance List ──────────────────────────
export const getInstances = (params = {}) =>
    api.get('/api/admin/instances', { params });

export const getInstance = (id) =>
    api.get(`/api/instances/${id}`);

// ── Instance Actions ───────────────────────
export const createInstance = (data) =>
    api.post('/api/instances', data);

export const transitionState = (id, targetState) =>
    api.post(`/api/lifecycle/instances/${id}/transition`,
        { targetState });

export const provisionInstance = (id, dbType, options = {}) =>
    api.post(
        `/api/provisioning/instances/${id}/provision`,
        { dbType, ...options });

export const recoverInstance = (id) =>
    api.post(`/api/instances/${id}/recover`);

// ── Events ────────────────────────────────
export const getEvents = (id) =>
    api.get(`/api/instances/${id}/events`);

// ── Credentials ───────────────────────────
export const getCredentials = (id) =>
    api.get(`/api/credentials/${id}`);

// ── Metadata ──────────────────────────────
export const getDatabaseTypes = () =>
    api.get('/api/admin/database-types');

export const getStates = () =>
    api.get('/api/admin/states');

// Add these to client.js
export const stopInstance = (id, containerId) =>
    api.post(`/api/provisioning/instances/${id}/stop`,
        { containerId });

export const startInstance = (id, containerId, dbType) =>
    api.post(`/api/provisioning/instances/${id}/start`,
        { containerId, dbType });

export const restartInstance = (id, containerId) =>
    api.post(`/api/provisioning/instances/${id}/restart`,
        { containerId });

export const deleteInstance = (id, containerId) =>
    api.delete(`/api/provisioning/instances/${id}`,
        { data: { containerId } });
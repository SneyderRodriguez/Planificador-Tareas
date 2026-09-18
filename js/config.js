const API_BASE_URL = "https://thyra-backend.onrender.com/api";

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("thyra_token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem("thyra_token");
        window.location.href = "/login.html";
        throw new Error("Sesión expirada");
    }

    return response;
}
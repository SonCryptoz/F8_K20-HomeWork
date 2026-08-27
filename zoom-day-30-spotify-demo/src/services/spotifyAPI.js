const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchData = {
    auth: async (url = "", refresh = false) => {
        const token = refresh
            ? localStorage.getItem("refresh_token")
            : localStorage.getItem("access_token");

        const res = await fetch(`${BASE_URL}${url}`, {
            method: refresh ? "POST" : "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.json();
    },
    get: async (url = "") => {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}${url}`, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        return res.json();
    },
    post: async (url = "", data = {}) => {
        const token = localStorage.getItem("access_token");
        const isFormData = data instanceof FormData;
        
        const headers = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        
        if (!isFormData) {
            headers["Content-Type"] = "application/json";
        }

        const res = await fetch(`${BASE_URL}${url}`, {
            method: "POST",
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });

        return res.json();
    },
    delete: async (url = "", data = {}) => {
        const token = localStorage.getItem("access_token");
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(`${BASE_URL}${url}`, {
            method: "DELETE",
            headers,
            ...(Object.keys(data).length > 0 ? { body: JSON.stringify(data) } : {}),
        });

        try {
            return await res.json();
        } catch (e) {
            return { ok: res.ok };
        }
    },
    put: async (url = "", data = {}) => {
        const token = localStorage.getItem("access_token");
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(`${BASE_URL}${url}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(data),
        });

        return res.json();
    },
};

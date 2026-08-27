import { fetchData } from "./spotifyAPI";

export const getCurrentUser = async () => {
    try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        // Nếu không có token nào thì chưa đăng nhập
        if (!accessToken && !refreshToken) {
            return null;
        }

        // Thử lấy thông tin user bằng access_token hiện tại
        let response = await fetchData.auth("/users/me");

        // Nếu thành công -> trả về thông tin user
        if (response?.user) {
            return response.user;
        }

        // Nếu access_token hết hạn và có refresh_token -> thực hiện refresh token
        if (refreshToken) {
            const newToken = await fetchData.auth("/auth/refresh-token", true);

            if (newToken?.access_token) {
                localStorage.setItem("access_token", newToken.access_token);

                // Gọi lại /users/me với token mới
                response = await fetchData.auth("/users/me");

                if (response?.user) {
                    return response.user;
                }
            }
        }

        // Nếu refresh thất bại -> xóa token và coi như chưa đăng nhập
        localStorage.clear();
        return null;
    } catch (error) {
        console.error("Auth error:", error.message);
        return null;
    }
};

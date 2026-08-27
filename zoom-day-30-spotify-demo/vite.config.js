import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { globSync } from "glob";

// Chỉ lấy entry HTML cho các trang MPA riêng biệt (Login, Register)
// Các trang SPA (Track, Artist, Album, Playlist) được router JS xử lý
const inputs = {
    main: resolve(import.meta.dirname, "index.html"),
};

// Tự động tìm các trang MPA (Login, Register)
const mpaPages = globSync("src/pages/{Login,Register}/index.html").reduce(
    (acc, path) => {
        const name = path
            .replace(".html", "")
            .replace(/\\/g, "/")
            .replace(/\//g, "_");
        acc[name] = resolve(import.meta.dirname, path);
        return acc;
    },
    {},
);

Object.assign(inputs, mpaPages);

export default defineConfig({
    plugins: [tailwindcss()],
    build: {
        rollupOptions: {
            input: inputs,
        },
    },
    // SPA fallback: trong dev mode, mọi URL không khớp file tĩnh sẽ trả về index.html
    appType: "spa",
});

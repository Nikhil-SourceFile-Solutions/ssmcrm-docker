// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import path from "path";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/js/console/main.tsx",
                "resources/js/company/main.tsx"
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: "0.0.0.0", // Accept connections from outside the container
        port: 5173,
        strictPort: true,
        hmr: {
            host: "localhost", // or your custom domain like "console.localhost"
        },
    },
});

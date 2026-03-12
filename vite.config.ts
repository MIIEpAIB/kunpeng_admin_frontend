import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,          // 保留你原有的端口配置
    host: '0.0.0.0',     // 关键：绑定所有网卡地址，允许公网访问
    cors: true,          // 开启跨域，避免公网访问时出现跨域报错
    strictPort: true     // 端口被占用时直接报错，方便排查问题（可选但推荐）
  }
});
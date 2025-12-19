import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
// import { reactRouterDevTools } from "react-router-devtools";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";

const ReactCompilerConfig = {};

export default defineConfig(() => {
  return {
    plugins: [
      // reactRouterDevTools(),
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
      babel({
        filter: /\.[jt]sx?$/,
        babelConfig: {
          presets: ["@babel/preset-typescript"],
          plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
        },
      }),
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});

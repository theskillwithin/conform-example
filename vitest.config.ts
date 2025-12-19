import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: false,
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "unit",
          include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
          exclude: [
            "**/node_modules/**",
            "**/build/**",
            "**/dist/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
            "tests/integration/**",
            "tests-examples/**",
            "tests/e2e/**",
          ],
          environment: "happy-dom",
          setupFiles: ["./app/test-setup.ts"],
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          exclude: [
            "**/node_modules/**",
            "**/build/**",
            "**/dist/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
            "tests-examples/**",
            "tests/e2e/**",
            "**/helpers/**",
          ],
          environment: "node",
          pool: "forks",
          maxWorkers: 1,
        },
      },
    ],
  },
});

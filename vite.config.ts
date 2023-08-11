import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import checker from "vite-plugin-checker";

export default defineConfig({
  build: {
    lib: {
      name: "Kite",
      entry: "./lib/index.ts",
      formats: ["es", "umd"],
    },
  },
  plugins: [dts({ tsconfigPath: "tsconfig.lib.json" }), checker({ typescript: true })],
});

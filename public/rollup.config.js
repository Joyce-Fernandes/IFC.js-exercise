import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "viewer_model/viewer.js",
  output: [
    {
      format: "esm",
      file: "viewer_model/viewer-bundle.js",
    },
  ],
  plugins: [resolve()],
};

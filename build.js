require('esbuild').build({
  entryPoints: ['src/index.ts'],
  format: 'esm',
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: 'dist/index.js',
  write: true,
  plugins: [
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "global": "window"
  }
});
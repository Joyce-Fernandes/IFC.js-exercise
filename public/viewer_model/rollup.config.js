import resolve from '@rollup/plugin-node-resolve';

export default [{
  input: 'viewer.js',
  output: [
    {
      format: 'esm',
      file: 'viewer-bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
}, 
];
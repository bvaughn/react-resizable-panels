# Build Scripts

## Files

### minify.ts
Generic TypeScript minification script that:
1. Accepts input and output file paths as arguments
2. Strips TypeScript types with `@babel/preset-typescript`
3. Transforms with Babel using browser compatibility settings
4. Minifies with Terser
5. Generates output file with minified code

**Usage:**
```bash
tsx scripts/minify.ts <input-path> <output-path>
```

**Example:**
```bash
tsx scripts/minify.ts src/scripts/persist.ts src/scripts/persist.minified.ts
```
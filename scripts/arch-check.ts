import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const files = process.argv.slice(2);
if (files.length === 0) process.exit(0);

let hasErrors = false;

function resolveImportPath(currentFile: string, importPath: string): string {
  if (importPath.startsWith("@/")) {
    return importPath.replace("@/", "src/");
  }
  if (importPath.startsWith(".")) {
    const absoluteDir = dirname(currentFile);
    const resolved = join(absoluteDir, importPath);
    return normalize(resolved).replace(/\\/g, "/");
  }
  return importPath;
}

const rules = [
  {
    name: "fsd-cross-feature-imports",
    comment:
      "Feature-to-feature imports are strictly forbidden. Features must remain completely isolated.",
    filePattern: /^src\/features\/([^/]+)/,
    check: (fileMatch: RegExpMatchArray, importPath: string) => {
      const targetMatch = /^src\/features\/([^/]+)/.exec(importPath);
      return !targetMatch || targetMatch[1] === fileMatch[1];
    },
  },
  {
    name: "fsd-cross-entities-imports",
    comment:
      "Direct Entity-to-Entity imports are forbidden. Use shared contracts or cross-cutting target folders like 'entities/user/@x/auth'.",
    filePattern: /^src\/entities\/([^/]+)/,
    check: (fileMatch: RegExpMatchArray, importPath: string) => {
      const targetMatch = /^src\/entities\/([^/]+)/.exec(importPath);
      if (!targetMatch) return true;
      const isSameEntity = targetMatch[1] === fileMatch[1];
      const isCrossCuttingFolder = importPath.includes(`entities/${fileMatch[1]}/@x/`);
      return isSameEntity || isCrossCuttingFolder;
    },
  },
  {
    name: "fsd-cross-widgets-imports",
    comment:
      "Widget-to-widget imports are strictly forbidden. Widgets must be completely autonomous blocks.",
    filePattern: /^src\/widgets\/([^/]+)/,
    check: (fileMatch: RegExpMatchArray, importPath: string) => {
      const targetMatch = /^src\/widgets\/([^/]+)/.exec(importPath);
      return !targetMatch || targetMatch[1] === fileMatch[1];
    },
  },
  {
    name: "fsd-layer-order",
    comment: "FSD layer hierarchy violation: lower layers cannot import from upper layers.",
    filePattern: /^src\/(shared|entities|features|widgets|pages)/,
    check: (fileMatch: RegExpMatchArray, importPath: string) => {
      const layers = ["shared", "entities", "features", "widgets", "pages", "processes", "app"];
      const currentLayer = fileMatch[1];

      const targetLayerMatch = /^src\/([^/]+)/.exec(importPath);
      if (!targetLayerMatch) return true;

      const targetLayer = targetLayerMatch[1];
      if (!layers.includes(targetLayer)) return true;

      return layers.indexOf(currentLayer) >= layers.indexOf(targetLayer);
    },
  },
];

const IMPORT_EXPORT_REGEX = /(?:import|export)\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;

for (const file of files) {
  const normalizedFile = file.replace(/\\/g, "/");
  if (!/\.(ts|tsx|js|jsx)$/.test(normalizedFile)) continue;

  try {
    const rawContent = readFileSync(normalizedFile, "utf8");
    const cleanContent = rawContent.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");

    for (const rule of rules) {
      const fileMatch = normalizedFile.match(rule.filePattern);
      if (!fileMatch) continue;

      const matches = cleanContent.matchAll(IMPORT_EXPORT_REGEX);

      for (const match of matches) {
        const rawImportPath = match[1];
        if (!rawImportPath) continue;

        const importPath = resolveImportPath(normalizedFile, rawImportPath);

        const isValid = rule.check(fileMatch, importPath);

        if (!isValid) {
          console.error(`\n❌ Architecture Violation [${rule.name}]`);
          console.error(`   File: ${normalizedFile}`);
          console.error(`   Forbidden Import: "${rawImportPath}" (resolved as "${importPath}")`);
          console.error(`   Description: ${rule.comment}`);
          hasErrors = true;
        }
      }
    }
  } catch {
    // ignore removed files
  }
}

if (hasErrors) process.exit(1);
process.exit(0);

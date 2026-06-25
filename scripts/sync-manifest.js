const fs = require("node:fs");
const path = require("node:path");
const pkg = require("../package.json");

const manifestPath = path.join(__dirname, "../dist/manifest.json");

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.version = pkg.version;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Synced manifest.json version to ${pkg.version}`);
} else {
  console.error(`Error: manifest.json not found at ${manifestPath}`);
  process.exit(1);
}

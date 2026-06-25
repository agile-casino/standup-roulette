const fs = require("node:fs");
const path = require("node:path");
const { ZipArchive } = require("archiver");

const pkg = require("../package.json");

function zipExtension() {
  const zipPath = path.join(__dirname, `../standup-roulette-extension-v${pkg.version}.zip`);
  const distDir = path.join(__dirname, "../dist/");

  if (!fs.existsSync(distDir)) {
    console.error(`Error: build directory does not exist. Run build first.`);
    process.exit(1);
  }

  const output = fs.createWriteStream(zipPath);
  const archive = new ZipArchive({
    zlib: { level: 9 }
  });

  output.on("close", () => {
    console.log(`Successfully packaged extension to ${path.basename(zipPath)} (${archive.pointer()} bytes)`);
  });

  archive.on("warning", err => {
    if (err.code === "ENOENT") {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on("error", err => {
    throw err;
  });

  archive.pipe(output);

  // Package contents of dist directory directly at the root of the zip archive
  archive.directory(distDir, false);

  archive.finalize();
}

zipExtension();

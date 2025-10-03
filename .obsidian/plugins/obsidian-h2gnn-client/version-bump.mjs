import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and update versions.json
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const versions = JSON.parse(readFileSync("versions.json", "utf8"));

versions[targetVersion] = manifest.minAppVersion;

writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
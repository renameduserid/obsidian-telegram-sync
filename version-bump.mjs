import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
const compatibleObsidianVersions = Object.values(versions);
const latestCompatibleObsidianVersion = compatibleObsidianVersions[compatibleObsidianVersions.length - 1];
if (minAppVersion !== versions[latestCompatibleObsidianVersion]) {
	versions[targetVersion] = minAppVersion;
	writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
}

// keep release-notes.mjs in sync
const releaseNotesPath = "release-notes.mjs";
const src = readFileSync(releaseNotesPath, "utf8");
const re = /export\s+const\s+releaseVersion\s*=\s*(['"`])[^'"`]*\1\s*;/;
if (!re.test(src)) {
	throw new Error(`releaseVersion not found in ${releaseNotesPath}`);
}
const updated = src.replace(re, `export const releaseVersion = "${targetVersion}";`);
if (updated !== src) writeFileSync(releaseNotesPath, updated, "utf8");

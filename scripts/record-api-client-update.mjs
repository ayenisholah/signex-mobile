import { readFile, writeFile } from "node:fs/promises";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) {
  throw new Error("usage: record-api-client-update.mjs SEMVER");
}

const changelogPath = new URL("../docs/CHANGELOG.md", import.meta.url);
const changelog = await readFile(changelogPath, "utf8");
const entry = `- Pinned the Perpeto API client package to version \`${version}\`.`;

if (!changelog.includes(entry)) {
  const marker = "### Changed\n\n";
  if (!changelog.includes(marker)) {
    throw new Error("docs/CHANGELOG.md is missing the Unreleased Changed section");
  }
  await writeFile(changelogPath, changelog.replace(marker, `${marker}${entry}\n`));
}

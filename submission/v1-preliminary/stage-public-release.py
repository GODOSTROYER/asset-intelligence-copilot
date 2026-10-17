"""Stage only verified source-archive entries in a new directory, without Git history."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path, PurePosixPath
import sys
from zipfile import ZipFile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
ARCHIVE = HERE / "asset-intelligence-copilot-source.zip"
MANIFEST_NAME = "apps/asset-intelligence-copilot/submission/PACKAGE-MANIFEST.json"
README_NAME = "apps/asset-intelligence-copilot/submission/public-repository-README.md"
FORBIDDEN = {".git", ".local", "node_modules", "dist", "sample-data", "test-data"}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python stage-public-release.py ABSOLUTE_NEW_STAGING_DIRECTORY")
    destination = Path(sys.argv[1])
    if not destination.is_absolute():
        raise ValueError("Staging path must be absolute")
    destination = destination.resolve()
    if destination.exists():
        raise ValueError("Staging directory already exists; it will not be overwritten")
    if ROOT == destination or ROOT in destination.parents:
        raise ValueError("Staging must be outside the original repository")
    with ZipFile(ARCHIVE) as archive:
        manifest = json.loads(archive.read(MANIFEST_NAME))
        expected = {entry["path"]: entry for entry in manifest["entries"]}
        if set(archive.namelist()) != set(expected) | {MANIFEST_NAME}:
            raise ValueError("Archive contains entries outside its manifest")
        payload = {}
        for name in archive.namelist():
            parts = PurePosixPath(name)
            if parts.is_absolute() or ".." in parts.parts or set(parts.parts) & FORBIDDEN:
                raise ValueError("Unsafe archive path")
            if ":" in name or "\\" in name:
                raise ValueError("Unsafe archive path spelling")
            if parts.name.startswith(".env") and parts.name != ".env.example":
                raise ValueError("Credentials file in archive")
            if parts.name.startswith("portal-") or parts.suffix.lower() == ".pdf":
                raise ValueError("Portal screenshot or PDF in source archive")
            data = archive.read(name)
            if name in expected and hashlib.sha256(data).hexdigest() != expected[name]["sha256"]:
                raise ValueError(f"Manifest hash mismatch: {name}")
            payload[name] = data
    destination.mkdir(parents=True)
    for name, data in payload.items():
        target = destination.joinpath(*PurePosixPath(name).parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    (destination / "README.md").write_bytes(payload[README_NAME])
    print(json.dumps({"staging": str(destination), "files": len(payload) + 1,
                      "sourceZipSha256": hashlib.sha256(ARCHIVE.read_bytes()).hexdigest(),
                      "gitHistoryIncluded": False, "publicationPerformed": False}, indent=2))


if __name__ == "__main__":
    main()

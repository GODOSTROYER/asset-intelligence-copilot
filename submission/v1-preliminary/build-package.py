"""Build a bounded, explicit-allowlist source archive; never read local secrets/state."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

APP = Path(__file__).resolve().parent.parent
ROOT = APP.parent.parent
OUT = APP / "submission"
ZIP_PATH = OUT / "asset-intelligence-copilot-source.zip"
MANIFEST_PATH = OUT / "PACKAGE-MANIFEST.json"
STAMP = (2026, 10, 17, 0, 0, 0)
MAX_BYTES = 150_000_000

# Exact files and narrowly typed directories form the complete package allowlist.
EXACT_APP = (
    ".env.example", ".gitignore", "README.md", "package.json", "package-lock.json",
    "index.html", "tsconfig.json", "vite.config.ts",
    "submission/writeup.md", "submission/recording-script.md", "submission/shotlist.md",
    "submission/REPRODUCE.md", "submission/build-package.py",
    "submission/public-repository-README.md", "submission/stage-public-release.py",
    "docs/screenshots/mobile-status.png", "docs/screenshots/desktop-status.png",
    "docs/screenshots/desktop-empty.png", "docs/screenshots/desktop-chart.png",
    "docs/screenshots/built-cost-chart.png",
)
EXACT_ROOT = (
    "LICENSE", "01-problem-statement.md", "02-dataset-guide.md",
    "03-evaluation-queries.md", "04-prerequisites.md",
)
DIRECTORIES = {
    "src": {".ts", ".tsx", ".css"}, "server": {".ts"},
    "scripts": {".ts"}, "docs": {".md"}, "design": {".md"},
}
BLOCKED_PARTS = {".git", ".local", "node_modules", "dist", "sample-data", "test-data"}


def collect() -> dict[str, bytes]:
    files = [ROOT / name for name in EXACT_ROOT]
    files.extend(APP / name for name in EXACT_APP)
    for directory, suffixes in DIRECTORIES.items():
        folder = APP / directory
        files.extend(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in suffixes)
    payload: dict[str, bytes] = {}
    for file in sorted(set(files)):
        if file.is_symlink() or not file.is_file():
            raise ValueError(f"Required input is unavailable or a symlink: {file.name}")
        resolved = file.resolve()
        relative = resolved.relative_to(ROOT).as_posix()
        parts = set(Path(relative).parts)
        if parts & BLOCKED_PARTS:
            raise ValueError(f"Forbidden package path: {relative}")
        if file.name.startswith(".env") and file.name != ".env.example":
            raise ValueError("Only the blank .env.example template is allowed")
        # Require every ancestor to stay literal, preventing linked directories.
        if any(parent.is_symlink() for parent in file.parents if parent != ROOT.parent):
            raise ValueError(f"Linked package ancestor: {relative}")
        data = resolved.read_bytes()
        if file.suffix.lower() not in {".png"} and re.search(
            rb"AIza[0-9A-Za-z_-]{30,}|AQ\.[A-Za-z0-9_-]{30,}|"
            rb"sk-(?:proj-)?[0-9A-Za-z_-]{30,}|"
            rb"ya29\.[A-Za-z0-9._-]{30,}|1//[A-Za-z0-9_-]{30,}|"
            rb"GOCSPX-[A-Za-z0-9_-]{20,}|"
            rb"eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|"
            rb"(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{30,}|"
            rb"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----",
            data,
        ):
            raise ValueError(f"Potential credential in allowlisted input: {relative}")
        payload[relative] = data
    if sum(map(len, payload.values())) > MAX_BYTES:
        raise ValueError("Uncompressed source package exceeds 150 MB")
    return payload


def main() -> None:
    payload = collect()  # Capture each input once so hashes and ZIP cannot disagree.
    manifest = {
        "format": 1,
        "purpose": "Local source snapshot; not a final event submission",
        "sampleUpstreamCommit": "b8de8c9bd68f40334e5d06922126169e4f3bf3ca",
        "excluded": ["credentials", "saved user histories", "datasets", "dependencies", "build output", "Git history"],
        "entries": [
            {"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
            for name, data in sorted(payload.items())
        ],
    }
    manifest_bytes = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_bytes(manifest_bytes)
    payload[MANIFEST_PATH.relative_to(ROOT).as_posix()] = manifest_bytes
    with ZipFile(ZIP_PATH, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(payload.items()):
            info = ZipInfo(name, date_time=STAMP)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
    if ZIP_PATH.stat().st_size > MAX_BYTES:
        raise ValueError("ZIP exceeds the portal's 150 MB limit")
    with ZipFile(ZIP_PATH) as archive:
        if archive.testzip() is not None:
            raise ValueError("ZIP integrity check failed")
        for entry in manifest["entries"]:
            if hashlib.sha256(archive.read(entry["path"])).hexdigest() != entry["sha256"]:
                raise ValueError(f"ZIP hash mismatch: {entry['path']}")
    print(json.dumps({
        "zip": str(ZIP_PATH), "bytes": ZIP_PATH.stat().st_size,
        "files": len(payload), "sha256": hashlib.sha256(ZIP_PATH.read_bytes()).hexdigest(),
        "manifest": str(MANIFEST_PATH), "integrity": "PASS", "limitBytes": MAX_BYTES,
    }, indent=2))


if __name__ == "__main__":
    main()

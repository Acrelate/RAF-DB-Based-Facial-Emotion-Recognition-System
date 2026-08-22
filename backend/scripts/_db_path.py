"""Resolve SQLite database path for maintenance scripts."""
from __future__ import annotations

from pathlib import Path

import _bootstrap  # noqa: F401
from src.config.settings import SQLITE_PATH


def get_db_path() -> Path:
    return Path(SQLITE_PATH)

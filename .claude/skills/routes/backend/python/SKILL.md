# Python — SKILL

## Overview
Versatile language for web APIs, data processing, automation, and ML.
Python 3.13+ (Oct 2024) with improved error messages and experimental free-threaded mode.

## Setup / Base Project
```bash
# Python 3.13+
python --version
# uv (recommended modern package manager, replaces pip+venv)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv init my-api && cd my-api
# FastAPI (recommended for APIs)
uv add "fastapi[standard]"
# Django 5.1+
uv add django && django-admin startproject mysite
# Always use virtual env (uv creates one automatically)
uv sync
```

## Core Concepts
- **Type Hints** — always use: `def get_user(user_id: int) -> User:`
- **Pydantic v2** — data validation with BaseModel (10x faster than v1, Rust core)
- **async/await** — FastAPI supports async handlers natively
- **ORM** — SQLAlchemy 2.0 (async support), Django ORM, or SQLModel (FastAPI + SQLAlchemy)
- **Dependency Injection** — FastAPI `Depends()` for auth, DB sessions
- **Testing** — `pytest` with `httpx.AsyncClient` for FastAPI
- **uv** — fast Rust-based package manager (replaces pip, pipenv, poetry)
- **Linting** — `ruff` for linting + formatting (replaces black, isort, flake8)
- **Free-threaded mode** (3.13+) — experimental no-GIL for true parallelism

## Common Patterns
```python
# FastAPI with Pydantic v2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict

app = FastAPI()

class UserCreate(BaseModel):
    model_config = ConfigDict(strict=True)
    name: str
    email: str

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await user_service.find(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Gotchas
- Never use mutable default arguments: `def f(items=[])` is a bug
- `async def` handlers in FastAPI must `await` all I/O — blocking calls freeze the event loop
- Django ORM is sync — use `sync_to_async` or `django-ninja` for async APIs
- Use `uv lock` for reproducible builds (replaces `pip freeze > requirements.txt`)
- Use `secrets.token_urlsafe()` for tokens, not `random`
- Pydantic v2 has breaking changes from v1 — check migration guide

## Security
- Use `secrets.token_urlsafe()` for tokens — never `random` module for security values
- Prevent SSTI — never pass user input to Jinja2 `Template()` or `render_template_string()`
- Use Pydantic `BaseModel` with strict mode for input validation — reject unexpected fields
- Run `bandit` (SAST) and `pip audit` / `uv audit` to detect known vulnerabilities
- Always use latest stable Python and framework versions — audit dependencies before deploy

## References
- https://fastapi.tiangolo.com/
- https://docs.djangoproject.com/
- https://docs.astral.sh/uv/
- https://docs.pydantic.dev/latest/

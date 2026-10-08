# MemCore

MemCore is a local-first memory MCP server for AI coding assistants.
It stores project-specific knowledge in SQLite so memories can survive assistant restarts without cloud services, subscriptions, or AI API keys.

## Install

```sh
npm install
```

## Run

```sh
npm run build
node dist/index.js
```

During development, you can run the TypeScript checks and tests with:

```sh
npm run build
npm test
```

## MCP client configuration

Point your MCP-compatible assistant at the MemCore server command.
Use an absolute path for your local clone.

```json
{
  "mcpServers": {
    "memcore": {
      "command": "node",
      "args": ["/absolute/path/to/memcore/dist/index.js"]
    }
  }
}
```

## Tools

### `save_memory`

Stores a project-scoped memory.

Input:

```json
{
  "project": "my-project",
  "content": "Run npm test before opening a PR.",
  "source": "manual-note"
}
```

### `search_memories`

Searches memories in one project namespace by keyword.

Input:

```json
{
  "project": "my-project",
  "keyword": "test"
}
```

### `update_memory`

Updates a memory by ID and preserves the previous content in version history.

Input:

```json
{
  "id": 1,
  "content": "Run npm test and npm run build before opening a PR."
}
```

### `restore_memory_version`

Restores a previous version without deleting the audit trail.

Input:

```json
{
  "memoryId": 1,
  "versionId": 1
}
```

## Scope

MemCore v0.1 intentionally does not include semantic search, embeddings, automatic conversation extraction, a web dashboard, cloud sync, authentication, or multi-user collaboration.

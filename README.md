# Task Man
> Simple Trello-like Projects

## Running on Local

### 1. Install deps

```sh
bun install
```

### 2. Copy Env

```sh
cp projects/backend/.env.example projects/backend/.env
cp projects/frontend/.env.example projects/frontend/.env
```

### 3. Run Postgresql Server

```sh
bunx prisma dev
```
Press <kbd>h</kbd> and copy the connection string shown in the CLI and use it as your `projects/backend/.env`

```sh
DATABASE_URL="prisma+postgres://localhost:PORT/?api_key=__API_KEY__"
```

### 4. Run DB Migration & Seeder

```sh
bun run db:prepare
```

### 5. Run All Services

```sh
bun run dev
```

Open http://localhost:8000/ in your browser

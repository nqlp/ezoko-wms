# Prisma - Migrations

## Process

1. **Modify the schema** — Edit `prisma/schema.prisma` with your model changes
2. **Generate the migration** — Run `npx prisma migrate dev --name <migration-name>`
   - Prisma compares the schema to the current database state
   - A SQL migration file is generated in `prisma/migrations/<timestamp>_<name>/migration.sql`
   - The migration is applied to the local database
   - The Prisma Client is regenerated
3. **Review the generated SQL** — Open the `migration.sql` file and verify it matches your intent
4. **Commit the migration** — Commit both `schema.prisma` and the `migrations/` folder to version control

## Conventions

- **Migration names**: Use lowercase snake_case describing the change (e.g., `add_user_prefs`, `create_po_header`)
- **Single init migration**: The project currently uses a single `init` migration that creates all tables at once
- **Non-destructive changes**: Prefer additive migrations (add columns, tables). For destructive changes (drop column, rename), review the generated SQL carefully
- **No manual edits**: Do not manually edit generated `migration.sql` files unless absolutely necessary

## Useful Commands

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev --name <name>` | Create and apply a new migration in development |
| `npx prisma migrate deploy` | Apply pending migrations in production/CI |
| `npx prisma migrate reset` | Reset the database and re-apply all migrations (destructive) |
| `npx prisma db push` | Push schema changes without creating a migration file (prototyping only) |
| `npx prisma generate` | Regenerate the Prisma Client after schema changes |


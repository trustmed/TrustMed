# Database Migrations Guide

## Overview

This project uses **TypeORM migrations** to manage database schema changes safely. A single configuration file (`database.config.ts`) handles both NestJS runtime and TypeORM CLI operations.

**Important:** This project uses **manual registration** of entities and migrations (not glob patterns) for better type safety and explicit control.

---

## Migration Commands

### **Generate migration from entity changes**
```bash
# 1. Build your project to compile TypeScript
pnpm build

# 2. Generate migration based on entity changes
pnpm migration:generate src/entities/migrations/DescriptiveName
```

### **Create a new empty migration**
```bash
pnpm migration:create src/entities/migrations/YourMigrationName
```

### **Run pending migrations**
```bash
pnpm migration:run
```

### **Revert last migration**
```bash
pnpm migration:revert
```

### **Show migration status**
```bash
pnpm migration:show
```

---

## Directory Structure

```
src/
├── entities/
│   ├── migrations/           # All migration files go here
│   │   ├── 1234567890-CreateUserTable.ts
│   │   └── 1234567891-AddPhoneToUser.ts
│   ├── base.entity.ts
│   └── test-user.entity.ts
└── config/
    └── database.config.ts    # Single config for both NestJS & CLI
```

---

## Workflow Example

### Scenario 1: Creating a New Entity

1. **Create the entity**
   ```typescript
   // src/entities/user.entity.ts
   import { Entity, Column } from 'typeorm';
   import { BaseEntity } from './base.entity';

   @Entity('users')
   export class User extends BaseEntity {
     @Column({ length: 100 })
     name: string;
     
     @Column({ unique: true })
     email: string;
   }
   ```

2. **Register entity in database.config.ts** ⚠️ **REQUIRED**
   
   Open `src/config/database.config.ts` and add your entity to the imports and arrays:
   
   ```typescript
   import { User } from '../entities/user.entity';
   
   const baseConfig = {
     // ...other config
     entities: [User], // Add your entity class here
     migrations: [
       // ...existing migrations
     ],
   };
   
   export const getDatabaseConfig = (configService: ConfigService) => ({
     // ...other config
     entities: [User], // Add your entity class here too
     migrations: [
       // ...existing migrations
     ],
   });
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Generate migration**
   ```bash
   pnpm migration:generate src/entities/migrations/CreateUserTable
   ```
   This creates: `src/entities/migrations/1234567890-CreateUserTable.ts`

5. **Register migration in database.config.ts** ⚠️ **REQUIRED**
   
   Import the generated migration **class** and add it to both configs:
   
   ```typescript
   import { CreateUserTable1234567890 } from '../entities/migrations/1234567890-CreateUserTable';
   
   const baseConfig = {
     // ...other config
     entities: [User],
     migrations: [
       CreateUserTable1234567890, // Add migration class (not path!)
     ],
   };
   
   export const getDatabaseConfig = (configService: ConfigService) => ({
     // ...other config
     entities: [User],
     migrations: [
       CreateUserTable1234567890, // Add migration class (not path!)
     ],
   });
   ```
   
   **Note:** Use the migration **class name**, NOT file paths like `'dist/migrations/*.js'`

6. **Review the generated migration**
   - Check the `up()` method (creates table)
   - Check the `down()` method (drops table)

7. **Build again** (to compile the new migration)
   ```bash
   pnpm build
   ```

8. **Run the migration**
   ```bash
   pnpm migration:run
   ```

9. **Verify in database**
   Check that the `users` table and `migrations` table exist

---

### Scenario 2: Modifying an Existing Entity

1. **Update the entity**
   ```typescript
   // src/entities/user.entity.ts
   @Entity('users')
   export class User extends BaseEntity {
     @Column({ length: 100 })
     name: string;
     
     @Column({ unique: true })
     email: string;
     
     // NEW FIELD
     @Column({ length: 20, nullable: true })
     phone: string;
   }
   ```

2. **Build and generate migration**
   ```bash
   pnpm build
   pnpm migration:generate src/entities/migrations/AddPhoneToUser
   ```

3. **Register the new migration class in database.config.ts** ⚠️ **REQUIRED**
   ```typescript
   import { AddPhoneToUser1234567891 } from '../entities/migrations/1234567891-AddPhoneToUser';
   
   const baseConfig = {
     // ...other config
     entities: [User],
     migrations: [
       CreateUserTable1234567890,
       AddPhoneToUser1234567891, // Add new migration class
     ],
   };
   
   export const getDatabaseConfig = (configService: ConfigService) => ({
     // ...other config
     entities: [User],
     migrations: [
       CreateUserTable1234567890,
       AddPhoneToUser1234567891, // Add new migration class
     ],
   });
   ```

4. **Build and run the migration**
   ```bash
   pnpm build
   pnpm migration:run
   ```

---

### Scenario 3: Rolling Back Changes

1. **Revert the last migration**
   ```bash
   pnpm migration:revert
   ```
   This executes the `down()` method and removes the changes.

2. **Revert multiple migrations**
   Run `pnpm migration:revert` multiple times:
   ```bash
   pnpm migration:revert  # Reverts last
   pnpm migration:revert  # Reverts second-to-last
   ```

3. **Check status**
   ```bash
   pnpm migration:show
   ```
   Shows which migrations are executed and which are pending.

---

## Configuration Details

### **Manual Class Registration (Not Glob Patterns)** ⚠️

This project uses **explicit class imports** instead of glob patterns for better type safety:

```typescript
// src/config/database.config.ts
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { CreateUserTable1234567890 } from '../entities/migrations/1234567890-CreateUserTable';
import { AddPhoneToUser1234567891 } from '../entities/migrations/1234567891-AddPhoneToUser';

const baseConfig = {
  type: 'mysql' as const,
  // ...other config
  entities: [
    User,
    Product,
    // Add all entity CLASSES here
  ],
  migrations: [
    CreateUserTable1234567890,
    AddPhoneToUser1234567891,
    // Add all migration CLASSES here in chronological order
  ],
  synchronize: false,
};

export const getDatabaseConfig = (configService: ConfigService) => ({
  type: 'mysql',
  // ...other config
  entities: [
    User,
    Product,
    // Add all entity CLASSES here (same as above)
  ],
  migrations: [
    CreateUserTable1234567890,
    AddPhoneToUser1234567891,
    // Add all migration CLASSES here (same as above)
  ],
  migrationsRun: configService.get('RUN_MIGRATIONS') === 'true',
  synchronize: configService.get('NODE_ENV') !== 'production',
});

const dataSource = new DataSource(baseConfig as DataSourceOptions);
export default dataSource;
```

**Why use class imports instead of glob patterns?**
- ✅ TypeScript type safety and compile-time checks
- ✅ Explicit control over what's loaded
- ✅ IDE autocomplete and refactoring support
- ✅ Clear dependency tree
- ✅ No runtime path resolution issues
- ❌ Requires manual updates when adding entities/migrations

**Common mistake:**
```typescript
// ❌ DON'T use file paths:
migrations: ['dist/entities/migrations/*.js']

// ✅ DO use class imports:
import { MyMigration } from '../entities/migrations/123-MyMigration';
migrations: [MyMigration]
```

---

## Environment Configuration

### **Development (`.env`)**
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=trustmed
RUN_MIGRATIONS=false  # Run manually in dev
```

### **Production (`.env`)**
```env
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=3306
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=trustmed_prod
RUN_MIGRATIONS=true  # Auto-run on startup
```

---

## Quick Checklist

**When creating a new entity:**
- [ ] Create entity file in `src/entities/`
- [ ] Import entity class in `database.config.ts`
- [ ] Add entity class to `baseConfig.entities[]`
- [ ] Add entity class to `getDatabaseConfig().entities[]`
- [ ] Run `pnpm build`
- [ ] Run `pnpm migration:generate src/entities/migrations/DescriptiveName`
- [ ] Import migration class in `database.config.ts`
- [ ] Add migration class to `baseConfig.migrations[]`
- [ ] Add migration class to `getDatabaseConfig().migrations[]`
- [ ] Run `pnpm build` again
- [ ] Run `pnpm migration:run`
- [ ] Verify in database

---

## Best Practices

### ✅ DO:
1. **Always register entity and migration classes** in `database.config.ts` immediately after creating them

2. **Build before and after generating migrations**
   ```bash
   pnpm build  # Before generating
   pnpm migration:generate src/entities/migrations/YourMigration
   pnpm build  # After generating (to compile new migration)
   ```

3. **Use migration class imports, not file paths**
   ```typescript
   import { MyMigration123 } from '../entities/migrations/123-MyMigration';
   migrations: [MyMigration123]
   ```

4. **Review generated migrations** - Check both `up()` and `down()` methods

5. **Use descriptive names**:
   - ✅ `CreateUserTable`
   - ✅ `AddPhoneToUser`
   - ✅ `RemoveDeprecatedFields`
   - ❌ `Migration1`
   - ❌ `Update`

6. **Keep migrations in chronological order** in the config file

7. **Test in development first** before running in production

8. **Keep migrations in version control** - Commit them with your code

### ❌ DON'T:
1. **Never use glob patterns** like `'dist/migrations/*.js'` - Use class imports
2. **Never modify executed migrations** - Create a new one instead
3. **Never delete migration files** after they've been run
4. **Never use `synchronize: true` in production** (already disabled)
5. **Don't skip the build step** - Migrations need compiled JavaScript
6. **Don't forget to import and register** new entities/migrations

---

## Troubleshooting

### **"No migrations are pending"**
✅ This means all migrations have already run. Check:
```bash
pnpm migration:show
```

### **"Cannot find module" or migration not detected**
❌ Check these things:
1. Did you forget to build? Run: `pnpm build`
2. Did you import the migration **class** in `database.config.ts`?
   ```typescript
   import { YourMigration } from '../entities/migrations/1234-YourMigration';
   ```
3. Did you add the class to both `baseConfig.migrations[]` and `getDatabaseConfig().migrations[]`?
4. Are you using the class name (✅) or a file path string (❌)?

### **"QueryFailedError: Table 'users' already exists"**
The entity was synced but migration wasn't recorded. Either:
- Drop the table and re-run migration
- Or manually insert into migrations table

### **Migration failed mid-execution**
🔄 Revert and try again:
```bash
pnpm migration:revert
# Fix the issue
pnpm build
pnpm migration:run
```

### **TypeScript compilation error in migration file**
Your migration file may have TypeScript errors. Check the generated file and fix any issues before building.

### **Need to reset database completely**
```bash
# Drop all tables manually in MySQL
# Then re-run all migrations
pnpm migration:run
```

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Set `RUN_MIGRATIONS=true` (or run manually)
- [ ] Verify all entities imported and registered in `database.config.ts`
- [ ] Verify all migrations imported and registered in `database.config.ts`
- [ ] Build the project: `pnpm build`
- [ ] Test migrations in staging environment first
- [ ] Backup database before running migrations
- [ ] Run migrations: `pnpm migration:run`
- [ ] Verify tables were created/updated correctly
- [ ] Start application: `pnpm start:prod`

---

## Migration File Structure

When you generate a migration, it creates a file like this:

```typescript
// src/entities/migrations/1234567890-CreateUserTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1234567890 implements MigrationInterface {
    name = 'CreateUserTable1234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // SQL to apply changes
        await queryRunner.query(`CREATE TABLE ...`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // SQL to revert changes
        await queryRunner.query(`DROP TABLE ...`);
    }
}
```

**Key points:**
- Export name matches the class name
- `up()` applies the changes
- `down()` reverts the changes
- Import this class in `database.config.ts` to register it

---

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM DataSource API](https://typeorm.io/data-source)

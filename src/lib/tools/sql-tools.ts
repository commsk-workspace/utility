// SQL Tools Utility Functions
import { format } from 'sql-formatter';

type ToolResult<T> = { success: boolean; data?: T; error?: string };

export function formatSql(sql: string, language: SqlLanguage = 'sql'): ToolResult<string> {
  try {
    const formatted = format(sql, {
      language,
      tabWidth: 2,
      keywordCase: 'upper',
      linesBetweenQueries: 2,
    });
    return { success: true, data: formatted };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to format SQL' };
  }
}

export function minifySql(sql: string): ToolResult<string> {
  try {
    const minified = sql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([,;()])\s*/g, '$1')
      .trim();
    return { success: true, data: minified };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to minify SQL' };
  }
}

export function validateSql(sql: string): ToolResult<boolean> {
  try {
    format(sql, { language: 'sql' });
    return { success: true, data: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid SQL' };
  }
}

export function sqlToPrisma(sql: string): ToolResult<string> {
  try {
    const tables = parseCreateTableStatements(sql);
    const schema = generatePrismaSchema(tables);
    return { success: true, data: schema };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to convert SQL to Prisma' };
  }
}

export function sqlToTypeORM(sql: string): ToolResult<string> {
  try {
    const tables = parseCreateTableStatements(sql);
    const entities = generateTypeORMEntities(tables);
    return { success: true, data: entities };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to convert SQL to TypeORM' };
  }
}

export function sqlToDrizzle(sql: string): ToolResult<string> {
  try {
    const tables = parseCreateTableStatements(sql);
    const schema = generateDrizzleSchema(tables);
    return { success: true, data: schema };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to convert SQL to Drizzle' };
  }
}

export type SqlLanguage = 
  | 'sql'
  | 'bigquery'
  | 'db2'
  | 'db2i'
  | 'hive'
  | 'mariadb'
  | 'mysql'
  | 'n1ql'
  | 'plsql'
  | 'postgresql'
  | 'redshift'
  | 'singlestoredb'
  | 'snowflake'
  | 'spark'
  | 'sqlite'
  | 'transactsql'
  | 'trino'
  | 'tsql';

export const sqlLanguages: { value: SqlLanguage; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'plsql', label: 'PL/SQL (Oracle)' },
  { value: 'transactsql', label: 'T-SQL (SQL Server)' },
];

interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  primaryKey?: string[];
  foreignKeys: ForeignKeyDefinition[];
}

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  autoIncrement: boolean;
  unique: boolean;
}

interface ForeignKeyDefinition {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

function parseCreateTableStatements(sql: string): TableDefinition[] {
  const tables: TableDefinition[] = [];
  
  // Match CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(([\s\S]*?)\);/gi;
  
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const columnsStr = match[2];
    
    const table: TableDefinition = {
      name: tableName,
      columns: [],
      foreignKeys: [],
    };
    
    // Split by comma, but not within parentheses
    const parts = splitByComma(columnsStr);
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      // Check for PRIMARY KEY
      if (/^PRIMARY\s+KEY/i.test(trimmed)) {
        const pkMatch = trimmed.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          table.primaryKey = pkMatch[1].split(',').map(s => s.trim().replace(/[`"]/g, ''));
        }
        continue;
      }
      
      // Check for FOREIGN KEY
      if (/^FOREIGN\s+KEY/i.test(trimmed)) {
        const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*\([`"]?(\w+)[`"]?\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\([`"]?(\w+)[`"]?\)/i);
        if (fkMatch) {
          table.foreignKeys.push({
            column: fkMatch[1],
            referencedTable: fkMatch[2],
            referencedColumn: fkMatch[3],
          });
        }
        continue;
      }
      
      // Parse column definition
      const column = parseColumnDefinition(trimmed);
      if (column) {
        table.columns.push(column);
      }
    }
    
    tables.push(table);
  }
  
  return tables;
}

function splitByComma(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  
  for (const char of str) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  
  if (current.trim()) {
    parts.push(current);
  }
  
  return parts;
}

function parseColumnDefinition(str: string): ColumnDefinition | null {
  // Match column name and type
  const match = str.match(/^[`"]?(\w+)[`"]?\s+(\w+(?:\([^)]+\))?)/i);
  if (!match) return null;
  
  const name = match[1];
  const type = match[2].toUpperCase();
  const rest = str.slice(match[0].length).toUpperCase();
  
  return {
    name,
    type,
    nullable: !rest.includes('NOT NULL'),
    autoIncrement: rest.includes('AUTO_INCREMENT') || rest.includes('SERIAL'),
    unique: rest.includes('UNIQUE'),
    defaultValue: extractDefault(str),
  };
}

function extractDefault(str: string): string | undefined {
  const match = str.match(/DEFAULT\s+([^\s,]+|'[^']*')/i);
  return match ? match[1] : undefined;
}

function generatePrismaSchema(tables: TableDefinition[]): string {
  let schema = `// This is your Prisma schema file
// Generated from SQL

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;
  
  for (const table of tables) {
    schema += `model ${toPascalCase(table.name)} {\n`;
    
    for (const column of table.columns) {
      const prismaType = sqlTypeToPrisma(column.type, column.autoIncrement);
      const isId = table.primaryKey?.includes(column.name) || column.name.toLowerCase() === 'id';
      
      let line = `  ${column.name} ${prismaType}`;
      
      if (isId) {
        line += ' @id';
        if (column.autoIncrement) {
          line += ' @default(autoincrement())';
        }
      }
      
      if (column.unique && !isId) {
        line += ' @unique';
      }
      
      if (column.defaultValue && !isId) {
        const defaultVal = parseDefaultValue(column.defaultValue, prismaType);
        if (defaultVal) {
          line += ` @default(${defaultVal})`;
        }
      }
      
      if (!column.nullable && !isId) {
        // Prisma fields are required by default
      } else if (column.nullable && !isId) {
        line = line.replace(prismaType, prismaType + '?');
      }
      
      schema += line + '\n';
    }
    
    // Add relations for foreign keys
    for (const fk of table.foreignKeys) {
      const relatedModel = toPascalCase(fk.referencedTable);
      schema += `  ${fk.referencedTable} ${relatedModel} @relation(fields: [${fk.column}], references: [${fk.referencedColumn}])\n`;
    }
    
    schema += '}\n\n';
  }
  
  return schema.trim();
}

function sqlTypeToPrisma(sqlType: string, isAutoIncrement: boolean): string {
  const type = sqlType.toUpperCase();
  
  if (type.includes('INT') || type.includes('SERIAL')) {
    return 'Int';
  }
  if (type.includes('BIGINT') || type.includes('BIGSERIAL')) {
    return 'BigInt';
  }
  if (type.includes('FLOAT') || type.includes('DOUBLE') || type.includes('REAL')) {
    return 'Float';
  }
  if (type.includes('DECIMAL') || type.includes('NUMERIC')) {
    return 'Decimal';
  }
  if (type.includes('BOOL')) {
    return 'Boolean';
  }
  if (type.includes('DATE') && !type.includes('TIME')) {
    return 'DateTime @db.Date';
  }
  if (type.includes('TIME') && !type.includes('DATE')) {
    return 'DateTime @db.Time';
  }
  if (type.includes('TIMESTAMP') || type.includes('DATETIME')) {
    return 'DateTime';
  }
  if (type.includes('JSON')) {
    return 'Json';
  }
  if (type.includes('TEXT')) {
    return 'String @db.Text';
  }
  if (type.includes('UUID')) {
    return 'String @db.Uuid';
  }
  if (type.includes('CHAR') || type.includes('VARCHAR')) {
    return 'String';
  }
  if (type.includes('BLOB') || type.includes('BYTEA')) {
    return 'Bytes';
  }
  
  return 'String';
}

function parseDefaultValue(value: string, prismaType: string): string | null {
  const val = value.replace(/^'|'$/g, '');
  
  if (val.toUpperCase() === 'NOW()' || val.toUpperCase() === 'CURRENT_TIMESTAMP') {
    return 'now()';
  }
  if (val.toUpperCase() === 'TRUE') return 'true';
  if (val.toUpperCase() === 'FALSE') return 'false';
  if (val.toUpperCase() === 'NULL') return null;
  
  if (prismaType === 'String') {
    return `"${val}"`;
  }
  if (prismaType === 'Int' || prismaType === 'Float' || prismaType === 'BigInt') {
    return val;
  }
  
  return null;
}

function toPascalCase(str: string): string {
  return str
    .split(/[_\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function generateTypeORMEntities(tables: TableDefinition[]): string {
  const entities: string[] = [];
  
  entities.push(`import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';\n`);
  
  for (const table of tables) {
    const className = toPascalCase(table.name);
    const lines: string[] = [];
    
    lines.push(`@Entity('${table.name}')`);
    lines.push(`export class ${className} {`);
    
    for (const column of table.columns) {
      const isPrimary = table.primaryKey?.includes(column.name);
      const tsType = mapToTypeScriptType(column.type);
      
      if (isPrimary && column.autoIncrement) {
        lines.push(`  @PrimaryGeneratedColumn()`);
      } else if (isPrimary) {
        lines.push(`  @Column({ primary: true })`);
      } else {
        const options: string[] = [];
        if (!column.nullable) options.push('nullable: false');
        if (column.unique) options.push('unique: true');
        if (column.defaultValue) options.push(`default: ${column.defaultValue}`);
        
        const optStr = options.length > 0 ? `{ ${options.join(', ')} }` : '';
        lines.push(`  @Column(${optStr})`);
      }
      
      lines.push(`  ${toCamelCase(column.name)}${column.nullable ? '?' : ''}: ${tsType};`);
      lines.push('');
    }
    
    lines.push('}');
    entities.push(lines.join('\n'));
  }
  
  return entities.join('\n\n');
}

function generateDrizzleSchema(tables: TableDefinition[]): string {
  const schemas: string[] = [];
  
  schemas.push(`import { mysqlTable, serial, varchar, int, boolean, timestamp, text } from 'drizzle-orm/mysql-core';\n`);
  
  for (const table of tables) {
    const lines: string[] = [];
    lines.push(`export const ${toCamelCase(table.name)} = mysqlTable('${table.name}', {`);
    
    for (const column of table.columns) {
      const drizzleType = mapToDrizzleType(column);
      lines.push(`  ${toCamelCase(column.name)}: ${drizzleType},`);
    }
    
    lines.push('});');
    schemas.push(lines.join('\n'));
  }
  
  return schemas.join('\n\n');
}

function mapToTypeScriptType(sqlType: string): string {
  const type = sqlType.toUpperCase();
  if (type.includes('INT') || type.includes('SERIAL')) return 'number';
  if (type.includes('FLOAT') || type.includes('DOUBLE') || type.includes('DECIMAL')) return 'number';
  if (type.includes('BOOL')) return 'boolean';
  if (type.includes('DATE') || type.includes('TIME')) return 'Date';
  if (type.includes('JSON')) return 'object';
  return 'string';
}

function mapToDrizzleType(column: ColumnDefinition): string {
  const type = column.type.toUpperCase();
  const name = `'${column.name}'`;
  
  if (column.autoIncrement) return `serial(${name})`;
  if (type.includes('INT')) return `int(${name})`;
  if (type.includes('BOOL')) return `boolean(${name})`;
  if (type.includes('TEXT')) return `text(${name})`;
  if (type.includes('TIMESTAMP') || type.includes('DATETIME')) return `timestamp(${name})`;
  if (type.includes('VARCHAR') || type.includes('CHAR')) {
    const match = type.match(/\((\d+)\)/);
    const length = match ? match[1] : '255';
    return `varchar(${name}, { length: ${length} })`;
  }
  return `varchar(${name}, { length: 255 })`;
}

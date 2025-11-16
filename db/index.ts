import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { schema } from './schema';

const expo = SQLite.openDatabaseSync('youstrict.db');

export const db = drizzle(expo, {
  schema: schema,
});

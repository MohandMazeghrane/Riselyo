import { SCHEMA_V1, SCHEMA_V2 } from '../schema';

/** Every table of the current schema, in a module without Zod (loaded at startup). */
export const ALL_TABLES = Object.keys({ ...SCHEMA_V1, ...SCHEMA_V2 });

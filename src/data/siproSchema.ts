export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  defaultVal?: string;
  pk?: boolean;
}

export interface ForeignKey {
  column: string;
  refTable: string;
  refColumn: string;
}

export interface TableDef {
  name: string;
  schema: string;
  category: "lookup" | "fact" | "system";
  description: string;
  columns: ColumnDef[];
  foreignKeys: ForeignKey[];
}

import data from "./json/siproSchema.json";

export const siproTables: TableDef[] = data.siproTables as TableDef[];

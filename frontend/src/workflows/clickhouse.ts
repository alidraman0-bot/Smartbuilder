export async function insertClickhouse(table: string, data: any) {
    console.log(`[ClickHouse] Inserting into ${table}:`, data);
    return true;
}

export async function queryClickhouse(query: string) {
    console.log(`[ClickHouse] Querying: ${query}`);
    return [];
}

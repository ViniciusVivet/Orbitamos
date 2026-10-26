/* SQL is executed only in a fresh in-memory SQLite database inside this Worker. */
let runtime;
self.onmessage = async ({ data }) => {
  let db;
  try {
    if (!Array.isArray(data.history) || data.history.length > 5 || typeof data.code !== "string" || [data.code, ...data.history].some(sql => typeof sql !== "string" || sql.length > 8000)) throw new Error("Código acima do limite desta oficina.");
    if (!runtime) {
      importScripts("/vendor/sqljs/sql-wasm.js");
      runtime = self.initSqlJs({ locateFile: file => `/vendor/sqljs/${file}` });
    }
    const SQL = await runtime;
    self.postMessage({ type: "ready" });
    db = new SQL.Database();
    db.run("PRAGMA max_page_count=256;");
    let truncated = false;
    const execute = sql => {
      let query = null;
      let count = 0;
      for (const statement of db.iterateStatements(sql)) {
        if (++count > 30) throw new Error("Use até 30 instruções por etapa.");
        const columns = statement.getColumnNames();
        const values = [];
        while (statement.step()) {
          if (values.length >= 200) { truncated = true; break; }
          values.push(statement.get().map(value => {
            if (value instanceof Uint8Array) { truncated = true; return "[binário]"; }
            if (typeof value === "string" && value.length > 1000) { truncated = true; return value.slice(0, 1000); }
            return value;
          }));
        }
        if (columns.length) query = { columns, values };
      }
      return query;
    };
    for (const sql of data.history) execute(sql);
    const query = execute(data.code);
    const schemaRows = db.exec("PRAGMA table_info('produtos')")[0]?.values ?? [];
    const schema = schemaRows.map(row => ({ name: row[1], type: row[2], notnull: row[3], pk: row[5] }));
    const tables = db.exec("PRAGMA table_list")[0]?.values ?? [];
    const strict = tables.some(row => row[1] === "produtos" && row[5] === 1);
    const exists = schema.length > 0;
    // Never interpolate a student's identifier into this inspection query.
    const hasId = schema.some(column => column.name === "id");
    const result = exists ? db.exec(`SELECT * FROM produtos${hasId ? " ORDER BY id" : ""} LIMIT 201`)[0] : null;
    if (result?.values.length > 200) truncated = true;
    const table = exists ? { columns: result?.columns ?? schema.map(column => column.name), values: (result?.values ?? []).slice(0, 200) } : null;
    self.postMessage({ type: "result", snapshot: { table, schema, strict, query, truncated } });
  } catch (error) {
    self.postMessage({ type: "result", snapshot: { table: null, schema: [], strict: false, query: null, error: String(error.message || error) } });
  } finally { db?.close(); }
};

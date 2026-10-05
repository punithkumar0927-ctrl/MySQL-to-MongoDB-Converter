import { useMemo, useState } from 'react';
import { Check, Copy, Database, RefreshCw, Sparkles } from 'lucide-react';

type Example = {
  label: string;
  query: string;
};

const examples: Example[] = [
  {
    label: 'SELECT',
    query:
      'SELECT name, email, age FROM users WHERE age > 25 AND status = "active" ORDER BY age DESC LIMIT 10',
  },
  {
    label: 'INSERT',
    query:
      'INSERT INTO products (name, price, stock) VALUES ("Laptop", 999, 25)',
  },
  {
    label: 'UPDATE',
    query: 'UPDATE users SET status = "inactive", updated_at = "2026-10-05" WHERE id = 4',
  },
  {
    label: 'DELETE',
    query: 'DELETE FROM orders WHERE status = "cancelled" AND created_at < "2026-01-01"',
  },
];

function formatValue(raw: string): string | number | boolean | null {
  const trimmed = raw.trim();

  if (trimmed === 'NULL' || trimmed === 'null') {
    return null;
  }

  if (/^true$/i.test(trimmed) || /^false$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true';
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  const stripped = trimmed.replace(/^['"]|['"]$/g, '');
  return stripped;
}

function convertCondition(condition: string): Record<string, unknown> {
  const normalized = condition.trim();

  const inMatch = normalized.match(/^([A-Za-z0-9_.]+)\s+IN\s*\((.*)\)$/i);
  if (inMatch) {
    const [, field, valuesString] = inMatch;
    const values = valuesString
      .split(',')
      .map((value) => formatValue(value))
      .filter((value) => value !== undefined);
    return { [field]: { $in: values } };
  }

  const likeMatch = normalized.match(/^([A-Za-z0-9_.]+)\s+LIKE\s*(.+)$/i);
  if (likeMatch) {
    const [, field, value] = likeMatch;
    return { [field]: { $regex: formatValue(value) as string, $options: 'i' } };
  }

  const nullMatch = normalized.match(/^([A-Za-z0-9_.]+)\s+IS\s+NULL$/i);
  if (nullMatch) {
    const [, field] = nullMatch;
    return { [field]: null };
  }

  const comparisonMatch = normalized.match(/^([A-Za-z0-9_.]+)\s*(>=|<=|!=|<>|=|>|<)\s*(.+)$/i);
  if (comparisonMatch) {
    const [, field, operator, rawValue] = comparisonMatch;
    const value = formatValue(rawValue);

    switch (operator) {
      case '=':
        return { [field]: value };
      case '>':
        return { [field]: { $gt: value } };
      case '<':
        return { [field]: { $lt: value } };
      case '>=':
        return { [field]: { $gte: value } };
      case '<=':
        return { [field]: { $lte: value } };
      case '!=':
      case '<>':
        return { [field]: { $ne: value } };
      default:
        return { [field]: value };
    }
  }

  return {};
}

function convertWhereClause(whereClause: string): string {
  const clause = whereClause.trim();
  if (!clause) {
    return '{}';
  }

  const andGroups = clause.split(/\s+AND\s+/i).map((part) => part.trim());
  const filters: Record<string, unknown>[] = [];

  andGroups.forEach((group) => {
    const orGroups = group.split(/\s+OR\s+/i).map((part) => part.trim());
    const groupFilters = orGroups.map((part) => convertCondition(part));

    if (groupFilters.length > 1) {
      filters.push({ $or: groupFilters });
    } else if (groupFilters[0]) {
      filters.push(groupFilters[0]);
    }
  });

  if (filters.length === 1) {
    return JSON.stringify(filters[0], null, 2);
  }

  return JSON.stringify({ $and: filters }, null, 2);
}

function convertSelectStatement(sql: string): string {
  const normalized = sql.replace(/;\s*$/, '').trim();
  const selectMatch = normalized.match(
    /^SELECT\s+(.+?)\s+FROM\s+([A-Za-z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+HAVING\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i,
  );

  if (!selectMatch) {
    return 'db.collection.find({})';
  }

  const [, selectColumns, tableName, whereClause, , , orderByClause, limitClause] = selectMatch;
  const fields = selectColumns.split(',').map((field) => field.trim());
  const projection = fields.includes('*') ? '{}' : JSON.stringify(Object.fromEntries(fields.map((field) => [field, 1])), null, 2);

  const baseFind = `db.${tableName}.find(${convertWhereClause(whereClause ?? '')})`;
  const sortText = orderByClause ? `.sort(${JSON.stringify(String(orderByClause).split(' ')[0] ? { [String(orderByClause).split(' ')[0]]: String(orderByClause).split(' ')[1]?.toLowerCase() === 'desc' ? -1 : 1 } : {}, null, 2)})` : '';
  const limitText = limitClause ? `.limit(${limitClause})` : '';
  const projectionText = fields.includes('*') ? '' : `.project(${projection})`;

  return `${baseFind}${projectionText}${sortText}${limitText}`;
}

function convertInsertStatement(sql: string): string {
  const normalized = sql.replace(/;\s*$/, '').trim();
  const insertMatch = normalized.match(/^INSERT\s+INTO\s+([A-Za-z0-9_]+)\s*\((.*?)\)\s*VALUES\s*\((.*)\)$/i);

  if (!insertMatch) {
    return 'db.collection.insertOne({})';
  }

  const [, tableName, columnsRaw, valuesRaw] = insertMatch;
  const columns = columnsRaw.split(',').map((column) => column.trim());
  const values = valuesRaw
    .split(',')
    .map((value) => value.trim())
    .map((value) => formatValue(value));

  const document = Object.fromEntries(columns.map((column, index) => [column, values[index]]));

  return `db.${tableName}.insertOne(${JSON.stringify(document, null, 2)})`;
}

function convertUpdateStatement(sql: string): string {
  const normalized = sql.replace(/;\s*$/, '').trim();
  const updateMatch = normalized.match(/^UPDATE\s+([A-Za-z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+(.+)$/i);

  if (!updateMatch) {
    return 'db.collection.updateMany({}, {})';
  }

  const [, tableName, assignmentsRaw, whereClause] = updateMatch;
  const document = Object.fromEntries(
    assignmentsRaw
      .split(',')
      .map((pair) => pair.trim())
      .map((pair) => {
        const match = pair.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/i);
        if (!match) return ['', ''];
        const [, key, value] = match;
        return [key, formatValue(value)];
      })
      .filter(([key]) => key),
  );

  return `db.${tableName}.updateMany(${convertWhereClause(whereClause)}, ${JSON.stringify(document, null, 2)})`;
}

function convertDeleteStatement(sql: string): string {
  const normalized = sql.replace(/;\s*$/, '').trim();
  const deleteMatch = normalized.match(/^DELETE\s+FROM\s+([A-Za-z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);

  if (!deleteMatch) {
    return 'db.collection.deleteMany({})';
  }

  const [, tableName, whereClause] = deleteMatch;
  return `db.${tableName}.deleteMany(${convertWhereClause(whereClause ?? '')})`;
}

function convertSqlToMongo(sql: string): string {
  const trimmed = sql.trim();

  if (!trimmed) {
    return 'db.collection.find({})';
  }

  if (/^SELECT\s+/i.test(trimmed)) {
    return convertSelectStatement(trimmed);
  }

  if (/^INSERT\s+INTO\s+/i.test(trimmed)) {
    return convertInsertStatement(trimmed);
  }

  if (/^UPDATE\s+/i.test(trimmed)) {
    return convertUpdateStatement(trimmed);
  }

  if (/^DELETE\s+FROM\s+/i.test(trimmed)) {
    return convertDeleteStatement(trimmed);
  }

  return 'db.collection.find({})';
}

export default function App() {
  const [input, setInput] = useState<string>(examples[0].query);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => convertSqlToMongo(input), [input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                SQL2Mongo
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                MySQL to MongoDB Converter
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <Database className="h-4 w-4" />
              Local conversion • No server required
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-cyan-500/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-100">MySQL Query</h2>
              <button
                type="button"
                onClick={() => setInput(examples[Math.floor(Math.random() * examples.length)].query)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
              >
                <RefreshCw className="h-4 w-4" />
                Example
              </button>
            </div>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Enter your MySQL query..."
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setInput(example.query)}
                  className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-fuchsia-500/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-100">MongoDB Query</h2>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="min-h-[280px] overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm leading-7 text-emerald-300">
              {output}
            </pre>
          </section>
        </main>
      </div>
    </div>
  );
}

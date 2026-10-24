import { useEffect, useRef, useState } from 'react';
import { addDatabaseChangeListener } from 'expo-sqlite';

// Like drizzle's useLiveQuery, but re-runs when *any* of `tables` changes
// (useLiveQuery only watches the root table, so joins go stale).
export function useDbQuery<T>(run: () => T, tables: string[], deps: unknown[]): T {
  const runRef = useRef(run);
  runRef.current = run;
  const [data, setData] = useState<T>(run);

  useEffect(() => {
    setData(runRef.current());
    let scheduled = false;
    const sub = addDatabaseChangeListener(({ tableName }) => {
      if (!tables.includes(tableName) || scheduled) return;
      // A sync touches thousands of rows; coalesce into one re-query.
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        setData(runRef.current());
      }, 50);
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}

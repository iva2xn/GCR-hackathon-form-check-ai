
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { HistoryReportData } from '../App';

const DB_NAME = 'FormCheckDB';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

interface FormCheckDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: HistoryReportData;
  };
}

let dbPromise: Promise<IDBPDatabase<FormCheckDB>> | null = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB<FormCheckDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return dbPromise;
};

export const addReport = async (report: HistoryReportData) => {
  const db = await initDB();
  return db.put(STORE_NAME, report);
};

export const getAllReports = async (): Promise<HistoryReportData[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteReport = async (id: number) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};

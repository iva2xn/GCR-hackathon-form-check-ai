import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { HistoryReportData } from '../pages/FormCheckerPage';
import type { DailyUpdate } from '../types';

const DB_NAME = 'FitTrackDB';
const DB_VERSION = 3; 
const REPORTS_STORE_NAME = 'reports';
const UPDATES_STORE_NAME = 'dailyUpdates';

interface FitTrackDB extends DBSchema {
  [REPORTS_STORE_NAME]: {
    key: number;
    value: HistoryReportData;
  };
  [UPDATES_STORE_NAME]: {
    key: number;
    value: DailyUpdate;
  };
}

let dbPromise: Promise<IDBPDatabase<FitTrackDB>> | null = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB<FitTrackDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      switch (oldVersion) {
        case 0:
          if (!db.objectStoreNames.contains(REPORTS_STORE_NAME)) {
            db.createObjectStore(REPORTS_STORE_NAME, { keyPath: 'id' });
          }
        case 1:
          if (!db.objectStoreNames.contains(UPDATES_STORE_NAME)) {
            db.createObjectStore(UPDATES_STORE_NAME, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
          }
        case 2:
          // The schema for dailyUpdates was updated, but since IndexedDB is schemaless for values,
          // no destructive recreation is needed. This ensures data persistence.
          if (!db.objectStoreNames.contains(UPDATES_STORE_NAME)) {
            db.createObjectStore(UPDATES_STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true
            });
          }
      }
    },
  });
  return dbPromise;
};

// Functions for Form Checker Reports
export const addReport = async (report: HistoryReportData) => {
  const db = await initDB();
  return db.put(REPORTS_STORE_NAME, report);
};

export const getAllReports = async (): Promise<HistoryReportData[]> => {
  const db = await initDB();
  return db.getAll(REPORTS_STORE_NAME);
};

export const deleteReport = async (id: number) => {
  const db = await initDB();
  return db.delete(REPORTS_STORE_NAME, id);
};

// Functions for Daily Updates
export const addDailyUpdate = async (update: DailyUpdate) => {
    const db = await initDB();
    return db.put(UPDATES_STORE_NAME, update);
};

export const getAllDailyUpdates = async (): Promise<DailyUpdate[]> => {
    const db = await initDB();
    return db.getAll(UPDATES_STORE_NAME);
};
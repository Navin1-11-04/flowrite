export function openDB(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    console.log('Opening IndexedDB:', dbName, storeName);
    
    if (!window.indexedDB) {
      console.error('IndexedDB not supported');
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      console.log('IndexedDB upgrade needed');
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        console.log('Creating object store:', storeName);
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('IndexedDB open blocked');
    };
  });
}

export function saveToDB(db: IDBDatabase, storeName: string, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Saving to IndexedDB:', key);
    
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.put(value, key);

      request.onsuccess = () => {
        console.log('Data saved successfully to IndexedDB');
        resolve();
      };
      
      request.onerror = () => {
        console.error('IndexedDB save error:', request.error);
        reject(request.error);
      };

      tx.onerror = () => {
        console.error('IndexedDB transaction error:', tx.error);
        reject(tx.error);
      };
    } catch (error) {
      console.error('IndexedDB save exception:', error);
      reject(error);
    }
  });
}

export function getFromDB(db: IDBDatabase, storeName: string, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    console.log('Getting from IndexedDB:', key);
    
    try {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result || null;
        console.log('Data retrieved from IndexedDB:', result ? 'found' : 'not found');
        resolve(result);
      };
      
      request.onerror = () => {
        console.error('IndexedDB get error:', request.error);
        reject(request.error);
      };

      tx.onerror = () => {
        console.error('IndexedDB transaction error:', tx.error);
        reject(tx.error);
      };
    } catch (error) {
      console.error('IndexedDB get exception:', error);
      reject(error);
    }
  });
}
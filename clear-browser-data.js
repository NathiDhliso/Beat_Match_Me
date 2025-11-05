// Clear Browser Cache Script
// Run this in the browser console after reloading

console.log('🧹 Clearing BeatMatchMe browser data...');

// Clear localStorage
localStorage.clear();
console.log('✓ LocalStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('✓ SessionStorage cleared');

// Clear IndexedDB
if (window.indexedDB) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
        console.log(`✓ Deleted IndexedDB: ${db.name}`);
      }
    });
  });
}

// Clear service worker caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log(`✓ Deleted cache: ${name}`);
    });
  });
}

console.log('✅ Browser data cleared! Refresh the page.');
console.log('💡 Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) for a hard refresh');

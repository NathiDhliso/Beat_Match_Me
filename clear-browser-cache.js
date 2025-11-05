// Clear All BeatMatchMe Local Storage
// Paste this in browser console (F12) and press Enter

// Clear localStorage
Object.keys(localStorage).forEach(key => {
    if (key.includes('CognitoIdentityServiceProvider') || 
        key.includes('amplify') || 
        key.includes('beatmatchme') ||
        key.includes('us-east-1_m1PhjZ4yD')) {
        console.log('Removing:', key);
        localStorage.removeItem(key);
    }
});

// Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
    if (key.includes('CognitoIdentityServiceProvider') || 
        key.includes('amplify') || 
        key.includes('beatmatchme')) {
        console.log('Removing:', key);
        sessionStorage.removeItem(key);
    }
});

console.log('✅ Cache cleared! Please refresh the page.');
location.reload();

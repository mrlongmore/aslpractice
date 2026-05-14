import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// This imports the API keys you got from the Firebase Console
import { firebaseConfig } from "./firebase-config.js"; 

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let myId = null;

export async function initMultiplayer(scene, callbackOnPlayersUpdate) {
    try {
        // 1. Sign in so 'Locked Mode' rules allow us to read/write
        const userCredential = await signInAnonymously(auth);
        myId = userCredential.user.uid;
        console.log("Authenticated as:", myId);

        // 2. Setup our player node and auto-delete it if we close the tab
        const myPlayerRef = ref(db, `players/${myId}`);
        onDisconnect(myPlayerRef).remove();

        // 3. Watch for all player movements
        const playersRef = ref(db, 'players');
        onValue(playersRef, (snapshot) => {
            const allPlayers = snapshot.val() || {};
            // We send the data back to game.js to update the 3D models
            callbackOnPlayersUpdate(allPlayers, myId); 
        });

    } catch (error) {
        console.error("Multiplayer Error:", error);
    }
}

// Call this inside your Three.js animate loop!
export function updateMyPosition(position, rotation) {
    if (!myId) return;
    set(ref(db, `players/${myId}`), {
        x: position.x,
        y: position.y,
        z: position.z,
        rx: rotation.x,
        ry: rotation.y,
        rz: rotation.z,
        rw: rotation.w
    });
}
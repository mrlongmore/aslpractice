import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { initMultiplayer, updateMyPosition } from './multiplayer.js';

// --- CONFIG ---
let health = 100;
let isDead = false;
const lapsToWin = 3;

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- CANNON PHYSICS SETUP ---
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
const carBody = new CANNON.Body({ mass: 150, shape: new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)) });
world.addBody(carBody);

// Create Track Walls
function createWall(x, z, w, d) {
    const wallBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(w/2, 2, d/2)) });
    wallBody.position.set(x, 2, z);
    world.addBody(wallBody);
    
    // Visuals
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), new THREE.MeshStandardMaterial({ color: 0x57606f }));
    mesh.position.copy(wallBody.position);
    scene.add(mesh);

    // Collision Detection
    wallBody.addEventListener('collide', (e) => {
        if(!isDead) takeDamage(15);
    });
}

// Simple Track Layout
createWall(0, -50, 100, 2); // North wall
createWall(0, 50, 100, 2);  // South wall

// --- DAMAGE & ASL LOGIC ---
async function takeDamage(amount) {
    health -= amount;
    document.getElementById('health-bar').style.width = health + "%";
    if (health <= 0 && !isDead) {
        isDead = true;
        triggerASLQuiz();
    }
}

async function triggerASLQuiz() {
    const response = await fetch('../../vocab.json');
    const data = await response.json();
    const categories = Object.keys(data);
    const cat = data[categories[Math.floor(Math.random() * categories.length)]];
    const q = cat.questions[Math.floor(Math.random() * cat.questions.length)];

    document.getElementById('asl-gif').src = q.image;
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => {
            if(i === q.correct) {
                health = 100;
                isDead = false;
                document.getElementById('health-bar').style.width = "100%";
                document.getElementById('quiz-modal').classList.add('hidden');
            }
        };
        grid.appendChild(btn);
    });
    document.getElementById('quiz-modal').classList.remove('hidden');
}

// Start Game
initMultiplayer(scene);
function animate() {
    requestAnimationFrame(animate);
    world.fixedStep();
    // Update car visuals from physics
    updateMyPosition(carBody.position, carBody.quaternion);
    renderer.render(scene, camera);
}
animate();
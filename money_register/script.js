let game;
let vocabQuestions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let currentTotal = 0;
let targetAmount = 0;
let correctCount = 0;
let incorrectCount = 0;
let playerName = '';
let canSpawn = false;
let selectedPiece = null;
let droppedGroup;

const roundsToPlay = Infinity;

const moneyStacks = [
    { key: 'dollar1', value: 100, x: 90, y: 400 },
    { key: 'dollar5', value: 500, x: 190, y: 400 },
    { key: 'dollar10', value: 1000, x: 290, y: 400 },
    { key: 'dollar20', value: 2000, x: 390, y: 400 },
    { key: 'dollar50', value: 5000, x: 490, y: 400 },
    { key: 'dollar100', value: 10000, x: 590, y: 400 },
    { key: 'cent1', value: 1, x: 90, y: 520 },
    { key: 'cent5', value: 5, x: 190, y: 520 },
    { key: 'cent10', value: 10, x: 290, y: 520 },
    { key: 'cent25', value: 25, x: 390, y: 520 },
    { key: 'cent50', value: 50, x: 490, y: 520 }
];

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#d3d3d3',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-button').addEventListener('click', onStartGame);
    document.getElementById('next-question-button').addEventListener('click', onNextQuestion);
    loadVocab();
});

function loadVocab() {
    fetch('../vocab.json')
        .then((response) => response.json())
        .then((data) => {
            vocabQuestions = parseMoneyQuestions(data);
            if (vocabQuestions.length === 0) {
                document.getElementById('start-error').textContent = 'Money questions not found in vocab.json.';
            }
        })
        .catch(() => {
            document.getElementById('start-error').textContent = 'Unable to load vocab data. Run from a local web server.';
        });
}

function parseMoneyQuestions(data) {
    const questions = Object.values(data)
        .flatMap((section) => section.questions || []);

    return questions
        .filter((item) => {
            if (!item || typeof item !== 'object') {
                return false;
            }
            const questionText = (item.question || '').toString().toLowerCase();
            if (!questionText.includes('how much money is this')) {
                return false;
            }
            const options = item.options || [];
            return options.some((option) => /(?:\$\s*)?\d+(?:\.\d+)?\s*(?:dollars?|dollar|cents?|cent)?/i.test(option));
        })
        .map((item) => {
            const optionText = item.options?.[item.correct];
            const target = parseMoneyAmount(optionText);
            return optionText && target != null
                ? {
                      image: item.image,
                      question: item.question || 'Pay the correct amount',
                      target,
                      answer: optionText
                  }
                : null;
        })
        .filter(Boolean);
}

function parseMoneyAmount(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }

    const cleaned = text.trim().toUpperCase();
    const dollarMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[- ]?\s*DOLLAR/);
    if (dollarMatch) {
        return Math.round(parseFloat(dollarMatch[1]) * 100);
    }

    const centMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[- ]?\s*CENTS?/);
    if (centMatch) {
        return Math.round(parseFloat(centMatch[1]));
    }

    const numberMatch = cleaned.match(/\d+(?:\.\d+)?/);
    if (numberMatch) {
        return Math.round(parseFloat(numberMatch[0]) * 100);
    }

    return null;
}

function shuffleArray(array) {
    const clone = array.slice();
    for (let i = clone.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}

function onStartGame() {
    const nameInput = document.getElementById('player-name');
    const error = document.getElementById('start-error');
    const name = nameInput.value.trim();

    if (!name) {
        error.textContent = 'Please enter your name to begin.';
        return;
    }
    if (vocabQuestions.length === 0) {
        error.textContent = 'Waiting for vocab data to load.';
        return;
    }

    playerName = name;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('content-wrapper').classList.remove('hidden');
    document.getElementById('status-panel').classList.remove('hidden');
    startNewGame();
}

function startNewGame() {
    currentQuestionIndex = 0;
    currentTotal = 0;
    correctCount = 0;
    incorrectCount = 0;
    canSpawn = true;
    selectedQuestions = shuffleArray(vocabQuestions);
    destroyGame();
    game = new Phaser.Game(config);
    updateGivenAmount();
    updateStatusMessage('Add bills or coins to match the goal amount.');
}

function destroyGame() {
    if (game) {
        game.destroy(true);
        game = null;
    }
}

function onNextQuestion() {
    document.getElementById('next-question-button').classList.add('hidden');
    goToNextQuestion();
}

function preload() {
    this.load.image('dollar1', 'assets/dollar1.png');
    this.load.image('dollar5', 'assets/dollar5.png');
    this.load.image('dollar10', 'assets/dollar10.png');
    this.load.image('dollar20', 'assets/dollar20.png');
    this.load.image('dollar50', 'assets/dollar50.png');
    this.load.image('dollar100', 'assets/dollar100.png');
    this.load.image('cent1', 'assets/cent1.png');
    this.load.image('cent5', 'assets/cent5.png');
    this.load.image('cent10', 'assets/cent10.png');
    this.load.image('cent25', 'assets/cent25.png');
    this.load.image('cent50', 'assets/cent50.png');
    this.load.image('register', 'assets/register.png');
}

function create() {
    droppedGroup = this.add.group();

    this.add.rectangle(400, 300, 800, 600, 0xe2e8f0);
    const register = this.add.image(700, 280, 'register').setScale(0.7);
    register.setDepth(200);

    moneyStacks.forEach((stack) => {
        const sprite = this.add.image(stack.x, stack.y, stack.key).setInteractive({ useHandCursor: true });
        sprite.setData('moneyValue', stack.value);
        sprite.setData('stackKey', stack.key);
        sprite.setData('stackX', stack.x);
        sprite.setData('stackY', stack.y);
    });

    register.setInteractive({ useHandCursor: true });
    register.setData('isRegister', true);

    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (!canSpawn) {
            return;
        }

        if (gameObject === selectedPiece) {
            return;
        }

        if (gameObject.getData('isRegister')) {
            if (selectedPiece) {
                dropOnRegister(selectedPiece);
            }
            return;
        }

        const value = gameObject.getData('moneyValue');
        if (typeof value === 'number') {
            if (selectedPiece) {
                selectedPiece.destroy();
                selectedPiece = null;
            }
            spawnMoneyPiece(this, gameObject.getData('stackKey'), value, pointer);
        }
    });

    this.input.on('pointermove', (pointer) => {
        if (selectedPiece) {
            selectedPiece.x = pointer.worldX;
            selectedPiece.y = pointer.worldY;
        }
    });

    goToNextQuestion();
}

function update() {
    // Game logic can be added here if needed
}

function spawnMoneyPiece(scene, key, value, pointer) {
    const x = pointer?.worldX || 150;
    const y = pointer?.worldY || 300;
    selectedPiece = scene.add.image(x, y, key).setInteractive({ useHandCursor: true });
    selectedPiece.setData('moneyValue', value);
    selectedPiece.setData('stackKey', key);
    selectedPiece.setDepth(100);
    selectedPiece.setData('isFloating', true);
    updateStatusMessage('Drag the bill or coin over the register, then click the register to drop it.');
}

function dropOnRegister(object) {
    if (!object) {
        return;
    }

    object.setInteractive(false);
    object.setData('dropped', true);
    object.setDepth(5);
    droppedGroup.add(object);
    object.x = 700 + Phaser.Math.Between(-30, 30);
    object.y = 280 + Phaser.Math.Between(-20, 20);
    selectedPiece = null;

    const amount = object.getData('moneyValue') || 0;
    currentTotal += amount;
    updateGivenAmount();

    if (currentTotal > targetAmount) {
        incorrectCount += 1;
        canSpawn = false;
        currentTotal = 0;
        updateGivenAmount();
        destroyDroppedPieces();
        setTimeout(() => {
            updateStatusMessage('Too much money! That round ended incorrect. Click Next to continue.');
            document.getElementById('next-question-button').classList.remove('hidden');
        }, 200);
        return;
    }

    if (currentTotal === targetAmount) {
        correctCount += 1;
        canSpawn = false;
        updateStatusMessage('Perfect! Exact amount received. Click Next for the next round.');
        document.getElementById('next-question-button').classList.remove('hidden');
        return;
    }

    updateStatusMessage('Nice! Add more money until the register matches the sign.');
}

function goToNextQuestion() {
    destroyDroppedPieces();
    selectedPiece = null;
    currentTotal = 0;
    updateGivenAmount();
    document.getElementById('next-question-button').classList.add('hidden');

    if (currentQuestionIndex >= selectedQuestions.length) {
        showCertificate();
        return;
    }

    currentQuestion = selectedQuestions[currentQuestionIndex];
    targetAmount = currentQuestion.target;
    currentQuestionIndex += 1;
    updateQuestionNumber();
    updateGifQuestion();
    updateStatusMessage('Click a pile to pick up a bill or coin, then click the register to drop it.');
    canSpawn = true;
}

function updateQuestionNumber() {
    const questionLabel = document.getElementById('question-number');
    if (!questionLabel) {
        return;
    }
    const currentNumber = currentQuestionIndex;
    const total = selectedQuestions.length;
    questionLabel.textContent = `${currentNumber} of ${total}`;
}

function updateGifQuestion() {
    const image = document.getElementById('gif-image');
    const caption = document.getElementById('gif-caption');
    image.src = currentQuestion.image;
    caption.textContent = currentQuestion.question;
}

function updateGivenAmount() {
    document.getElementById('given-amount').textContent = formatMoney(currentTotal);
}

function updateStatusMessage(message) {
    document.getElementById('status-message').textContent = message;
}

function formatMoney(cents) {
    const dollars = Math.floor(cents / 100);
    const remainder = cents % 100;
    return `$${dollars}.${remainder.toString().padStart(2, '0')}`;
}

function destroyDroppedPieces() {
    if (!droppedGroup) {
        return;
    }
    droppedGroup.getChildren().forEach((child) => {
        child.destroy();
    });
    droppedGroup.clear(true);
    selectedPiece = null;
}

function showCertificate() {
    const certificate = document.getElementById('certificate');
    const score = correctCount + incorrectCount;
    const percentage = score === 0 ? 0 : Math.round((correctCount / score) * 100);
    certificate.innerHTML = `
        <div id="certificate-card">
            <h2>Certificate of Completion</h2>
            <p><strong>${playerName}</strong>, you finished the money game.</p>
            <p>Rounds completed: ${score}</p>
            <p>Correct: ${correctCount}</p>
            <p>Incorrect: ${incorrectCount}</p>
            <p>Accuracy: ${percentage}%</p>
            <button id="restart-game-button">Play Again</button>
        </div>
    `;
    certificate.classList.remove('hidden');
    document.getElementById('restart-game-button').addEventListener('click', () => {
        certificate.classList.add('hidden');
        startNewGame();
    });
}

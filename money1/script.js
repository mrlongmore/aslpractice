document.addEventListener('DOMContentLoaded', () => {
    const startQuizBtn = document.getElementById('startQuiz');
    const quizModal = document.getElementById('quizModal');
    const closeBtn = document.querySelector('.close');
    const nameInput = document.getElementById('nameInput');
    const submitNameBtn = document.getElementById('submitName');
    const userNameInput = document.getElementById('userName');
    const quizContent = document.getElementById('quizContent');
    const videoContainer = document.getElementById('videoContainer');
    const quizVideo = document.getElementById('quizVideo');
    const videoSource = document.getElementById('videoSource');
    const questionArea = document.getElementById('questionArea');
    const questionText = document.getElementById('questionText');
    const options = document.querySelectorAll('.option');
    const certificate = document.getElementById('certificate');
    const certName = document.getElementById('certName');
    const correctCount = document.getElementById('correctCount');
    const incorrectCount = document.getElementById('incorrectCount');
    const restartQuizBtn = document.getElementById('restartQuiz');
    const textInputArea = document.getElementById('textInputArea');
    const textAnswer = document.getElementById('textAnswer');
    const submitAnswerBtn = document.getElementById('submitAnswer');

    let userName = '';
    let currentVideoIndex = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let totalQuestions = 0;

    // Quiz data
    const quizData = [
        {
            video: 'money1.mp4', // Placeholder, replace with actual path
            questions: [
                { question: "Where do I go?", type: "multiple-choice", options: ["store", "mall", "shop", "school"], correct: "store" },
                { question: "How much did the chicken cost?", type: "text", correct: "10.50"},
                { question: "How much did the rice cost?", type: "text", correct: "20.25"},
                { question: "How much did the carrots cost?", type: "text", correct: "7.10"},
                { question: "How much was the total?", type: "text", correct: "47.85"}
            ]
        },
        {
            video: 'money2.mp4',
            questions: [
                { question: "What does the signer say about themself?", type: "multiple-choice", options: ["They're broke", "They're wealthy", "They're hurt", "They're sad"], correct: "They're broke" },
                { question: "How much money do they want (add decimal point)?", type: "text", correct: "10.00"}
            ]
        },
        {
            video: 'money4.mp4',
            questions: [
                { question: "What are video games described as?", type: "multiple-choice", options: ["expensive", "cheap", "lousy", "fun"], correct: "expensive" },
                { question: "How much is a PS5?", type: "text", correct: "599.99"},
                { question: "How much is a Switch 2?", type: "text", correct: "449.99"},
                { question: "How much is an Xbox Series X?", type: "text", correct: "649.99"}
            ]
        },
        {
            video: 'money5.mp4',
            questions: [
                { question: "How much is the triple-stack cheeseburger?", type: "text", correct: "15.49"},
                { question: "How much are the french fries?", type: "text", correct: "6.99"},
                { question: "How much is a the soda?", type: "text", correct: "3.99"},
                { question: "How much is the milkshake?", type: "text", correct: "8.79"},
                { question: "How much is the total with tax?", type: "text", correct: "38.79"}
            ]
        }
    ];

    // Calculate total questions
    quizData.forEach(video => totalQuestions += video.questions.length);

    // Start quiz
    startQuizBtn.addEventListener('click', () => {
        quizModal.style.display = 'block';
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        quizModal.style.display = 'none';
        resetQuiz();
    });

    // Submit name
    submitNameBtn.addEventListener('click', () => {
        userName = userNameInput.value.trim();
        if (userName) {
            nameInput.style.display = 'none';
            quizContent.style.display = 'block';
            loadVideo();
        }
    });

//Fisher-Yates for the win!
    function shuffleArray(array) {
    for (let i = array.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
    // Option click
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            const selected = e.target.textContent;
            const currentQ = quizData[currentVideoIndex].questions[currentQuestionIndex];
            if (selected === currentQ.correct) {
                score++;
                alert("Correct!");
            } else {
                alert("Incorrect!");

            }
            nextQuestion();
        });
    });

    // Submit text answer
    submitAnswerBtn.addEventListener('click', () => {
        const currentQ = quizData[currentVideoIndex].questions[currentQuestionIndex];
        const answer = textAnswer.value.trim().toLowerCase();
        const correct = currentQ.correct.toLowerCase();
        if (answer === correct) {
            score++;
            alert("Correct!");
        } else {
            alert("Incorrect!");
        }
        textAnswer.value = '';
        nextQuestion();
    });

    // Restart quiz
    restartQuizBtn.addEventListener('click', () => {
        resetQuiz();
    });

    function loadVideo() {
        videoSource.src = quizData[currentVideoIndex].video;
        quizVideo.load();
        currentQuestionIndex = 0;
        showQuestion();
    }

    function showQuestion() {
        const currentQ = quizData[currentVideoIndex].questions[currentQuestionIndex];
        questionText.textContent = currentQ.question;
        if (currentQ.type === "text") {
            document.getElementById('options').style.display = 'none';
            textInputArea.style.display = 'block';
            textAnswer.value = '';
            textAnswer.focus();
        } else {
            document.getElementById('options').style.display = 'flex';
            textInputArea.style.display = 'none';
            shuffleArray(currentQ.options);
            options.forEach((option, index) => {
                option.textContent = currentQ.options[index];
            });
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData[currentVideoIndex].questions.length) {
            showQuestion();
        } else {
            nextVideo();
        }
    }

    function nextVideo() {
        currentVideoIndex++;
        if (currentVideoIndex < quizData.length) {
            loadVideo();
        } else {
            showCertificate();
        }
    }

    function showCertificate() {
        questionArea.style.display = 'none';
        videoContainer.style.display = 'none';
        certificate.style.display = 'block';
        certName.textContent = userName;
        correctCount.textContent = score;
        incorrectCount.textContent = totalQuestions - score;
    }

    function resetQuiz() {
        currentVideoIndex = 0;
        currentQuestionIndex = 0;
        score = 0;
        quizContent.style.display = 'block';
        questionArea.style.display = 'block';
        videoContainer.style.display = 'block';
        certificate.style.display = 'none';
        loadVideo();
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const startQuizBtn = document.getElementById('startQuiz');
    const quizModal = document.getElementById('quizModal');
    const closeBtn = document.querySelector('.close');
    const nameInput = document.getElementById('nameInput');
    const submitNameBtn = document.getElementById('submitName');
    const userNameInput = document.getElementById('userName');
    const topicSelection = document.getElementById('topicSelection');
    const topicList = document.getElementById('topicList');
    const topicError = document.getElementById('topicError');
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
    let allTopics = [];
    let selectedTopic = null;
    let quizData = [];
    let currentVideoIndex = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let totalQuestions = 0;
    let topicsPromise = null;
    const dataBaseUrl = new URL('.', window.location.href).href;

    function loadTopics() {
        return fetch('./videos.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load videos.json: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allTopics = Array.isArray(data.topics) ? data.topics : [];
                if (allTopics.length === 0) {
                    throw new Error('No topics found in videos.json');
                }
            })
            .catch(error => {
                console.error('Topic load error:', error);
                allTopics = [
                    {
                        name: 'Default Money Practice',
                        videos: [
                            {
                                video: 'money1.mp4',
                                questions: [
                                    { question: 'Where do I go?', type: 'multiple-choice', options: ['store', 'mall', 'shop', 'school'], correct: 'store' },
                                    { question: 'How much did the chicken cost?', type: 'text', correct: '10.50' },
                                    { question: 'How much did the rice cost?', type: 'text', correct: '20.25' },
                                    { question: 'How much did the carrots cost?', type: 'text', correct: '7.10' },
                                    { question: 'How much was the total?', type: 'text', correct: '47.85' }
                                ]
                            },
                            {
                                video: 'money2.mp4',
                                questions: [
                                    { question: 'What does the signer say about themself?', type: 'multiple-choice', options: ["They're broke", "They're wealthy", "They're hurt", "They're sad"], correct: "They're broke" },
                                    { question: 'How much money do they want (add decimal point)?', type: 'text', correct: '10.00' }
                                ]
                            }
                        ]
                    }
                ];
            });
    }

    function renderTopicButtons() {
        topicList.innerHTML = '';
        topicError.style.display = 'none';

        if (allTopics.length === 0) {
            topicError.textContent = 'No topics are available. Please refresh the page.';
            topicError.style.display = 'block';
            return;
        }

        allTopics.forEach((topic, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'topic-button';
            button.textContent = topic.name;
            button.addEventListener('click', () => selectTopic(index));
            topicList.appendChild(button);
        });
    }

    function showNameInput() {
        userName = '';
        selectedTopic = null;
        quizData = [];
        currentVideoIndex = 0;
        currentQuestionIndex = 0;
        score = 0;
        totalQuestions = 0;
        userNameInput.value = '';
        nameInput.style.display = 'block';
        topicSelection.style.display = 'none';
        quizContent.style.display = 'none';
        certificate.style.display = 'none';
        topicError.style.display = 'none';
    }

    function showTopicSelection() {
        nameInput.style.display = 'none';
        quizContent.style.display = 'none';
        certificate.style.display = 'none';
        topicSelection.style.display = 'block';
        topicList.innerHTML = '';
        if (allTopics.length > 0) {
            renderTopicButtons();
        } else {
            topicError.textContent = 'Loading topics...';
            topicError.style.display = 'block';
        }
    }

    function selectTopic(index) {
        selectedTopic = allTopics[index];
        setQuizDataFromTopic(selectedTopic);
        topicSelection.style.display = 'none';
        quizContent.style.display = 'block';
        loadVideo();
    }

    function setQuizDataFromTopic(topic) {
        quizData = Array.isArray(topic.videos) ? topic.videos : [];
        totalQuestions = quizData.reduce((sum, video) => sum + (Array.isArray(video.questions) ? video.questions.length : 0), 0);
        currentVideoIndex = 0;
        currentQuestionIndex = 0;
        score = 0;
    }

    function loadVideo() {
        if (!quizData.length) {
            return;
        }

        const videoSrc = quizData[currentVideoIndex].video;
        videoSource.src = videoSrc;
        if (videoSrc.toLowerCase().endsWith('.mp4')) {
            videoSource.type = 'video/mp4';
        } else {
            videoSource.removeAttribute('type');
        }
        quizVideo.load();
        currentQuestionIndex = 0;
        showQuestion();
    }

    function showQuestion() {
        const currentQ = quizData[currentVideoIndex].questions[currentQuestionIndex];
        questionText.textContent = currentQ.question;

        if (currentQ.type === 'text') {
            document.getElementById('options').style.display = 'none';
            textInputArea.style.display = 'block';
            textAnswer.value = '';
            textAnswer.focus();
        } else {
            document.getElementById('options').style.display = 'flex';
            textInputArea.style.display = 'none';
            shuffleArray(currentQ.options);
            options.forEach((option, index) => {
                option.textContent = currentQ.options[index] || '';
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
        quizContent.style.display = 'none';
        questionArea.style.display = 'block';
        videoContainer.style.display = 'block';
        certificate.style.display = 'none';
        showTopicSelection();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startQuizBtn.addEventListener('click', () => {
        topicsPromise = topicsPromise || loadTopics();
        showNameInput();
        quizModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        quizModal.style.display = 'none';
        showNameInput();
    });

    submitNameBtn.addEventListener('click', () => {
        userName = userNameInput.value.trim();
        if (!userName) {
            return;
        }

        showTopicSelection();
        topicsPromise = topicsPromise || loadTopics();
        topicsPromise
            .then(() => {
                topicError.style.display = 'none';
                renderTopicButtons();
            })
            .catch(error => {
                topicError.textContent = 'Unable to load topics. Please refresh the page.';
                topicError.style.display = 'block';
                console.error(error);
            });
    });

    options.forEach(option => {
        option.addEventListener('click', e => {
            const selected = e.target.textContent;
            const currentQ = quizData[currentVideoIndex].questions[currentQuestionIndex];
            if (selected === currentQ.correct) {
                score++;
                alert('Correct!');
            } else {
                alert('Incorrect!');
            }
            nextQuestion();
        });
    });

    submitAnswerBtn.addEventListener('click', () => {
        const currentQ = quizData[currentVideoIndex].questions[currentQuestionIndex];
        const answer = textAnswer.value.trim().toLowerCase();
        const correct = String(currentQ.correct).trim().toLowerCase();
        if (answer === correct) {
            score++;
            alert('Correct!');
        } else {
            alert('Incorrect!');
        }
        textAnswer.value = '';
        nextQuestion();
    });

    restartQuizBtn.addEventListener('click', resetQuiz);
});

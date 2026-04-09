name_modal = document.getElementById('name-modal');
topic_modal = document.getElementById('topic-modal');
quiz_modal = document.getElementById('quiz-modal');
certificate_modal = document.getElementById('certificate-modal')
user_input = document.getElementById('name-input');
const topic_container = document.getElementById('topic-container');
const topic_button = document.getElementById('topic-button');
const certificate_header = document.getElementById('certificate-header');
const results_area = document.getElementById('result-area');
let user_name;
let data;
let questions_correct = 0;
let questions_incorrect = 0;
let questions_total = 0;

name_modal.classList.add("active");

// Load them jsons
async function load_data() {
    try {
    const response = await fetch('vocab.json');
    const data = await response.json();
    return data;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
load_data().then(loaded_data => {
    if (!loaded_data) {
        console.error('No data loaded');
        return;
    }
    else {
        data = loaded_data;
        console.log('Data loaded:', data);
        topic_container.innerHTML = '';
        Object.keys(data).forEach(topicKey => {
            const topic = data[topicKey];
            console.log('Processing topic:', topicKey, topic);
            const title = topic.title || topicKey;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = topicKey;
            checkbox.name = 'topics';
            checkbox.value = topicKey;
            const label = document.createElement('label');
            label.htmlFor = topicKey;
            label.textContent = title;
            
            const container = document.createElement('div');

            container.appendChild(checkbox);
            container.appendChild(label);
            topic_container.appendChild(container);
            });
        }
    console.log('Finished processing data');
    });

// Event listeners for name button
document.querySelector('#name-button').addEventListener('click', () => {
    user_name = user_input.value;
    name_modal.classList.remove('active');
    topic_modal.classList.add('active');
    console.log(user_name);
});

// Apparently this is the Fisher-Yates shuffle algorithm, which I'm not even going to pretend I understand... yet!
function shuffleArray(array) {
    for (let i = array.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Event listeners for topic button
document.querySelector('#topic-button').addEventListener('click', () => {
    const selected_topics = [...document.querySelectorAll('input[name="topics"]:checked')].map(checkbox => checkbox.value);
    topic_modal.classList.remove('active');
    quiz_modal.classList.add('active');
    console.log(selected_topics);
    const quiz_questions = [];
    selected_topics.forEach(topic => {
        if (data[topic] && data[topic].questions) {
            quiz_questions.push(...data[topic].questions);
        }
    });
    console.log(quiz_questions);
    shuffleArray(quiz_questions);
    startQuiz(quiz_questions);
});

// This is how we start the quiz
function startQuiz(questions) {
    let current_question = 0;
    questions_total = questions.length;
    function displayQuestion() {
        const question = questions[current_question];
        const gif_modal = document.getElementById('gif-modal');
        const answer_area = document.getElementById('answers-area');
        const questions_remaining = document.querySelector('.questions-remaining');
        questions_remaining.innerHTML = `<h1>Question ${current_question + 1} of ${questions.length}</h1>`;
        gif_modal.innerHTML = `<img src="${question.image}" alt="Question Image">
        <h2>${question.question}</h2>
        `;
        answer_area.innerHTML = '';
        question.options.forEach((option, index) => {
            const answer_button = document.createElement('button');
            answer_button.classList.add('answer-button');
            answer_button.textContent = option;
            answer_area.appendChild(answer_button);
            answer_button.addEventListener('click', () => {
                if (index === question.correct) {
                    alert('Correct!');
                    questions_correct++;
                    current_question++;
                } else {
                    alert('Incorrect. Try again.');
                    questions_incorrect++;
                }
        if (current_question < questions.length) {
            displayQuestion();
        } else {
            alert('Quiz complete!');
            displayCertificate();
            quiz_modal.classList.remove('active');
            certificate_modal.classList.add('active');
        }
        });
    });
    }
    displayQuestion();
}

// Certificate modal population
function displayCertificate() {
    certificate_header.innerHTML = `<h1>Great work, ${user_name}!</h1>`;
    results_area.innerHTML = `<h1>You got ${questions_correct} question(s) correct and ${questions_incorrect} question(s) incorrect out of ${questions_total} questions total.</h1>
    <p>Take a screenshot of your results and upload them to Google Classroom!</p>`;
}

// Event listeners for certificate button
document.querySelector('#certificate-button').addEventListener('click', () => {
    certificate_modal.classList.remove('active');
    topic_modal.classList.add('active');
});
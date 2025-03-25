const API_KEY = 'IF6ZhWanTvmL93Dvha967oab5gwHKdEDXLweUQhc';
const API_URL = 'https://quizapi.io/api/v1/questions?limit=1&category=';

const _question = document.getElementById('question');
const _options = document.querySelector('.quiz-options');
const _checkBtn = document.getElementById('check-answer');
const _playAgainBtn = document.getElementById('play-again');
const _result = document.getElementById('result');
const _correctScore = document.getElementById('correct-score');
const _totalQuestion = document.getElementById('total-question');
const _timer = document.createElement('div');
const _categorySelect = document.createElement('select');
const _badge = document.createElement('div');

_timer.id = 'timer';
_categorySelect.id = 'category-select';
_badge.id = 'badge';
_badge.style.display = 'none';

// Add categories
const categories = ['Linux', 'DevOps', 'Networking', 'Programming', 'Cloud', 'Security'];
categories.forEach(category => {
    let option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    _categorySelect.appendChild(option);
});

document.querySelector('.quiz-container').insertBefore(_categorySelect, _question);
document.querySelector('.quiz-container').appendChild(_timer);
document.querySelector('.quiz-container').appendChild(_badge);

let correctAnswer = "", correctScore = 0, askedCount = 0, totalQuestion = 5;
let countdown;

// Load question from API
async function loadQuestion() {
    clearInterval(countdown);
    _timer.innerHTML = "";
    let selectedCategory = _categorySelect.value;
    const response = await fetch(`${API_URL}${selectedCategory}`, {
        headers: { 'X-Api-Key': API_KEY }
    });
    const data = await response.json();
    _result.innerHTML = "";
    showQuestion(data[0]);
    startTimer(15);
}

// Display question and options
function showQuestion(data) {
    _checkBtn.disabled = false;
    const optionsObj = data.answers;
    const optionsArray = Object.entries(optionsObj).filter(([key, value]) => value !== null);
    const correctAnswersObj = data.correct_answers;
    correctAnswer = optionsArray.find(([key, value]) => correctAnswersObj[key + "_correct"] === "true")[1];

    _question.innerHTML = `${data.question} <br> <span class="category">${data.category}</span>`;
    _options.innerHTML = `
        ${optionsArray.map(([key, option]) => `
            <li><span>${option}</span></li>
        `).join('')}
    `;
    selectOption();
}

// Option selection
function selectOption() {
    _options.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            if (_options.querySelector('.selected')) {
                _options.querySelector('.selected').classList.remove('selected');
            }
            option.classList.add('selected');
        });
    });
}

// Answer checking
function checkAnswer() {
    _checkBtn.disabled = true;
    clearInterval(countdown);
    if (_options.querySelector('.selected')) {
        let selectedAnswer = _options.querySelector('.selected span').textContent;
        if (selectedAnswer === correctAnswer) {
            correctScore++;
            _result.innerHTML = `<p>✅ Correct Answer!</p>`;
            checkAchievements();
        } else {
            _result.innerHTML = `<p>❌ Incorrect! Correct: ${correctAnswer}</p>`;
        }
        checkCount();
    } else {
        _result.innerHTML = `<p>⚠️ Please select an option!</p>`;
        _checkBtn.disabled = false;
    }
}

// Question count check
function checkCount() {
    askedCount++;
    setCount();
    if (askedCount === totalQuestion) {
        _result.innerHTML += `<p>Your final score is ${correctScore}/${totalQuestion}</p>`;
        _playAgainBtn.style.display = "block";
        _checkBtn.style.display = "none";
    } else {
        setTimeout(loadQuestion, 1000); // Load next question after 1 second
    }
}

// Start timer
function startTimer(seconds) {
    _timer.innerHTML = `⏳ Time Left: ${seconds}s`;
    countdown = setInterval(() => {
        seconds--;
        _timer.innerHTML = `⏳ Time Left: ${seconds}s`;
        if (seconds === 0) {
            clearInterval(countdown);
            _result.innerHTML = `<p>⏰ Time's up! The correct answer was: ${correctAnswer}</p>`;
            _checkBtn.disabled = true;
            checkCount();
        }
    }, 1000);
}

// Update score display
function setCount() {
    _totalQuestion.textContent = totalQuestion;
    _correctScore.textContent = correctScore;
}

// Restart quiz
function restartQuiz() {
    correctScore = askedCount = 0;
    _playAgainBtn.style.display = "none";
    _checkBtn.style.display = "block";
    _checkBtn.disabled = false;
    setCount();
    loadQuestion();
}

// Achievements
function checkAchievements() {
    if (correctScore === totalQuestion) {
        _badge.style.display = "block";
        _badge.innerHTML = "🏆 Perfect Score! Well done!";
    } else if (correctScore >= totalQuestion / 2) {
        _badge.style.display = "block";
        _badge.innerHTML = "🎖 Great job!";
    } else {
        _badge.style.display = "none";
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    _checkBtn.addEventListener('click', checkAnswer);
    _playAgainBtn.addEventListener('click', restartQuiz);
    _categorySelect.addEventListener('change', loadQuestion);
});

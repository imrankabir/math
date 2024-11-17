const questionBox = document.querySelector('#question');
const answerInput = document.querySelector('#answer');
const feedback = document.querySelector('#feedback');
const correctCountEl = document.querySelector('#correct-count');
const incorrectCountEl = document.querySelector('#incorrect-count');
const submitBtn = document.querySelector('#submit-btn');

let correctAnswer = 0;
let correctCount = 0;
let incorrectCount = 0;

const saveScore = score => localStorage.setItem('math-scores', JSON.stringify(score));

const getScore = e => JSON.parse(localStorage.getItem('math-scores')) ?? {correctCount: 0, incorrectCount: 0};

const generateQuestion = () => {
    submitBtn.disabled = false;
    const {correctCount, incorrectCount} = getScore();
    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let maxNum = 20;
    if (operation === '/') {
        maxNum = 6;
    }
    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;
    if (num1 < num2) {
        num1 = num1 + num2;
        num2 = num1 - num2;
        num1 = num1 - num2;
    }
    if (operation === '/') {
        correctAnswer = num1;
        questionBox.textContent = `${num1 * num2} ÷ ${num2}`;
    } else if (operation === '*') {
        correctAnswer = num1 * num2;
        questionBox.textContent = `${num1} × ${num2}`;
    } else if (operation === '+') {
        correctAnswer = num1 + num2;
        questionBox.textContent = `${num1} + ${num2}`;
    } else if (operation === '-') {
        correctAnswer = num1 - num2;
        questionBox.textContent = `${num1} - ${num2}`;
    }
    feedback.textContent = '';
    answerInput.value = '';
};

const checkAnswer = () => {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a valid number!';
        feedback.style.color = 'red';
        return;
    }
    let {correctCount, incorrectCount} = getScore();
    submitBtn.disabled = true;

    if (userAnswer === correctAnswer) {
        feedback.textContent = 'Correct! 🎉';
        feedback.style.color = 'green';
        correctCount++;
        setTimeout(e => generateQuestion(), 1000);
    } else {
        feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
        feedback.style.color = 'red';
        incorrectCount++;
        setTimeout(e => generateQuestion(), 3000);
    }

    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
    saveScore({correctCount, incorrectCount});
};

submitBtn.addEventListener('click', checkAnswer);

generateQuestion();
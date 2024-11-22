const questionBox = document.querySelector('#question');
const answerInput = document.querySelector('#answer');
const feedback = document.querySelector('#feedback');
const correctCountEl = document.querySelector('#correct-count');
const incorrectCountEl = document.querySelector('#incorrect-count');
const submitBtn = document.querySelector('#submit-btn');
const levelRadios = document.getElementsByName('level');
const canvas = document.querySelector('#whiteboard');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.85 - 220;

let correctAnswer = 0;
let correctCount = 0;
let incorrectCount = 0;

const getScore = level => JSON.parse(localStorage.getItem(`math-scores-${level}`)) ?? {correctCount: 0, incorrectCount: 0};
const saveScore = score => localStorage.setItem(`math-scores-${score.level}`, JSON.stringify(score));

const getLevel = e => localStorage.getItem('math-level') ?? 'easy';
const saveLevel = level => localStorage.setItem('math-level', level);

const getQuestion = level => JSON.parse(localStorage.getItem(`math-question-${level}`)) ?? {num1: 0, operation: '+', num2: 0};
const saveQuestion = question => localStorage.setItem(`math-question-${question.level}`, JSON.stringify(question));

const saveSelectedLevel = e => {
    for (const radio of levelRadios) {
        if (radio.checked) {
            level = radio.value;
            saveLevel(level);
            generateQuestion();
            let {correctCount, incorrectCount} = getScore(level);
            correctCountEl.textContent = correctCount;
            incorrectCountEl.textContent = incorrectCount;
        }
    }
};

const generateQuestion = force => {
    submitBtn.disabled = false;
    const level = getLevel();
    const {correctCount, incorrectCount} = getScore(level);
    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
    let {num1, operation, num2} = getQuestion(level);
    console.log('start');
    console.log({num1, operation, num2, force})
    if (num1 == 0 || force === true) {
        let operations = ['+', '-', '*', '/'];
        if (level === 'easy') {
            operations.pop();
        }
        operation = operations[Math.floor(Math.random() * operations.length)];
        let maxNum1 = 0;
        let maxNum2 = 0;
        if (level === 'easy') {
            if (operation === '*') {
                maxNum1 = 10;
                maxNum2 = 10;
            } else {
                maxNum1 = 100;
                maxNum2 = 100;
            }
        } else if (level === 'medium') {
            if (operation === '/') {
                maxNum1 = 8;
                maxNum2 = 8;
            } else if (operation === '*') {
                maxNum1 = 10;
                maxNum2 = 10;
            } else {
                maxNum1 = 200;
                maxNum2 = 200;
            }
        } else if (level === 'expert') {
            if (operation === '/') {
                maxNum1 = 50;
                maxNum2 = 50;
            } else if (operation === '*') {
                maxNum1 = 100;
                maxNum2 = 100;
            } else {
                maxNum1 = 10000;
                maxNum2 = 10000;
            }
        }
        let num1 = Math.floor(Math.random() * maxNum1) + 1;
        let num2 = Math.floor(Math.random() * maxNum2) + 1;
        if (num1 < num2) {
            num1 = num1 + num2;
            num2 = num1 - num2;
            num1 = num1 - num2;
        }
        saveQuestion({level, num1, operation, num2});
        console.log('after save')
        console.log({level, num1, operation, num2});
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
    } else {
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
    }
    console.log('show')
    console.log({level, num1, operation, num2});
    feedback.textContent = '';
    answerInput.value = '';
};

const checkAnswer = e => {
    const level = getLevel();
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a valid number!';
        feedback.style.color = 'red';
        return;
    }
    let {correctCount, incorrectCount} = getScore(level);
    submitBtn.disabled = true;

    if (userAnswer === correctAnswer) {
        feedback.textContent = 'Correct! 🎉';
        feedback.style.color = 'green';
        correctCount++;
        setTimeout(e => generateQuestion(true), 1000);
    } else {
        feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
        feedback.style.color = 'red';
        incorrectCount++;
        setTimeout(e => generateQuestion(true), 3000);
    }

    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
    saveScore({level, correctCount, incorrectCount});
};

submitBtn.addEventListener('click', checkAnswer);
levelRadios.forEach(levelRadio => levelRadio.addEventListener('click', saveSelectedLevel));

(e => {
    generateQuestion();
    const level = getLevel();
    document.querySelector(`#level-${level}`).setAttribute('checked', true);
    console.log({level});
})();

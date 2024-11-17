const questionBox = document.getElementById("question");
const answerInput = document.getElementById("answer");
const feedback = document.getElementById("feedback");
const correctCountEl = document.getElementById("correct-count");
const incorrectCountEl = document.getElementById("incorrect-count");
const newQuestionBtn = document.getElementById("new-question-btn");
const submitBtn = document.getElementById("submit-btn");

let correctAnswer = 0;
let correctCount = 0;
let incorrectCount = 0;

// Function to generate a new question
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ["+", "-", "*", "/"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    if (operation === "/") {
        // Ensure division results in an integer
        correctAnswer = num1;
        questionBox.textContent = `${num1 * num2} ÷ ${num2}`;
    } else if (operation === "*") {
        correctAnswer = num1 * num2;
        questionBox.textContent = `${num1} × ${num2}`;
    } else if (operation === "+") {
        correctAnswer = num1 + num2;
        questionBox.textContent = `${num1} + ${num2}`;
    } else if (operation === "-") {
        correctAnswer = num1 - num2;
        questionBox.textContent = `${num1} - ${num2}`;
    }
    feedback.textContent = "";
    answerInput.value = "";
}

// Function to check the answer
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        feedback.textContent = "Please enter a valid number!";
        feedback.style.color = "red";
        return;
    }

    if (userAnswer === correctAnswer) {
        feedback.textContent = "Correct! 🎉";
        feedback.style.color = "green";
        correctCount++;
    } else {
        feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
        feedback.style.color = "red";
        incorrectCount++;
    }

    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
}

// Event listeners
newQuestionBtn.addEventListener("click", generateQuestion);
submitBtn.addEventListener("click", checkAnswer);

// Generate the first question on page load
generateQuestion();

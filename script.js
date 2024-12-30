const undoBtn = document.querySelector('#undo-btn');
const redoBtn = document.querySelector('#redo-btn');
const feedback = document.querySelector('#feedback');
const canvas = document.querySelector('#whiteboard');
const answerInput = document.querySelector('#answer');
const clearBtn = document.querySelector('#clear-btn');
const levelRadios = document.getElementsByName('level');
const submitBtn = document.querySelector('#submit-btn');
const questionBox = document.querySelector('#question');
const correctCountEle = document.querySelector('#correct-count');
const incorrectCountEle = document.querySelector('#incorrect-count');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.85 - 100;

let correctAnswer = 0;
let correctCount = 0;
let incorrectCount = 0;

let painting = false;
let data = [];
let singleData = [];
let removedData = [];

let interval = null;

const get = (k, d) => JSON.parse(localStorage.getItem(`math-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`math-${k}`, JSON.stringify(v));

// const getScore = level => JSON.parse(localStorage.getItem(`math-scores-${level}`)) ?? {correctCount: 0, incorrectCount: 0};
// const saveScore = score => localStorage.setItem(`math-scores-${score.level}`, JSON.stringify(score));

const getLevel = e => localStorage.getItem('math-level') ?? 'novice';
// const saveLevel = level => localStorage.setItem('math-level', level);

// const getQuestion = level => JSON.parse(localStorage.getItem(`math-question-${level}`)) ?? {num1: 0, operation: '+', num2: 0};
// const saveQuestion = question => localStorage.setItem(`math-question-${question.level}`, JSON.stringify(question));

// const getData = level => JSON.parse(localStorage.getItem(`math-data-${level}`)) ?? {data: [], removedData: []};
// const saveData = ({level, data, removedData}) => localStorage.setItem(`math-data-${level}`, JSON.stringify({data, removedData}));

const getTime = level => localStorage.getItem(`math-time-${level}`) ?? 0;
// const saveTime = time => localStorage.setItem(`math-time-${time.level}`, time.time);

const formatTime = time => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const change = e => {
    for (const radio of levelRadios) {
        if (radio.checked) {
            level = radio.value;
            clearInterval(interval);
            timer(level);
            set('level', {level});
            question(false, level);
            const {data: d, removedData: rd} = get(`data-${level}`, {data: [], removedData: []});
            data = d;
            removedData = rd;
            if (d.length !== 0) {
                drawAll();
            } else {
                clear(false);
            }
            let {correctCount, incorrectCount} = get(`scores-${level}`, {correctCount: 0, incorrectCount: 0});
            correctCountEle.textContent = correctCount;
            incorrectCountEle.textContent = incorrectCount;
        }
    }
};

const question = (force, level) => {
    submitBtn.disabled = false;
    const {correctCount, incorrectCount} = get(`scores-${level}`, {correctCount: 0, incorrectCount: 0});
    correctCountEle.textContent = correctCount;
    incorrectCountEle.textContent = incorrectCount;
    let {num1, operation, num2} = get(`question-${level}`, {num1: 0, operation: '+', num2: 0});
    if (num1 == 0 || force === true) {
        let operations = ['+', '-', '*', '/'];
        if (level === 'novice') {
            operations.splice(-3);
        } else if (level === 'easy') {
            operations.pop();
        }
        operation = operations[Math.floor(Math.random() * operations.length)];
        let maxNum1 = 0;
        let maxNum2 = 0;
        if (level === 'novice') {
            if (operation === '-') {
                maxNum1 = 5;
                maxNum2 = 3;
            } else {
                maxNum1 = 10;
                maxNum2 = 10;
            }
        } else if (level === 'easy') {
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
        set(`question-${level}`, {num1, operation, num2});
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
    feedback.textContent = '';
    answerInput.value = '';
};

const answer = e => {
    const { level } = get('level', {level: 'novice'});
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a valid number!';
        feedback.style.color = 'red';
        return;
    }
    let {correctCount, incorrectCount} = get(`scores-${level}`, {correctCount: 0, incorrectCount: 0});
    submitBtn.disabled = true;
    if (userAnswer === correctAnswer) {
        feedback.textContent = 'Correct! 🎉';
        feedback.style.color = 'green';
        correctCount++;
        if (document.querySelector('#auto-clear').checked) {
            clear();
        }
        setTimeout(e => question(true, level), 1000);
    } else {
        feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
        feedback.style.color = 'red';
        incorrectCount++;
        if (document.querySelector('#auto-clear').checked) {
            clear();
        }
        setTimeout(e => question(true, level), 3000);
    }
    correctCountEle.textContent = correctCount;
    incorrectCountEle.textContent = incorrectCount;
    set(`scores-${level}`, {correctCount, incorrectCount});
};

submitBtn.addEventListener('click', answer);
levelRadios.forEach(levelRadio => levelRadio.addEventListener('click', change));

const start = e => {
  painting = true;
  const { x, y } = coords(e);
  draw(e);
  e.preventDefault();
};

const end = e => {
    painting = false;
    const { level } = get('level', {level: 'novice'});
    ctx.beginPath();
    data.push(singleData);
    set(`data-${level}`, {data, removedData});
    singleData = [];
    undoBtn.classList.add('enable');
    undoBtn.classList.remove('disable');
    clearBtn.classList.add('enable');
    clearBtn.classList.remove('disable');
    e.preventDefault();
};

const undo = e => {
  if (data.length == 0) {
    console.warn('No undo available');
    return false;
  }
  const { level } = get('level', {level: 'novice'});
  removedData.push(data.pop());
  set(`data-${level}`, {data, removedData});
  drawAll();
};

const redo = e => {
  if (removedData.length == 0) {
    console.warn('No redo available');
    return false;
  }
  const { level } = get('level', {level: 'novice'});
  data.push(removedData.pop());
  set(`data-${level}`, {data, removedData});
  drawAll();
};

const clear = (clearData = true) => {
  undoBtn.classList.add('disable');
  undoBtn.classList.remove('enable');
  redoBtn.classList.add('disable');
  redoBtn.classList.remove('enable');
  clearBtn.classList.add('disable');
  clearBtn.classList.remove('enable');
  if (clearData) {
    data = [];
    removedData = [];
    const { level } = get('level', {level: 'novice'});
    set(`data-${level}`, {data, removedData});
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const drawAll = e => {
  clear(false);
  if (data.length !== 0) {
    undoBtn.classList.add('enable');
    undoBtn.classList.remove('disable');
  }
  if (removedData.length !== 0) {
    redoBtn.classList.add('enable');
    redoBtn.classList.remove('disable');
  }
  if (data.length !== 0 || removedData.length !== 0) {
    clearBtn.classList.add('enable');
    clearBtn.classList.remove('disable');
  }
  data.forEach(lineData => {
    let c = 0;
    lineData.forEach(point => {
      const { x, y } = point;
      if (c == 0) {
        ctx.beginPath();
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (lineData.length == c) {
        ctx.moveTo(x, y);
        ctx.stroke();
        ctx.beginPath();
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      c++;
    });
    ctx.beginPath();
  });
};

const coords = e => {
  let x, y;
  if (e.type.includes('touch')) {
    x = e.touches[0].clientX - canvas.offsetLeft;
    y = e.touches[0].clientY - canvas.offsetTop;
  } else {
    x = e.clientX - canvas.offsetLeft;
    y = e.clientY - canvas.offsetTop;
  }
  return { x, y };
};

const draw = e => {
    if (!painting) return;
    let { x, y } = coords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (x || y) {
        singleData.push({ x, y });
    }
    e.preventDefault();
};

canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', end);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', start);
canvas.addEventListener('touchend', end);
canvas.addEventListener('touchmove', draw);

document.querySelector('#clear-btn').addEventListener('click', clear);
document.querySelector('#undo-btn').addEventListener('click', undo);
document.querySelector('#redo-btn').addEventListener('click', redo);

document.addEventListener('keydown', e => {
  switch (e.which) {
    case 38:
    case 67:
      clear();
      break;
    case 37:
      undo();
      break;
    case 39:
      redo();
      break;
  }
});

const timer = level => {
    let time = null;
    try {
        const { time: t } = get(`time-${level}`, {time: 0});
        time = t;
        if (time == null) {
            time = getTime(level);
            set(`time-${level}`, {time});
        }
    } catch(error) {
        console.error({level});
    }
    // let { time } = get(`time-${level}`, {time: 0});
    document.querySelector('.time').textContent = formatTime(time);
    interval = setInterval(e => {
        time++;
        set(`time-${level}`, {time})
        document.querySelector('.time').textContent = formatTime(time);
    }, 1000);
};

(e => {
    let level = null;
    try {
        const { level: l } = get('level', {level: 'novice'});
        level = l;
    } catch(error) {
        level = getLevel();
        set('level', {level});
        time = getTime(level);
        console.warn({level, time});
        set(`time-${level}`, {time});
    }
    // const url = new URLSearchParams(window.location.search);
    // if (url.has('clear')) {
    //     // localStorage.clear();
    //     localStorage.removeItem(`math-data-${level}`);
    //     localStorage.removeItem(`math-question-${level}`);
    //     localStorage.removeItem(`math-scores-${level}`);
    //     localStorage.removeItem(`math-time-${level}`);
    //     url.delete('clear');
    //     window.history.replaceState(null, '', window.location.pathname);
    // }
    question(false, level);
    document.querySelector(`#level-${level}`).setAttribute('checked', true);
    timer(level);
    const {data: d, removedData: rd} = get(`data-${level}`, {data: [], removedData: []});
    data = d;
    removedData = rd;
    if (d.length !== 0) {
        drawAll();
    }
})();
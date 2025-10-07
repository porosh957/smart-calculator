// Calculator state variables
let currentInput = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// Get DOM elements
const screen = document.querySelector('.screen');
const buttons = document.querySelectorAll('.calc-button');

// Operators (handle both '-' and '−' from &minus;)
const OPERATORS = new Set(['+', '-', '−', '×', '÷']);

// Utilities
function updateScreen() {
  screen.textContent = currentInput;
}

function resetCalculator() {
  currentInput = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  updateScreen();
}

function isBadResult(val) {
  return typeof val !== 'number' || !Number.isFinite(val);
}

// Input handlers
function inputNumber(number) {
  if (waitingForSecondOperand) {
    currentInput = number;
    waitingForSecondOperand = false;
  } else {
    currentInput = currentInput === '0' ? number : currentInput + number;
  }
  updateScreen();
}

function inputDecimal() {
  if (waitingForSecondOperand) {
    currentInput = '0.';
    waitingForSecondOperand = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateScreen();
}

function handleBackspace() {
  if (waitingForSecondOperand) return;
  currentInput = currentInput.length === 1 ? '0' : currentInput.slice(0, -1);
  updateScreen();
}

// Core math
function calculate(first, second, op) {
  switch (op) {
    case '+':      return first + second;
    case '-':
    case '−':      return first - second;
    case '×':      return first * second;
    case '÷':      return second === 0 ? 'Error' : first / second;
    default:       return second;
  }
}

// Operator / equals
function handleOperator(nextOperator) {
  if (currentInput === 'Error') return; // require a number or C after an error

  const inputValue = parseFloat(currentInput);

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = calculate(firstOperand, inputValue, operator);

    // ✅ Check the *answer* (post-calc)
    if (isBadResult(result)) {
      currentInput = 'Error';
      firstOperand = null;
      operator = null;
      waitingForSecondOperand = true;
      updateScreen();
      return;
    }

    currentInput = `${result}`;
    firstOperand = result;
  }

  waitingForSecondOperand = true;
  operator = nextOperator;
  updateScreen();
}

function handleEquals() {
  if (currentInput === 'Error') return; // ignore equals after error
  if (firstOperand === null || operator === null || waitingForSecondOperand) return;

  const inputValue = parseFloat(currentInput);
  const result = calculate(firstOperand, inputValue, operator);

  // ✅ Check the *answer* (post-calc)
  if (isBadResult(result)) {
    currentInput = 'Error';
  } else {
    currentInput = `${result}`;
  }

  // After equals, clear pending op; allow typing a new number
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = true;
  updateScreen();
}

// Button routing
function handleButtonClick(value) {
  const v = value.trim();

  if (!isNaN(parseInt(v))) { inputNumber(v); return; }
  if (v === '.')          { inputDecimal(); return; }
  if (v === 'C')          { resetCalculator(); return; }
  if (v === '←')          { handleBackspace(); return; }
  if (OPERATORS.has(v))   { handleOperator(v); return; }
  if (v === '=')          { handleEquals(); return; }
}

// Wire up
buttons.forEach(btn => {
  btn.addEventListener('click', () => handleButtonClick(btn.textContent));
});

// Init
resetCalculator();

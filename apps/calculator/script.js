// 계산기 로직
document.addEventListener('DOMContentLoaded', function() {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const clearBtn = document.getElementById('clear');
  const backspaceBtn = document.getElementById('backspace');
  const equalsBtn = document.getElementById('equals');
  const numberBtns = document.querySelectorAll('.btn-number');
  const operatorBtns = document.querySelectorAll('.btn-operator');

  let currentInput = '0';
  let previousInput = '';
  let operator = null;
  let shouldResetScreen = false;

  // 화면 업데이트
  function updateDisplay() {
    resultEl.textContent = currentInput;
    if (operator && previousInput) {
      expressionEl.textContent = `${previousInput} ${getOperatorSymbol(operator)}`;
    } else {
      expressionEl.textContent = '';
    }
  }

  // 연산자 기호 변환
  function getOperatorSymbol(op) {
    switch(op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      case '%': return '%';
      default: return op;
    }
  }

  // 숫자 입력
  function inputNumber(number) {
    if (shouldResetScreen) {
      currentInput = number;
      shouldResetScreen = false;
    } else {
      if (currentInput === '0' && number !== '.') {
        currentInput = number;
      } else {
        // 소수점 중복 방지
        if (number === '.' && currentInput.includes('.')) return;
        currentInput += number;
      }
    }
    updateDisplay();
  }

  // 연산자 입력
  function inputOperator(op) {
    if (operator && !shouldResetScreen) {
      calculate();
    }
    previousInput = currentInput;
    operator = op;
    shouldResetScreen = true;
    updateDisplay();
  }

  // 계산 수행
  function calculate() {
    if (!operator || !previousInput) return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;

    switch(operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          alert('0으로 나눌 수 없습니다!');
          clear();
          return;
        }
        result = prev / current;
        break;
      case '%':
        result = prev % current;
        break;
      default:
        return;
    }

    // 소수점 처리
    currentInput = parseFloat(result.toFixed(10)).toString();
    operator = null;
    previousInput = '';
    shouldResetScreen = true;
    updateDisplay();
  }

  // 초기화
  function clear() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetScreen = false;
    updateDisplay();
  }

  // 백스페이스
  function backspace() {
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput[0] === '-')) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  }

  // 이벤트 리스너
  numberBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      inputNumber(btn.dataset.value);
    });
  });

  operatorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      inputOperator(btn.dataset.value);
    });
  });

  equalsBtn.addEventListener('click', calculate);
  clearBtn.addEventListener('click', clear);
  backspaceBtn.addEventListener('click', backspace);

  // 키보드 지원
  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
      inputNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      inputOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      calculate();
    } else if (e.key === 'Escape') {
      clear();
    } else if (e.key === 'Backspace') {
      backspace();
    }
  });

  // 초기 화면 표시
  updateDisplay();
});

(() => {
  const display = document.getElementById('display');
  const keys = document.querySelector('.keys');
  const historyList = document.getElementById('historyList');
  let expr = '';
  let history = [];

  function updateDisplay(val) {
    display.textContent = (val !== undefined) ? val : (expr || '0');
  }

  function pushToken(token) {
    expr += token;
  }

  function clearAll() {
    expr = '';
  }

  function backspace() {
    expr = expr.slice(0, -1);
  }

  function addHistory(item) {
    history.unshift(item);
    if (history.length > 20) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(h => {
      const li = document.createElement('li');
      li.textContent = h;
      li.addEventListener('click', () => { expr = h; updateDisplay(); });
      historyList.appendChild(li);
    });
  }

  // Tokenize expression into numbers, operators and parens; detect unary minus
  function tokenize(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === ' ') { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let num = ch; i++;
        while (i < s.length && /[0-9.]/.test(s[i])) { num += s[i++]; }
        tokens.push({type:'num', value: num});
        continue;
      }
      if (ch === '+' || ch === '*' || ch === '/' ) { tokens.push({type:'op', value: ch}); i++; continue; }
      if (ch === '-') {
        const prev = tokens[tokens.length-1];
        if (!prev || (prev.type === 'op' || (prev.type === 'paren' && prev.value === '('))) {
          tokens.push({type:'op', value: 'u-'}); // unary minus
        } else {
          tokens.push({type:'op', value: '-'});
        }
        i++; continue;
      }
      if (ch === '(' || ch === ')') { tokens.push({type:'paren', value: ch}); i++; continue; }
      if (ch === '%') { tokens.push({type:'op', value: '%'}); i++; continue; }
      i++;
    }
    return tokens;
  }

  function toRPN(tokens) {
    const out = [];
    const ops = [];
    const prec = { '+':1, '-':1, '*':2, '/':2, '%':3, 'u-':4 };
    const assoc = { '+':'L','-':'L','*':'L','/':'L','%':'R','u-':'R' };
    tokens.forEach(t => {
      if (t.type === 'num') out.push(t);
      else if (t.type === 'op') {
        while (ops.length) {
          const top = ops[ops.length-1];
          if (top.type === 'op' && ((assoc[t.value] === 'L' && prec[t.value] <= prec[top.value]) || (assoc[t.value] === 'R' && prec[t.value] < prec[top.value]))) {
            out.push(ops.pop());
          } else break;
        }
        ops.push(t);
      } else if (t.type === 'paren') {
        if (t.value === '(') ops.push(t);
        else {
          while (ops.length && !(ops[ops.length-1].type === 'paren' && ops[ops.length-1].value === '(')) out.push(ops.pop());
          ops.pop();
        }
      }
    });
    while (ops.length) out.push(ops.pop());
    return out;
  }

  function evalRPN(rpn) {
    const st = [];
    for (const t of rpn) {
      if (t.type === 'num') st.push(parseFloat(t.value));
      else if (t.type === 'op') {
        if (t.value === 'u-') {
          const a = st.pop(); st.push(-a);
        } else if (t.value === '%') {
          const a = st.pop(); st.push(a/100);
        } else {
          const b = st.pop(); const a = st.pop();
          if (t.value === '+') st.push(a + b);
          if (t.value === '-') st.push(a - b);
          if (t.value === '*') st.push(a * b);
          if (t.value === '/') st.push(b === 0 ? NaN : a / b);
        }
      }
    }
    return st.pop();
  }

  function evaluateExpression(s) {
    try {
      const tokens = tokenize(s);
      const rpn = toRPN(tokens);
      const res = evalRPN(rpn);
      if (!Number.isFinite(res)) return '錯誤';
      return String(res);
    } catch (e) {
      return '錯誤';
    }
  }

  keys.addEventListener('click', (e) => {
    const t = e.target; if (!t.matches('button')) return;
    const action = t.dataset.action; const val = t.textContent.trim();
    if (!action) {
      pushToken(val);
    } else if (action === 'clear') { clearAll(); }
    else if (action === 'backspace') { backspace(); }
    else if (action === 'percent') { pushToken('%'); }
    else if (action === 'paren') { pushToken(t.dataset.paren); }
    else if (action === 'plusminus') {
      // toggle sign of last number: attempt simple heuristic
      const m = expr.match(/(\d*\.?\d+)$/);
      if (m) {
        const num = m[1];
        expr = expr.slice(0, -num.length) + '(' + (-Number(num)) + ')';
      } else {
        // nothing, prepend unary minus
        pushToken('u-');
      }
    }
    else if (action === 'operator') { pushToken(t.dataset.op); }
    else if (action === 'equals') {
      const res = evaluateExpression(expr);
      addHistory(expr);
      updateDisplay(res);
      expr = res === '錯誤' ? '' : res;
      return;
    }
    updateDisplay();
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if ((/^[0-9]$/).test(k)) { pushToken(k); }
    else if (k === '.') { pushToken('.'); }
    else if (k === 'Enter' || k === '=') { const r = evaluateExpression(expr); addHistory(expr); updateDisplay(r); expr = r === '錯誤' ? '' : r; e.preventDefault(); return; }
    else if (k === 'Backspace') { backspace(); }
    else if (k === 'Escape') { clearAll(); }
    else if (k === '+' || k === '-' || k === '*' || k === '/') { pushToken(k); }
    else if (k === '(' || k === ')') { pushToken(k); }
    else if (k === '%') { pushToken('%'); }
    updateDisplay();
  });

  updateDisplay();
})();

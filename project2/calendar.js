(function(){
  const monthYearEl = document.getElementById('monthYear');
  const grid = document.getElementById('calendarGrid');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const selectedDateEl = document.getElementById('selectedDate');
  const eventsList = document.getElementById('eventsList');

  const STORAGE_KEY = 'project2-calendar-events';
  let events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  let today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); }

  function startOfMonth(y,m){ return new Date(y,m,1); }
  function endOfMonth(y,m){ return new Date(y,m+1,0); }

  function formatDateKey(d){
    const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function render(){
    grid.innerHTML = '';
    // weekdays header
    const weekdays = ['日','一','二','三','四','五','六'];
    weekdays.forEach(w => {
      const el = document.createElement('div'); el.className='weekday'; el.textContent = w; grid.appendChild(el);
    });

    const first = startOfMonth(viewYear, viewMonth);
    const last = endOfMonth(viewYear, viewMonth);
    const startIndex = first.getDay();
    const totalDays = last.getDate();

    // previous month's tail
    const prevLast = new Date(viewYear, viewMonth, 0);
    for(let i = startIndex-1; i>=0; i--){
      const d = new Date(viewYear, viewMonth-1, prevLast.getDate()-i);
      appendDay(d, true);
    }
    // current month
    for(let d=1; d<=totalDays; d++) appendDay(new Date(viewYear, viewMonth, d), false);
    // next month's head
    const cells = grid.querySelectorAll('.day').length;
    const need = 7*6 - cells; // keep 6 rows
    for(let i=1;i<=need;i++) appendDay(new Date(viewYear, viewMonth+1, i), true);

    monthYearEl.textContent = `${viewYear} 年 ${viewMonth+1} 月`;
    renderEvents();
  }

  function appendDay(date, other){
    const key = formatDateKey(date);
    const el = document.createElement('div'); el.className = 'day' + (other? ' other':'');
    if (formatDateKey(today) === key) el.classList.add('today');
    el.innerHTML = `<div class="num">${date.getDate()}</div>`;
    const ev = events[key] || [];
    if(ev.length) {
      const dot = document.createElement('div'); dot.style.marginTop='6px'; dot.textContent = ev.length + ' 件'; dot.style.fontSize='0.85rem'; dot.style.color='var(--muted)'; el.appendChild(dot);
    }
    el.addEventListener('click', ()=> onDayClick(date, key));
    grid.appendChild(el);
  }

  function onDayClick(date, key){
    selectedDate = key;
    selectedDateEl.textContent = key;
    const title = prompt('新增事件，輸入事件標題：');
    if(title && title.trim()){
      events[key] = events[key] || [];
      events[key].push({title: title.trim(), created: Date.now()});
      save();
      render();
    } else {
      renderEvents();
    }
  }

  function renderEvents(){
    eventsList.innerHTML = '';
    if(!selectedDate){ selectedDateEl.textContent = '尚未選取'; return; }
    const list = events[selectedDate] || [];
    if(list.length===0){ eventsList.innerHTML = '<li class="muted">沒有事件</li>'; return; }
    list.forEach((e,i)=>{
      const li = document.createElement('li');
      const span = document.createElement('span'); span.className='event-title'; span.textContent = e.title;
      const del = document.createElement('button'); del.className='event-delete'; del.textContent='刪除';
      del.addEventListener('click', ()=>{ if(confirm('刪除此事件？')){ events[selectedDate].splice(i,1); if(events[selectedDate].length===0) delete events[selectedDate]; save(); render(); }});
      li.appendChild(span); li.appendChild(del); eventsList.appendChild(li);
    });
  }

  prevBtn.addEventListener('click', ()=>{ viewMonth--; if(viewMonth<0){ viewMonth=11; viewYear--; } render(); });
  nextBtn.addEventListener('click', ()=>{ viewMonth++; if(viewMonth>11){ viewMonth=0; viewYear++; } render(); });

  // load default selected date as today
  selectedDate = formatDateKey(today);
  render();
})();

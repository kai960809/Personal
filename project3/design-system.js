(function(){
  const colors = document.getElementById('colors');
  const toggle = document.getElementById('toggleTheme');

  if(colors){
    colors.addEventListener('click', (e)=>{
      const t = e.target.closest('.token');
      if(!t) return;
      const token = t.dataset.token;
      if(!token) return;
      navigator.clipboard?.writeText(token).then(()=>{
        t.style.outline = '2px solid rgba(96,165,250,0.25)';
        setTimeout(()=> t.style.outline = '', 800);
      }).catch(()=>{
        alert('複製失敗：瀏覽器不支援剪貼簿 API');
      });
    });
  }

  if(toggle){
    toggle.addEventListener('click', ()=>{
      const root = document.documentElement;
      const isDark = root.style.getPropertyValue('--bg') === '' ? true : false;
      // simple toggle by swapping some variables (basic demo)
      if(root.dataset.theme === 'light'){
        root.dataset.theme = 'dark';
        root.style.setProperty('--bg','#0a0e27');
        root.style.setProperty('--card','#1a1f3a');
        root.style.setProperty('--text','#e8eef8');
      } else {
        root.dataset.theme = 'light';
        root.style.setProperty('--bg','#ffffff');
        root.style.setProperty('--card','#f4f6f8');
        root.style.setProperty('--text','#0a0e27');
      }
    });
  }
})();

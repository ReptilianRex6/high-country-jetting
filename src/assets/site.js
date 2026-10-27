const toggle=document.querySelector('.menu'),nav=document.querySelector('#nav');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');toggle.focus();}});
const themeButtons=document.querySelectorAll('[data-theme-option]');
const markTheme=()=>{const current=document.documentElement.dataset.theme||'basin';themeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeOption===current)));};
themeButtons.forEach(b=>b.addEventListener('click',()=>{document.documentElement.dataset.theme=b.dataset.themeOption;try{localStorage.setItem('theme',b.dataset.themeOption);}catch{}markTheme();}));
if(themeButtons.length){try{const t=new URLSearchParams(location.search).get('theme');if(t)localStorage.setItem('theme',t);}catch{}markTheme();}

// Little 'mood' button for fun
const moods = [
  {bg:'#0f1222', fg:'#e7e7ef', card:'#1a1d32', accent:'#8de1ff', name:'Night'},
  {bg:'#0f1f12', fg:'#e7efe7', card:'#16321a', accent:'#9cff8d', name:'Forest'},
  {bg:'#1f0f12', fg:'#feeef4', card:'#321a1f', accent:'#ff8db3', name:'Rose'},
  {bg:'#0f151f', fg:'#eef6ff', card:'#172235', accent:'#8db2ff', name:'Deep Blue'}
];
const btn = document.getElementById('moodBtn');
const label = document.getElementById('moodLabel');
function setMood(i){
  const m = moods[i % moods.length];
  document.documentElement.style.setProperty('--bg', m.bg);
  document.documentElement.style.setProperty('--fg', m.fg);
  document.documentElement.style.setProperty('--card', m.card);
  document.documentElement.style.setProperty('--accent', m.accent);
  label.textContent = 'Mood: ' + m.name;
  localStorage.setItem('moodIndex', i);
}
const saved = +localStorage.getItem('moodIndex') || 0;
setMood(saved);
let i = saved;
btn?.addEventListener('click', ()=>{ i=(i+1)%moods.length; setMood(i); });

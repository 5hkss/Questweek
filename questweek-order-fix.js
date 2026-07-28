(() => {
  const toMinutes = value => {
    const match = String(value || '').match(/\b(\d{2}):(\d{2})\b/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : Number.MAX_SAFE_INTEGER;
  };

  const sortTodayTasks = () => {
    const list = document.querySelector('#todayTasks');
    if (!list) return;

    const items = [...list.children];
    const originalOrder = new Map(items.map((item, index) => [item, index]));

    items.sort((a, b) => {
      const aTime = toMinutes(a.querySelector('.meta')?.textContent);
      const bTime = toMinutes(b.querySelector('.meta')?.textContent);
      if (aTime !== bTime) return aTime - bTime;

      const aPriority = Number(a.dataset.priority || 0);
      const bPriority = Number(b.dataset.priority || 0);
      if (aPriority !== bPriority) return bPriority - aPriority;

      return originalOrder.get(a) - originalOrder.get(b);
    });

    items.forEach(item => list.appendChild(item));
  };

  const observer = new MutationObserver(sortTodayTasks);

  const start = () => {
    const list = document.querySelector('#todayTasks');
    if (!list) {
      requestAnimationFrame(start);
      return;
    }
    observer.observe(list, { childList: true });
    sortTodayTasks();
  };

  start();
})();
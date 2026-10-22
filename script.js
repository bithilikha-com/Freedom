document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.screen-card');

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter;
      filters.forEach((btn) => btn.classList.toggle('active', btn === button));

      cards.forEach((card) => {
        const category = card.dataset.category || 'all';
        const isVisible = selected === 'all' || category === selected;
        card.style.display = isVisible ? '' : 'none';
      });
    });
  });
});

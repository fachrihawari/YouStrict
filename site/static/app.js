(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('#site-nav');
  const menu = document.querySelector('[data-menu]');

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (menu && nav && header) {
    const setOpen = (open) => {
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? menu.dataset.labelClose : menu.dataset.labelOpen);
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  const items = document.querySelectorAll('[data-reveal]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduced) {
    items.forEach((item) => item.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((item) => observer.observe(item));
  }
})();

// ===== Mohammed Adhil C H — Portfolio interactions =====
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Navbar scroll state
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = $('#menu-toggle');
  const links = $('#nav-links');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));

  // Active link highlighting
  const sections = $$('main section[id]');
  const navMap = new Map($$('#nav-links a').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navMap.forEach(a => a.classList.remove('active'));
        navMap.get(e.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // Typewriter roles
  const roles = ['Performance Marketer', 'UI/UX Designer', 'Automation Specialist', 'AI Creative Artist'];
  const typed = $('#typed');
  let r = 0, i = roles[0].length, deleting = true;
  const tick = () => {
    const word = roles[r];
    typed.textContent = word.slice(0, i);
    if (deleting) {
      i--;
      if (i < 0) { deleting = false; r = (r + 1) % roles.length; i = 0; return setTimeout(tick, 300); }
      return setTimeout(tick, 45);
    }
    i++;
    if (i > roles[r].length) { deleting = true; i = roles[r].length; return setTimeout(tick, 2000); }
    setTimeout(tick, 85);
  };
  setTimeout(tick, 2400);

  // Duplicate marquee for seamless loop
  const track = $('#marquee-track');
  track.innerHTML += track.innerHTML;

  const fine = window.matchMedia('(pointer: fine)').matches;
  if (fine) {
    // Cursor glow
    const glow = $('#cursor-glow');
    window.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });

    // Spotlight on skill cards
    $$('.skill-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    // Hero visual tilt
    const hv = $('#hero-visual');
    const main = $('.hv-main', hv);
    hv.addEventListener('mousemove', e => {
      const b = hv.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5;
      const y = (e.clientY - b.top) / b.height - 0.5;
      main.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    hv.addEventListener('mouseleave', () => { main.style.transform = ''; });
  }

  // Copy email to clipboard (never opens a mail app)
  const toast = $('#toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $('#contact-email').addEventListener('click', e => {
    e.preventDefault();
    const email = e.currentTarget.dataset.copy;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard ✦'));
    }
    $('#contact-form').scrollIntoView({ behavior: 'smooth' });
  });

  // Contact form — sent in the background via FormSubmit (no email app needed)
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/adhiuiux@gmail.com';
  const form = $('#contact-form');
  const status = $('#form-status');
  const submitBtn = $('#contact-submit');
  const btnLabel = $('.btn-label', submitBtn);

  const validate = () => {
    let ok = true;
    $$('[required]', form).forEach(el => {
      const valid = el.checkValidity() && el.value.trim() !== '';
      el.closest('.field').classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    return ok;
  };
  $$('input, textarea, select', form).forEach(el =>
    el.addEventListener('input', () => el.closest('.field')?.classList.remove('invalid'))
  );

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form-status';
    if (!validate()) {
      status.textContent = 'Please fill in all required fields correctly.';
      status.classList.add('err');
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return; // bot

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnLabel.textContent = 'Sending…';
    status.textContent = '';

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject: `New portfolio enquiry from ${data.name}`,
          _replyto: data.email,
          _template: 'table',
          _captcha: 'false'
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === 'false' || json.success === false) throw new Error(json.message || 'Failed');
      form.reset();
      status.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
      status.classList.add('ok');
      showToast('Message sent ✦');
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again or call +91 98954 72706.';
      status.classList.add('err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      btnLabel.textContent = 'Send message';
    }
  });
})();

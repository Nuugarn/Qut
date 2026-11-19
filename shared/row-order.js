const RowOrder = (() => {
  const copy = {
    th: { title: 'ย้ายรายการ', position: 'ตำแหน่งใหม่', move: 'ย้าย', top: 'ย้ายไปบนสุด', cancel: 'ยกเลิก', installment: 'งวดที่' },
    en: { title: 'Move item', position: 'New position', move: 'Move', top: 'Move to top', cancel: 'Cancel', installment: 'Installment' }
  };

  let armedDelete;

  function disarmDelete() {
    if (!armedDelete) return;
    armedDelete.classList.remove('is-armed');
    armedDelete.removeAttribute('aria-pressed');
    armedDelete.setAttribute('aria-label', armedDelete.title);
    armedDelete = null;
  }

  function confirmDelete(button, remove) {
    if (armedDelete === button) {
      disarmDelete();
      remove();
      return;
    }
    disarmDelete();
    armedDelete = button;
    button.classList.add('is-armed');
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Press again to delete' : 'กดอีกครั้งเพื่อลบ');
  }

  document.addEventListener('click', event => {
    if (!armedDelete?.contains(event.target)) disarmDelete();
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'Tab') disarmDelete();
  });

  function attachDrag(body, save) {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new WeakMap();
    let drag;
    let suppressClick = false;
    let scrollFrame;

    body.addEventListener('pointerdown', event => {
      if (drag || !event.isPrimary || event.button !== 0) return;
      suppressClick = false;
      const handle = event.target.closest('.btn-move-row');
      if (!handle || body.rows.length < 2) return;
      const row = handle.closest('tr');
      drag = { id: event.pointerId, row, next: row.nextElementSibling, start: event.clientY, y: event.clientY, active: false };
    });

    function placeRow() {
      const { row, y } = drag;
      const rows = Array.from(body.rows);
      const index = rows.indexOf(row);
      const before = rows.slice(0, index).find(other => y < midpoint(other));
      const after = rows.slice(index + 1).findLast(other => y > midpoint(other));
      if (before || after) {
        const positions = rows.filter(other => other !== row).map(other => [other, other.getBoundingClientRect().top]);
        if (before) before.before(row);
        else after.after(row);
        for (const [other, oldTop] of positions) {
          animations.get(other)?.cancel();
          const delta = oldTop - other.getBoundingClientRect().top;
          if (delta && !reduceMotion.matches) {
            animations.set(other, other.animate([{ transform: 'translateY(' + delta + 'px)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' }));
          }
        }
      }
      row.style.transform = 'none';
      const offset = y - row.getBoundingClientRect().top - drag.grab;
      row.style.transform = 'translateY(' + offset + 'px)';
    }

    function midpoint(row) {
      const rect = row.getBoundingClientRect();
      return rect.top + rect.height / 2;
    }

    function autoScroll() {
      if (!drag?.active) return;
      const top = Math.max(0, document.querySelector('.topbar').getBoundingClientRect().bottom);
      const bottom = innerHeight;
      const speed = drag.y < top + 45 ? -12 : drag.y > bottom - 45 ? 12 : 0;
      if (speed) {
        const previous = scrollY;
        window.scrollBy({ top: speed, behavior: 'instant' });
        if (previous !== scrollY) placeRow();
      }
      scrollFrame = requestAnimationFrame(autoScroll);
    }

    document.addEventListener('pointermove', event => {
      if (event.pointerId !== drag?.id) return;
      drag.y = event.clientY;
      if (!drag.active) {
        if (Math.abs(drag.y - drag.start) < 6) return;
        drag.active = true;
        drag.grab = drag.start - drag.row.getBoundingClientRect().top;
        suppressClick = true;
        disarmDelete();
        body.setPointerCapture(event.pointerId);
        drag.row.classList.add('is-dragging-row');
        scrollFrame = requestAnimationFrame(autoScroll);
      }
      placeRow();
    });

    function finish(cancelled) {
      if (!drag) return;
      const { row, next, id, active } = drag;
      drag = null;
      if (!active) return;

      cancelAnimationFrame(scrollFrame);
      const wasMoved = row.nextElementSibling !== next;
      if (cancelled && wasMoved) body.insertBefore(row, next);
      row.style.removeProperty('transform');
      row.classList.remove('is-dragging-row');
      if (body.hasPointerCapture(id)) body.releasePointerCapture(id);
      if (!cancelled && wasMoved) save();
    }

    document.addEventListener('pointerup', event => { if (event.pointerId === drag?.id) finish(false); });
    document.addEventListener('pointercancel', event => { if (event.pointerId === drag?.id) finish(true); });
    body.addEventListener('lostpointercapture', event => { if (event.target === body && event.pointerId === drag?.id) finish(true); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') finish(true); });
    body.addEventListener('click', event => {
      if (!suppressClick || !event.detail) return;
      suppressClick = false;
      event.stopImmediatePropagation();
    }, true);
  }

  function label(row, language, installment) {
    const button = row.querySelector('.btn-move-row');
    const text = copy[language];
    button.title = text.title;
    button.setAttribute('aria-label', installment ? text.title + ' · ' + text.installment + ' ' + installment : text.title);
  }

  function attach(body, language, save) {
    attachDrag(body, save);
    const dialog = document.createElement('dialog');
    dialog.id = 'row-order-dialog';
    dialog.className = 'no-print';
    dialog.setAttribute('aria-labelledby', 'row-order-title');
    dialog.innerHTML = '<form method="dialog">' +
      '<h2 id="row-order-title"></h2><label for="row-order-position"></label> ' +
      '<select id="row-order-position" autofocus></select>' +
      '<div class="row-order-controls"><button value="move"></button>' +
      '<button value="top"></button><button value="cancel"></button></div></form>';
    document.body.appendChild(dialog);

    const position = dialog.querySelector('select');
    let trigger;

    body.addEventListener('click', event => {
      const button = event.target.closest('.btn-move-row');
      if (!button) return;

      trigger = button;
      const rows = Array.from(body.rows);
      const text = copy[language()];
      dialog.querySelector('h2').textContent = text.title;
      dialog.querySelector('label').textContent = text.position;
      dialog.querySelectorAll('button').forEach(control => { control.textContent = text[control.value]; });
      position.replaceChildren(...rows.map((_, index) => new Option(index + 1, index)));
      position.value = rows.indexOf(button.closest('tr'));
      dialog.showModal();
    });

    dialog.addEventListener('submit', event => {
      event.preventDefault();
      const action = event.submitter.value;
      if (action !== 'cancel') {
        const rows = Array.from(body.rows);
        const row = trigger.closest('tr');
        const current = rows.indexOf(row);
        const target = action === 'top' ? 0 : Number(position.value);
        if (target !== current) {
          if (target < current) rows[target].before(row);
          else rows[target].after(row);
          save();
        }
      }
      dialog.close();
      trigger.focus();
    });
  }

  return { attach, label, confirmDelete };
})();

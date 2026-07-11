// Kai's Creations — LOCAL-ONLY manager script.
// Talks to manager-server.js (built-in http/fs only). Never bundled into the public gallery.

(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const uploadStatus = document.getElementById('upload-status');
  const itemList = document.getElementById('item-list');
  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');

  let items = [];
  let draggingRow = null;

  function slugify(str) {
    return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
  }

  function uniqueId(base) {
    let id = base;
    let i = 1;
    while (items.some((it) => it.id === id)) { id = `${base}-${i}`; i += 1; }
    return id;
  }

  function loadItems() {
    fetch('/api/creations')
      .then((r) => r.json())
      .then((data) => {
        items = (data && Array.isArray(data.items)) ? data.items : [];
        renderList();
      })
      .catch((e) => {
        saveStatus.textContent = 'Could not load creations.json: ' + e.message;
        saveStatus.className = 'save-status err';
      });
  }

  function renderList() {
    itemList.innerHTML = '';
    items.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((item) => {
      const li = document.createElement('li');
      li.className = 'item-row';
      li.draggable = true;
      li.dataset.id = item.id;

      const badgeClass = item.dateSource === 'exif' ? 'exif' : (item.dateSource === 'manual' ? 'manual' : 'unknown');

      li.innerHTML = `
        <img src="/${item.thumb || item.image}" alt="">
        <div class="item-fields">
          <div class="full-row">
            <label>Title</label>
            <input type="text" data-field="title" value="${escapeAttr(item.title || '')}">
          </div>
          <div>
            <label>Category</label>
            <select data-field="category">
              <option value="lego" ${item.category === 'lego' ? 'selected' : ''}>Lego</option>
              <option value="paper" ${item.category === 'paper' ? 'selected' : ''}>Paper Craft</option>
              <option value="art" ${item.category === 'art' ? 'selected' : ''}>Art</option>
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" data-field="date" value="${escapeAttr(item.date || '')}">
          </div>
          <div class="full-row">
            <label>Tags (comma separated)</label>
            <input type="text" data-field="tags" value="${escapeAttr((item.tags || []).join(', '))}">
          </div>
          <div class="full-row">
            <span class="exif-badge ${badgeClass}">date source: ${item.dateSource || 'unknown'}</span>
            <label style="display:inline-block; margin-left:10px;">
              <input type="checkbox" data-field="featured" ${item.featured ? 'checked' : ''}> Featured
            </label>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn small danger" data-action="delete">Delete</button>
        </div>
      `;

      li.querySelectorAll('[data-field]').forEach((el) => {
        el.addEventListener('change', () => updateField(item.id, el));
      });
      li.querySelector('[data-action="delete"]').addEventListener('click', () => {
        items = items.filter((it) => it.id !== item.id);
        renderList();
      });

      li.addEventListener('dragstart', () => { draggingRow = li; li.classList.add('dragging'); });
      li.addEventListener('dragend', () => { li.classList.remove('dragging'); draggingRow = null; reorderFromDom(); });
      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggingRow || draggingRow === li) return;
        const rect = li.getBoundingClientRect();
        const after = (e.clientY - rect.top) > rect.height / 2;
        li.parentNode.insertBefore(draggingRow, after ? li.nextSibling : li);
      });

      itemList.appendChild(li);
    });
  }

  function reorderFromDom() {
    const ids = Array.from(itemList.children).map((li) => li.dataset.id);
    ids.forEach((id, idx) => {
      const item = items.find((it) => it.id === id);
      if (item) item.order = idx + 1;
    });
  }

  function updateField(id, el) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const field = el.dataset.field;
    if (field === 'tags') {
      item.tags = el.value.split(',').map((t) => t.trim()).filter(Boolean);
    } else if (field === 'featured') {
      item.featured = el.checked;
    } else if (field === 'date') {
      item.date = el.value;
      item.dateSource = el.value ? 'manual' : 'unknown';
      renderList();
    } else {
      item[field] = el.value;
    }
  }

  function escapeAttr(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  saveBtn.addEventListener('click', () => {
    reorderFromDom();
    fetch('/api/creations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          saveStatus.textContent = 'Saved ✓';
          saveStatus.className = 'save-status ok';
        } else {
          saveStatus.textContent = 'Error: ' + (res.error || 'unknown');
          saveStatus.className = 'save-status err';
        }
        setTimeout(() => { saveStatus.textContent = ''; }, 4000);
      })
      .catch((e) => {
        saveStatus.textContent = 'Save failed: ' + e.message;
        saveStatus.className = 'save-status err';
      });
  });

  function handleFiles(fileList) {
    const file = fileList[0];
    if (!file) return;
    uploadStatus.textContent = `Reading ${file.name}...`;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      let exifDate = null;
      try { exifDate = window.KaiExif ? window.KaiExif.readExifDate(arrayBuffer) : null; } catch (e) { exifDate = null; }

      const base64Reader = new FileReader();
      base64Reader.onload = () => {
        const dataUrl = base64Reader.result;
        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl })
        })
          .then((r) => r.json())
          .then((res) => {
            if (!res.ok) throw new Error(res.error || 'upload failed');
            const id = uniqueId(slugify(file.name.replace(/\.[a-z0-9]+$/i, '')));
            const newItem = {
              id,
              title: file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' '),
              category: 'lego',
              date: exifDate || '',
              dateSource: exifDate ? 'exif' : 'unknown',
              tags: [],
              order: items.length + 1,
              featured: false,
              image: res.path,
              thumb: res.path,
              alt: ''
            };
            items.push(newItem);
            renderList();
            uploadStatus.textContent = exifDate
              ? `Added "${newItem.title}" — EXIF date found: ${exifDate}`
              : `Added "${newItem.title}" — no EXIF date found, please set one manually.`;
          })
          .catch((e) => {
            uploadStatus.textContent = 'Upload failed: ' + e.message;
          });
      };
      base64Reader.readAsDataURL(file);
    };
    reader.readAsArrayBuffer(file);
  }

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  ['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragover'); });
  });
  dropzone.addEventListener('drop', (e) => { handleFiles(e.dataTransfer.files); });

  loadItems();
})();

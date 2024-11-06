class NoteApp {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.currentFilter = "all";
    this.theme = localStorage.getItem("theme") || "light";
    this.applyTheme();
    this.initializeApp();
  }

  initializeApp() {
    // Event listener for creating a new note
    document
      .getElementById("newNoteBtn")
      .addEventListener("click", () => this.showModal());

    // Event listener for closing the modal
    document
      .getElementById("closeModal")
      .addEventListener("click", () => this.hideModal());

    // Event listener for saving a note
    document
      .getElementById("saveNote")
      .addEventListener("click", () => this.saveNote());

    // Event listener for toggling preview
    document
      .getElementById("togglePreview")
      .addEventListener("click", () => this.togglePreview());

    // Event listener for updating preview
    document
      .getElementById("noteContent")
      .addEventListener("input", (e) => this.updatePreview(e));

    // Event listener for search input
    document
      .getElementById("searchInput")
      .addEventListener("input", (e) => this.handleSearch(e));

    // Event listeners for category filters
    document.querySelectorAll(".category-filter").forEach((button) => {
      button.addEventListener("click", () => {
        // Update active class
        document
          .querySelectorAll(".category-filter")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Update current filter and render notes
        this.currentFilter = button.dataset.category;
        this.renderNotes();
      });
    });

    // Event listener for theme toggle
    document
      .getElementById("themeToggle")
      .addEventListener("click", () => this.toggleTheme());

    // Update theme icon
    this.updateThemeIcon();

    this.renderNotes();
  }

  // Remove initializeNavigation() as it's no longer needed

  showSearchView() {
    const container = document.querySelector(".main-content");
    container.innerHTML = `
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Search notes...">
        <div class="search-results"></div>
      </div>
    `;

    const searchInput = container.querySelector(".search-input");
    searchInput.addEventListener("input", (e) => this.handleSearch(e));
  }

  showCategoriesView() {
    const container = document.querySelector(".main-content");
    container.innerHTML = `
      <div class="categories-container">
        <div class="category-list">
          <div class="category-item" data-category="all">All Notes</div>
          <div class="category-item" data-category="personal">Personal</div>
          <div class="category-item" data-category="work">Work</div>
          <div class="category-item" data-category="ideas">Ideas</div>
        </div>
      </div>
    `;

    // Add category click handlers
    container.querySelectorAll(".category-item").forEach((cat) => {
      cat.addEventListener("click", () => {
        this.currentFilter = cat.dataset.category;
        this.renderNotes();
        // Switch back to home view
        document.querySelector('.nav-item[data-view="home"]').click();
      });
    });
  }

  showModal(noteToEdit = null) {
    const modal = document.getElementById("noteModal");

    // Reset modal content to editing form
    modal.querySelector(".modal-content").innerHTML = `
        <div class="modal-header">
            <input type="text" id="noteTitle" placeholder="Note Title" />
            <select id="noteCategory">
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="ideas">Ideas</option>
            </select>
            <button id="closeModal">&times;</button>
        </div>
        <div class="editor-container">
            <textarea id="noteContent" placeholder="Write your note here... (Markdown supported)"></textarea>
            <div id="preview" class="preview-pane"></div>
        </div>
        <div class="modal-footer">
            <button id="togglePreview" class="action-btn">Toggle Preview</button>
            <button id="saveNote" class="action-btn">Save Note</button>
        </div>
    `;

    // Reattach event listeners
    document
      .getElementById("closeModal")
      .addEventListener("click", () => this.hideModal());
    document
      .getElementById("togglePreview")
      .addEventListener("click", () => this.togglePreview());
    document
      .getElementById("saveNote")
      .addEventListener("click", () => this.saveNote());
    document
      .getElementById("noteContent")
      .addEventListener("input", (e) => this.updatePreview(e));

    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const categorySelect = document.getElementById("noteCategory");

    if (noteToEdit) {
      titleInput.value = noteToEdit.title;
      contentInput.value = noteToEdit.content;
      categorySelect.value = noteToEdit.category;
      modal.dataset.editId = noteToEdit.id;
    } else {
      titleInput.value = "";
      contentInput.value = "";
      delete modal.dataset.editId;
    }

    modal.style.display = "block";
    this.updatePreview({ target: contentInput });

    // Focus title input after modal opens
    setTimeout(() => {
      titleInput.focus();
    }, 100);
  }

  hideModal() {
    document.getElementById("noteModal").style.display = "none";
  }

  saveNote() {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const categorySelect = document.getElementById("noteCategory");
    const modal = document.getElementById("noteModal");

    const note = {
      id: modal.dataset.editId || Date.now().toString(),
      title: titleInput.value,
      content: contentInput.value,
      category: categorySelect.value,
      lastModified: new Date().toISOString(),
    };

    const existingNoteIndex = this.notes.findIndex((n) => n.id === note.id);
    if (existingNoteIndex > -1) {
      this.notes[existingNoteIndex] = note;
    } else {
      this.notes.push(note);
    }

    this.saveToLocalStorage();
    this.renderNotes();
    this.hideModal();
  }

  deleteNote(id) {
    this.notes = this.notes.filter((note) => note.id !== id);
    this.saveToLocalStorage();
    this.renderNotes();
  }

  renderNotes() {
    const container = document.getElementById("notesGrid");
    container.innerHTML = "";

    const filteredNotes = this.filterNotesByCategory(this.notes);

    filteredNotes.forEach((note, index) => {
      const noteCard = this.createNoteCard(note, index);
      container.appendChild(noteCard);
    });
  }

  renderFilteredNotes(filteredNotes) {
    const container = document.getElementById("notesGrid");
    container.innerHTML = "";

    filteredNotes.forEach((note, index) => {
      const noteCard = this.createNoteCard(note, index);
      container.appendChild(noteCard);
    });
  }

  createNoteCard(note, index) {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.setProperty("--animation-order", index);

    // Random gradient borders
    const gradients = [
      `linear-gradient(45deg, var(--neon-blue), var(--neon-purple))`,
      `linear-gradient(45deg, var(--cyber-pink), var(--neon-purple))`,
      `linear-gradient(45deg, var(--matrix-green), var(--neon-blue))`,
    ];

    card.style.borderImage =
      gradients[Math.floor(Math.random() * gradients.length)];
    card.style.borderImageSlice = 1;

    // Randomly assign sizes for bento layout
    // if (Math.random() > 0.7) {
    //   card.style.gridRow = "span 2";
    // }
    // if (Math.random() > 0.8) {
    //   card.style.gridColumn = "span 2";
    // }

    card.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <span class="category-badge">${note.category}</span>
            </div>
            <div class="note-preview">${marked.parse(
              note.content.substring(0, 100)
            )}...</div>
            <div class="note-footer">
                <span class="date">${new Date(
                  note.lastModified
                ).toLocaleDateString()}</span>
                <div class="actions">
                    <button class="edit-btn"><i class="ri-edit-line"></i></button>
                    <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
        `;

    // Add click handler for full preview
    card.addEventListener("click", (e) => {
      // Prevent triggering when clicking buttons
      if (!e.target.closest(".actions")) {
        this.showNotePreview(note);
      }
    });

    // Update event listeners
    card.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.showModal(note);
    });
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteNote(note.id);
    });

    // Add futuristic entrance animation
    card.style.opacity = "0";
    card.style.transform = "translateY(20px) scale(0.95)";
    requestAnimationFrame(() => {
      card.style.transition = "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0) scale(1)";
    });

    // Add touch feedback
    card.addEventListener("touchstart", () => {
      card.style.transform = "scale(0.98)";
    });

    card.addEventListener("touchend", () => {
      card.style.transform = "";
    });

    return card;
  }

  showNotePreview(note) {
    const modal = document.getElementById("noteModal");
    modal.querySelector(".modal-content").innerHTML = `
        <div class="modal-header">
            <h2>${note.title}</h2>
            <span class="category-badge">${note.category}</span>
            <button id="closeModal">&times;</button>
        </div>
        <div class="preview-container">
            <div class="preview-content">
                ${marked.parse(note.content)}
            </div>
        </div>
        <div class="modal-footer">
            <button id="editNoteBtn" class="action-btn">Edit Note</button>
        </div>
    `;

    // Add event listeners for the preview modal
    modal
      .querySelector("#closeModal")
      .addEventListener("click", () => this.hideModal());
    modal.querySelector("#editNoteBtn").addEventListener("click", () => {
      this.showModal(note);
    });

    modal.style.display = "block";
  }

  filterNotesByCategory(notes) {
    if (this.currentFilter === "all") return notes;
    return notes.filter((note) => note.category === this.currentFilter);
  }

  handleSearch(e) {
    // Debounce search input
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredNotes = this.notes.filter(
        (note) =>
          (note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)) &&
          (this.currentFilter === "all" || note.category === this.currentFilter)
      );
      this.renderFilteredNotes(filteredNotes);
    }, 300);
  }

  togglePreview() {
    const editor = document.querySelector(".editor-container");
    editor.style.gridTemplateColumns =
      editor.style.gridTemplateColumns === "1fr" ? "1fr 1fr" : "1fr";
  }

  updatePreview(e) {
    const preview = document.getElementById("preview");
    preview.innerHTML = marked.parse(e.target.value);
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";
    this.applyTheme();
    this.updateThemeIcon();
    localStorage.setItem("theme", this.theme);
  }

  applyTheme() {
    document.body.className = `${this.theme}-theme`;
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById("themeToggle");
    themeToggle.style.transform = "rotate(180deg)";
    setTimeout(() => {
      themeToggle.innerHTML =
        this.theme === "light"
          ? '<b class="gg-sun">🌓</b>'
          : '<b class="gg-moon">🌓</b>';
      themeToggle.style.transform = "rotate(0deg)";
    }, 150);
  }

  saveToLocalStorage() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  new NoteApp();
});

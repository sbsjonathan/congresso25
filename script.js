document.addEventListener("DOMContentLoaded", () => {
  // Função debounce: retarda a execução da função passada até que o usuário pare de chamar por 'delay' ms.
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ====  
  // 0. Redirecionar do index.html para a última página visitada  
  // ====  
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
    const lastPage = localStorage.getItem("lastPage");
    if (
      lastPage &&
      lastPage !== "index.html" &&
      (lastPage.endsWith("sexta.html") || lastPage.endsWith("sabado.html") || lastPage.endsWith("domingo.html"))
    ) {
      window.location.href = lastPage;
    }
  } else {
    localStorage.setItem("lastPage", window.location.pathname);
  }

  // ====  
  // 1. Cor do tema (e persistência por dia)  
  // ====  
  const diaAtual = document.body.dataset.dia || "default";
  const storageKey = `highlightColor_${diaAtual}`;
  const colorPicker = document.getElementById("color-picker");

  function applyHighlightColor(color) {
    document.documentElement.style.setProperty("--highlight-color", color);
    colorPicker.value = color;
  }

  const savedColor = localStorage.getItem(storageKey);
  applyHighlightColor(savedColor || "#000000");

  colorPicker.addEventListener("input", function () {
    applyHighlightColor(this.value);
    localStorage.setItem(storageKey, this.value);
  });

  // ====  
  // 2. Controle de Fonte (A+/A-)  
  // ====  
  const fontStorageKey = "tamanhoTopico";
  const savedFontSize = localStorage.getItem(fontStorageKey);
  document.documentElement.style.setProperty("--tamanho-topico", savedFontSize || "18px");

  function adjustFontSize(increment) {
    let currentSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tamanho-topico"));
    currentSize += increment;
    if (currentSize < 10) currentSize = 10;
    if (currentSize > 40) currentSize = 40;
    const newSize = currentSize + "px";
    document.documentElement.style.setProperty("--tamanho-topico", newSize);
    localStorage.setItem(fontStorageKey, newSize);
  }

  document.getElementById("font-decrease")?.addEventListener("click", () => adjustFontSize(-1));
  document.getElementById("font-increase")?.addEventListener("click", () => adjustFontSize(1));

  // ====  
  // 3. Menu Ocultável  
  // ====  
  const title = document.getElementById("toggle-menu");
  const menuContainer = document.getElementById("menu-container");

  function toggleMenu() {
    menuContainer.classList.toggle("menu-visible");
    if (!menuContainer.classList.contains("menu-visible")) {
      closeAllTextareas();
    }
  }

  title?.addEventListener("click", toggleMenu);

  // ====  
  // 4. Caixas de Anotações  
  // ====  
  function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
  function closeAllTextareas() {
    document.querySelectorAll("textarea.show").forEach((textarea) => {
      textarea.classList.remove("show");
      textarea.style.height = "auto";
    });
  }
  function toggleTextarea(id) {
    const textarea = document.getElementById(id);
    if (textarea) {
      textarea.classList.toggle("show");
      if (textarea.classList.contains("show")) {
        autoResize(textarea);
        setTimeout(() => {
          // textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      } else {
        textarea.style.height = "auto";
      }
    }
  }
  
  // Utilize debounce para reduzir atualizações frequentes do localStorage durante a digitação
  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.value = localStorage.getItem(textarea.id) || "";
    autoResize(textarea);
    textarea.addEventListener("input", debounce(function () {
      localStorage.setItem(this.id, this.value);
      autoResize(this);
    }, 2000));
  });
  
  document.querySelectorAll(".clickable").forEach((element) => {
    element.addEventListener("click", function () {
      const textareaId = this.getAttribute("data-textarea");
      toggleTextarea(textareaId);
    });
  });

  // ====  
  // 5. Limpar Cache  
  // ====  
  const clearBtn = document.getElementById("clear-cache");
  clearBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // ====  
  // 6. Indicação do Horário Ativo na Agenda (Bolinha Verde e Sublinhado)  
  // ====  
  function verificarHorarioAgenda() {
    // Seleciona todos os <strong> que contêm os horários dentro dos itens da agenda
    const strongTimes = document.querySelectorAll(".schedule li strong");
    let schedule = [];

    strongTimes.forEach((el) => {
      let timeText = el.textContent.replace("•", "").trim();
      let parts = timeText.split(":");
      if (parts.length >= 2) {
        let hour = parseInt(parts[0]);
        let minute = parseInt(parts[1]);
        if (!isNaN(hour) && !isNaN(minute)) {
          schedule.push({ element: el, total: hour * 60 + minute });
        }
      }
    });

    schedule.sort((a, b) => a.total - b.total);
    if (schedule.length === 0) return;

    let agora = new Date();
    let current = agora.getHours() * 60 + agora.getMinutes();

    // Remove as classes "ativo" e "ativo-line" de todos os horários e seus containers
    schedule.forEach((item) => {
      item.element.classList.remove("ativo");
      const liParent = item.element.closest("li");
      if (liParent) {
        liParent.classList.remove("ativo-line");
      }
    });

    // Se estiver antes do primeiro ou depois do último horário, não marca nenhum
    if (current < schedule[0].total || current >= schedule[schedule.length - 1].total) return;

    for (let i = 0; i < schedule.length - 1; i++) {
      if (current >= schedule[i].total && current < schedule[i + 1].total) {
        schedule[i].element.classList.add("ativo");
        const liParent = schedule[i].element.closest("li");
        if (liParent) {
          liParent.classList.add("ativo-line");
        }
        break;
      }
    }
  }

  // Atualiza a indicação do horário ativo a cada minuto
  setInterval(verificarHorarioAgenda, 60000);
  verificarHorarioAgenda();
});

// Função: ao dar dois cliques no banner, vai para a home (index.html)
document.querySelector('.banner-topo')?.addEventListener('dblclick', () => {
    window.location.href = 'index.html';
});
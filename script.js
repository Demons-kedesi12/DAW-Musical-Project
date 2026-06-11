/* ===================================
   ELEMENTOS
=================================== */

const homeScreen = document.getElementById("home-screen");
const editorScreen = document.getElementById("editor-screen");

const projectNameInput = document.getElementById("project-name");
const createProjectBtn = document.getElementById("create-project-btn");

const projectsList = document.getElementById("projects-list");

const currentProjectName = document.getElementById("current-project-name");

const saveBtn = document.getElementById("save-btn");
const backBtn = document.getElementById("back-btn");

const cells = document.querySelectorAll(".cell");

/* ===================================
   DADOS
=================================== */

let currentProject = null;

const TOTAL_NOTES = 7;
const TOTAL_STEPS = 16;

/* ===================================
   NOTAS
=================================== */

const NOTES = [
    "C",
    "D",
    "E",
    "F",
    "G",
    "A",
    "B"
];

/* ===================================
   MATRIZ VAZIA
=================================== */

function createEmptyGrid() {

    const grid = [];

    for (let row = 0; row < TOTAL_NOTES; row++) {

        const noteRow = [];

        for (let col = 0; col < TOTAL_STEPS; col++) {
            noteRow.push(false);
        }

        grid.push(noteRow);
    }

    return grid;
}

/* ===================================
   PROJETOS
=================================== */

function getProjects() {

    return JSON.parse(
        localStorage.getItem("musicProjects")
    ) || [];
}

function saveProjects(projects) {

    localStorage.setItem(
        "musicProjects",
        JSON.stringify(projects)
    );
}

/* ===================================
   CRIAR PROJETO
=================================== */

createProjectBtn.addEventListener("click", () => {

    const name = projectNameInput.value.trim();

    if (!name) {
        alert("Digite um nome para o projeto.");
        return;
    }

    const project = {

        id: Date.now(),

        name: name,

        createdAt: new Date().toLocaleDateString(),

        notes: createEmptyGrid()
    };

    const projects = getProjects();

    projects.push(project);

    saveProjects(projects);

    projectNameInput.value = "";

    renderProjects();
});

/* ===================================
   LISTAR PROJETOS
=================================== */

function renderProjects() {

    projectsList.innerHTML = "";

    const projects = getProjects();

    if (projects.length === 0) {

        projectsList.innerHTML = `
            <p>Nenhum projeto criado.</p>
        `;

        return;
    }

    projects.forEach(project => {

        const card = document.createElement("div");

        card.classList.add("project-card");

        card.innerHTML = `
            <div class="project-info">

                <span class="project-name">
                    ${project.name}
                </span>

                <small>
                    Criado em ${project.createdAt}
                </small>

            </div>

            <div class="project-actions">

                <button
                    class="open-btn"
                    data-id="${project.id}">
                    Abrir
                </button>

                <button
                    class="delete-btn"
                    data-id="${project.id}">
                    Excluir
                </button>

            </div>
        `;

        projectsList.appendChild(card);
    });

    addProjectEvents();
}

/* ===================================
   EVENTOS DOS CARDS
=================================== */

function addProjectEvents() {

    const openButtons =
        document.querySelectorAll(".open-btn");

    const deleteButtons =
        document.querySelectorAll(".delete-btn");

    openButtons.forEach(button => {

        button.addEventListener("click", () => {

            const id =
                Number(button.dataset.id);

            openProject(id);
        });
    });

    deleteButtons.forEach(button => {

        button.addEventListener("click", () => {

            const id =
                Number(button.dataset.id);

            deleteProject(id);
        });
    });
}

/* ===================================
   ABRIR PROJETO
=================================== */

function openProject(id) {

    const projects = getProjects();

    const project =
        projects.find(p => p.id === id);

    if (!project) return;

    currentProject = project;

    currentProjectName.textContent =
        project.name;

    loadGrid(project.notes);

    homeScreen.classList.add("hidden");

    editorScreen.classList.remove("hidden");
}

/* ===================================
   EXCLUIR PROJETO
=================================== */

function deleteProject(id) {

    const confirmation =
        confirm("Excluir projeto?");

    if (!confirmation) return;

    let projects = getProjects();

    projects =
        projects.filter(
            project => project.id !== id
        );

    saveProjects(projects);

    renderProjects();
}

/* ===================================
   CARREGAR GRADE
=================================== */

function loadGrid(notes) {

    cells.forEach(cell => {

        cell.classList.remove("active");
    });

    cells.forEach(cell => {

        const note =
            cell.dataset.note;

        const step =
            Number(cell.dataset.step);

        const row =
            NOTES.indexOf(note);

        if (notes[row][step]) {

            cell.classList.add("active");
        }
    });
}

/* ===================================
   CLIQUE NAS CÉLULAS
=================================== */

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        if (!currentProject) return;

        const note =
            cell.dataset.note;

        const step =
            Number(cell.dataset.step);

        const row =
            NOTES.indexOf(note);

        currentProject.notes[row][step] =
            !currentProject.notes[row][step];

        cell.classList.toggle("active");

        /*
         * Parte 2:
         * tocarNota(note)
         */
    });
});

/* ===================================
   SALVAR PROJETO
=================================== */

saveBtn.addEventListener("click", () => {

    if (!currentProject) return;

    const projects = getProjects();

    const index =
        projects.findIndex(
            p => p.id === currentProject.id
        );

    if (index === -1) return;

    projects[index] = currentProject;

    saveProjects(projects);

    alert("Projeto salvo!");
});

/* ===================================
   VOLTAR
=================================== */

backBtn.addEventListener("click", () => {

    editorScreen.classList.add("hidden");

    homeScreen.classList.remove("hidden");

    currentProject = null;
});

/* ===================================
   INICIALIZAÇÃO
=================================== */

renderProjects();

/* ===================================
   ÁUDIO
=================================== */

const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

const audioContext =
    new AudioContextClass();

/* ===================================
   FREQUÊNCIAS DAS NOTAS
=================================== */

const frequencies = {

    C: 261.63, // Dó
    D: 293.66, // Ré
    E: 329.63, // Mi
    F: 349.23, // Fá
    G: 392.00, // Sol
    A: 440.00, // Lá
    B: 493.88  // Si

};

/* ===================================
   TOCAR NOTA
=================================== */

function playNote(note) {

    const frequency =
        frequencies[note];

    const oscillator =
        audioContext.createOscillator();

    const gainNode =
        audioContext.createGain();

    oscillator.type = "triangle";

    oscillator.frequency.value =
        frequency;

    gainNode.gain.setValueAtTime(
        0.2,
        audioContext.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.5
    );

    oscillator.connect(gainNode);

    gainNode.connect(
        audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.5
    );
}

/* ===================================
   SOM AO CLICAR NAS CÉLULAS
=================================== */

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        const note =
            cell.dataset.note;

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();
        }

        playNote(note);
    });
});

/* ===================================
   PLAYBACK
=================================== */

let currentStep = 0;

let playbackInterval = null;

/* ===================================
   LIMPAR COLUNAS
=================================== */

function clearPlayingColumns() {

    cells.forEach(cell => {

        cell.classList.remove("playing");
    });
}

/* ===================================
   DESTACAR COLUNA
=================================== */

function highlightColumn(step) {

    clearPlayingColumns();

    cells.forEach(cell => {

        if (
            Number(cell.dataset.step)
            === step
        ) {

            cell.classList.add("playing");
        }
    });
}

/* ===================================
   TOCAR COLUNA
=================================== */

function playStep(step) {

    NOTES.forEach((note, row) => {

        if (
            currentProject.notes[row][step]
        ) {

            playNote(note);
        }
    });

    highlightColumn(step);
}

/* ===================================
   PLAY
=================================== */

const playBtn =
    document.getElementById("play-btn");

playBtn.addEventListener("click", () => {

    if (!currentProject) return;

    if (playbackInterval) return;

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();
    }

    currentStep = 0;

    playbackInterval =
        setInterval(() => {

            playStep(currentStep);

            currentStep++;

            if (
                currentStep >=
                TOTAL_STEPS
            ) {

                currentStep = 0;
            }

        }, 300);
});

/* ===================================
   STOP
=================================== */

const stopBtn =
    document.getElementById("stop-btn");

stopBtn.addEventListener("click", stopPlayback);

function stopPlayback() {

    if (!playbackInterval) return;

    clearInterval(playbackInterval);

    playbackInterval = null;

    currentStep = 0;

    clearPlayingColumns();
}

/* ===================================
   PARAR AO SAIR
=================================== */

backBtn.addEventListener("click", () => {

    stopPlayback();
});

/* ===================================
   TECLA ESPAÇO
=================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            if (
                playbackInterval
            ) {

                stopPlayback();

            } else {

                playBtn.click();
            }
        }
    }
);
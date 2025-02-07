const terminal = document.getElementById("terminal");
const username = "user";
const hostname = "presentation-pc";
let mode = null;
let currentSlide = 0;
let slides = ["slide1.png", "slide2.png", "slide3.png"];

// Функция вывода текста в терминале
function print(text, newLine = true) {
    terminal.innerHTML += text + (newLine ? "\n" : "");
    terminal.scrollTop = terminal.scrollHeight;
}

// Имитация командной строки Linux
function getPrompt() {
    return `<span style="color:#6A9FB5">${username}@${hostname}</span>:<span style="color:#B5BD68">~</span>$ `;
}

// Запрос режима
function askMode() {
    print(getPrompt(), false);
    const input = document.createElement("input");
    input.spellcheck = false;
    terminal.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.remove();
            print(command);

            if (command === "pres --auto") {
                mode = "auto";
                startBuildProcess();
            } else if (command === "pres --manual") {
                mode = "manual";
                startBuildProcess();
            } else {
                print("bash: command not found: " + command);
                askMode();
            }
        }
    });
}

// Симуляция команд сборки
function startBuildProcess() {
    print(getPrompt() + "cmake -S llvm -B release/build -G Ninja -C release.cmake");
    setTimeout(() => {
        print(getPrompt() + "cmake --build release/build");
        setTimeout(() => {
            print(getPrompt() + "cmake --install release/build");
            setTimeout(() => {
                print("Build completed successfully!\n");
                if (mode === "auto") {
                    loadSlide();
                } else {
                    enableManualMode();
                }
            }, 1000);
        }, 1000);
    }, 1000);
}

// Загрузка слайда
function loadSlide() {
    if (currentSlide >= slides.length) {
        print("Presentation finished!");
        return;
    }

    print(getPrompt() + `cat slides/${slides[currentSlide]}`);

    // Удаляем предыдущие изображения, если они есть
    const oldSlide = document.querySelector(".slide-container");
    if (oldSlide) oldSlide.remove();

    // Создаём контейнер для изображения
    const slideContainer = document.createElement("div");
    slideContainer.classList.add("slide-container");

    const img = document.createElement("img");
    img.src = `slides/${slides[currentSlide]}`;
    img.alt = `Slide ${currentSlide + 1}`;

    slideContainer.appendChild(img);
    terminal.appendChild(slideContainer);

    if (mode === "auto") {
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            nextSlide();
        });
    }
}

// Переключение слайда
function nextSlide() {
    currentSlide++;
    loadSlide();
}

// Включение режима `manual`
function enableManualMode() {
    print(getPrompt(), false);
    const input = document.createElement("input");
    input.spellcheck = false;
    terminal.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.remove();
            print(command);

            if (command === "pres --help") {
                print("Available commands:");
                print("  - pres --goto slideX (go to slide X)");
                print("  - pres --exit (exit presentation)");
            } else if (command.startsWith("pres --goto")) {
                let slideNum = parseInt(command.split(" ")[1].replace("slide", ""));
                if (!isNaN(slideNum) && slideNum > 0 && slideNum <= slides.length) {
                    currentSlide = slideNum - 1;
                    loadSlide();
                } else {
                    print("Error: Invalid slide number.");
                }
            } else if (command === "pres --exit") {
                print("Exiting...");
            } else {
                print("bash: command not found: " + command);
            }

            enableManualMode();
        }
    });
}

// Запуск программы
askMode();
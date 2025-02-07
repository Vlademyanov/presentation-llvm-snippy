const terminal = document.getElementById("terminal");
const username = "user";
const hostname = "presentation-pc";
let mode = null;
let currentSlide = 0;
let slides = ["slide1.js", "slide2.js", "slide3.js"];

// Функция вывода текста в терминале
function print(text, newLine = true) {
    terminal.innerHTML += text + (newLine ? "\n" : "");
}

// Имитация командной строки Linux
function getPrompt() {
    return `<span style="color:#6A9FB5">${username}@${hostname}</span>:<span style="color:#B5BD68">~</span>$ `;
}

// Запрос режима
function askMode() {
    print(getPrompt(), false);
    const input = document.createElement("input");
    terminal.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.remove();

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

// Загрузка ASCII-слайда
function loadSlide() {
    if (currentSlide >= slides.length) {
        print("🎉 Presentation finished!");
        return;
    }

    print(getPrompt() + `cat slides/${slides[currentSlide]}`);
    import (`./slides/${slides[currentSlide]}`).then((module) => {
        print(module.renderSlide());
    });

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
    terminal.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.remove();

            if (command === "pres --help") {
                print("🔹 Available commands:");
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
                print("👋 Exiting...");
            } else {
                print("bash: command not found: " + command);
            }

            enableManualMode();
        }
    });
}

// Запуск программы
askMode();
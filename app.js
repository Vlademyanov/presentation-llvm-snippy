const terminal = document.getElementById("terminal");
const username = "user";
const hostname = "presentation-pc";
let mode = null; // 'auto' или 'manual'
let currentSlide = 0;
const slides = ["slide1.png", "slide2.png", "slide3.png", "slide4.png", "slide5.png", "slide6.png", "slide7.png"];

/** Функция для автоматической прокрутки терминала до самого низа */
function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
}

/** Функция для вывода текста в терминале.
 *  Каждый вызов добавляет строку в конец и вызывает scrollToBottom().
 */
function print(text, newLine = true) {
    terminal.innerHTML += text + (newLine ? "\n" : "");
    scrollToBottom();
}

/** Формирует приглашение (prompt) как в Linux */
function getPrompt() {
    return `<span style="color:#6A9FB5">${username}@${hostname}</span>:<span style="color:#B5BD68">~</span>$ `;
}

/** Запрос начальной команды (выбор режима) */
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
            print(command); // выводим введённую команду на той же строке
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

/** Имитация сборки (вывод команд cmake) */
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
                    // В авто-режиме ждём правого клика для перехода к следующему слайду
                    document.addEventListener("contextmenu", autoNextSlide);
                } else {
                    enableManualMode();
                }
            }, 1000);
        }, 1000);
    }, 1000);
}

/** Функция для вывода слайда.
 *  Сначала выводится строка с командой, затем – слайд (изображение).
 */
function loadSlide() {
    if (currentSlide >= slides.length) {
        print("Presentation finished!");
        return;
    }
    // Выводим команду для отображения слайда
    print(getPrompt() + `cat slides/${slides[currentSlide]}`);

    // Создаём контейнер для слайда (изображения)
    const slideContainer = document.createElement("div");
    slideContainer.classList.add("slide-container");
    const img = document.createElement("img");
    img.src = `slides/${slides[currentSlide]}`;
    img.alt = `Slide ${currentSlide + 1}`;
    slideContainer.appendChild(img);

    // Добавляем слайд в конец терминала
    terminal.appendChild(slideContainer);
    scrollToBottom();

    if (mode === "auto") {
        document.addEventListener("contextmenu", autoNextSlide);
        document.addEventListener("touchend", autoNextSlide);
    }
}

/** Обработчик правого клика для авто-режима:
 *  При ПКМ выводится новая строка (появляется команда), которая «выталкивает» слайд вверх.
 *  После чего вызывается следующий слайд.
 */
function autoNextSlide(e) {
    e.preventDefault();
    document.removeEventListener("contextmenu", autoNextSlide);
    document.removeEventListener("touchend", autoNextSlide);

    print(getPrompt());
    setTimeout(() => {
        currentSlide++;
        loadSlide();
    }, 300);
}
/** Ручной режим: вывод строки ввода для новых команд.
 *  Каждая новая команда добавляется в конец терминала, сдвигая старый вывод вверх.
 */
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
                print("Exiting...");
                return;
            } else {
                print("bash: command not found: " + command);
            }
            // После новой команды снова выводим приглашение,
            // при этом предыдущие строки (в том числе слайд) остаются выше и прокручиваются.
            enableManualMode();
        }
    });
}

// Запускаем программу
askMode();
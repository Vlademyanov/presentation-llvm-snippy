const terminal = document.getElementById("terminal");
let mode = null;
let currentSlide = 0;
let slides = ["slide1.js", "slide2.js", "slide3.js"];

// Функция для вывода текста в терминале
function print(text) {
    terminal.innerHTML += text + "\n";
}

// Запрос режима у пользователя
function askMode() {
    print("> Введите команду: pres --auto или pres --manual");
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
                print("❌ Ошибка: Неизвестная команда.");
                askMode();
            }
        }
    });
}

// Симуляция команд сборки
function startBuildProcess() {
    print("> cmake -S llvm -B release/build -G Ninja -C release.cmake");
    setTimeout(() => {
        print("> cmake --build release/build");
        setTimeout(() => {
            print("> cmake --install release/build");
            setTimeout(() => {
                print("✅ Сборка завершена!");
                if (mode === "auto") {
                    loadSlide();
                } else {
                    enableManualMode();
                }
            }, 1000);
        }, 1000);
    }, 1000);
}

// Загрузка слайдов
function loadSlide() {
    if (currentSlide >= slides.length) {
        print("🎉 Презентация завершена!");
        return;
    }

    print(`📄 Загрузка слайда ${currentSlide + 1}`);
    import (`./slides/${slides[currentSlide]}`).then((module) => {
        module.renderSlide();
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
    print("> Введите `pres --help` для списка команд");
    const input = document.createElement("input");
    terminal.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.remove();

            if (command === "pres --help") {
                print("🔹 Доступные команды:");
                print("  - pres --goto slideX (перейти к слайду X)");
                print("  - pres --exit (выйти из презентации)");
            } else if (command.startsWith("pres --goto")) {
                let slideNum = parseInt(command.split(" ")[1].replace("slide", ""));
                if (!isNaN(slideNum) && slideNum > 0 && slideNum <= slides.length) {
                    currentSlide = slideNum - 1;
                    loadSlide();
                } else {
                    print("❌ Ошибка: Неверный номер слайда.");
                }
            } else if (command === "pres --exit") {
                print("👋 Завершение...");
            } else {
                print("❌ Ошибка: Неизвестная команда.");
            }

            enableManualMode();
        }
    });
}

// Запуск программы
askMode();
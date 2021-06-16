const COLOR_BLACK = "#000000";
const COLOR_GREEN = "#00ff00";
const COLOR_LIGHT_GREY = "#F5F5F5";
const COLOR_WHITE = "#FFFFFF";
const COLOR_BORDER = "#eeeeee";
const COLOR_PRIMARY = "#1e88e5";
const COLOR_PRIMRAY_LIGHT = "#6ab7ff";
const COLOR_PRIMARY_DARK = "#005cb2";
const COLOR_SECONDARY = "#e57b1e";
const COLOR_SECONDARY_LIGHT = "#ffab50";
const COLOR_SECONDARY_DARK = "#ad4d00";

const CELL_DEFAULT_BACKGROUND_COLOR = COLOR_WHITE;

const GAME_WIDTH_PX = 600;

let grid;
let baseColors;
let colorTransitions;
let colorSetting = "rainbow";
let customColor = COLOR_GREEN;
let size = 16;
let maxSize = 100;

// body

const body = document.querySelector("body");
body.style.backgroundColor = COLOR_PRIMARY;

body.style.display = "flex";
body.style.flexFlow = "column nowrap";

// buttons

const buttonContainer = document.getElementById("button-container");
buttonContainer.style.width = 2.0 * GAME_WIDTH_PX + "px";

const buttons = document.querySelectorAll(".button");
buttons.forEach((button) => {
    button.style.backgroundColor = COLOR_SECONDARY;
    button.style.border = "1px solid " + COLOR_SECONDARY;
});

const colorButtons = document.querySelectorAll(".color-button");
colorButtons.forEach((colorButton) => {
    colorButton.addEventListener("click", (event) => {
        console.log("setting color: " + event.target.dataset.color);
        colorSetting = event.target.dataset.color;
    });
});

const colorSelector = document.querySelector("#color-selector");
colorSelector.value = COLOR_GREEN;
colorSelector.addEventListener("input", changeCustomColor);
colorSelector.addEventListener("change", changeCustomColor);

function changeCustomColor(event) {
    console.log(
        "setting color: " +
            event.target.dataset.color +
            ", " +
            event.target.value
    );
    colorSetting = event.target.dataset.color;
    customColor = event.target.value;
}

const resetButton = document.querySelector(".reset-button");
resetButton.onclick = function () {
    resetGame();
};

// size

const sizeContainer = document.getElementById("size-container");
sizeContainer.style.width = 0.8 * GAME_WIDTH_PX + "px";

const sizeSlider = document.getElementById("size-slider");
sizeSlider.max = maxSize;
sizeSlider.value = size;
sizeSlider.oninput = function () {
    size = sizeSlider.value;
    sizeText.value = size;
    resetGame();
};

sizeContainer.appendChild(sizeSlider);

const sizeText = document.createElement("input");
sizeText.id = "size-text";
sizeText.type = "text";
sizeText.value = size;
sizeText.oninput = function () {
    size = sizeSlider.value;
    sizeSlider.value = size;
    resetGame();
};
sizeText.style.textAlign = "right";
sizeText.style.width = "50px";

sizeText.style.margin = "1rem";

sizeContainer.appendChild(sizeText);

// game container

const gameContainer = document.getElementById("game-container");
gameContainer.style.height = GAME_WIDTH_PX + "px";
gameContainer.style.width = GAME_WIDTH_PX + "px";

// game

function createGame(size) {
    grid = [];
    baseColors = [];
    colorTransitions = [];

    createGrid(size);
}

createGame(size);

// functions

function createGrid(n) {
    for (let row = 0; row < n; row++) {
        grid[row] = [];
        baseColors[row] = [];
        colorTransitions[row] = [];
        for (let col = 0; col < n; col++) {
            grid[row][col] = document.createElement("div");
            grid[row][col].id = row + "," + col;

            gameContainer.appendChild(grid[row][col]);
        }
    }

    forEachCell(setupCell);
}

function setupCell(cell) {
    let row = cell.id.match("^\\d+");
    let col = cell.id.match("\\d+$");

    cell.style.boxSizing = "border-box";
    cell.style.border = "1px solid " + COLOR_BORDER;
    cell.style.height = 100 / size + "%";
    cell.style.width = 100 / size + "%";
    cell.style.flex = "0 0 " + maxSize / size;
    cell.style.fontSize = "0.5rem";
    cell.style.backgroundColor = CELL_DEFAULT_BACKGROUND_COLOR;
    baseColors[row][col] = CELL_DEFAULT_BACKGROUND_COLOR;

    cell.style.display = "flex";
    cell.style.justifyContent = "center";
    cell.style.alignItems = "center";

    cell.addEventListener("mouseover", (e) => {
        if (
            colorSetting == "eraser" ||
            baseColors[row][col] == CELL_DEFAULT_BACKGROUND_COLOR
        ) {
            baseColors[row][col] = getColor();
            cell.style.backgroundColor = baseColors[row][col];
            colorTransitions[row][col] = 0; // js has float precision issue so use ints
        } else if (colorTransitions[row][col] == 100) {
            // do nothing
        } else {
            colorTransitions[row][col] += 10;
            cell.style.backgroundColor = getTransitionToBlack(
                baseColors[row][col],
                colorTransitions[row][col] / 100
            );
        }

        // let regexPrefix = '^rgba\\(';
        // let regexColor =  '(\\d+\\, \\d+\\, \\d+)';
        // let regexComma = '(\\, )?';
        // let regexOpacity = '(\\d*\\.\?\\d*)\\)?';
        // let regexSuffix = '\\)$';
        // rgba_matches = cell.style.backgroundColor.match(regexPrefix + regexColor + regexComma + regexOpacity + regexSuffix);
        // color = rgba_matches[1]
        // opacity = rgba_matches == null ? 1234 : rgba_matches[3];
    });
}

function resetGame() {
    forEachCell(function (cell) {
        cell.remove();
    });

    createGame(size);
}

function forEachCell(func) {
    grid.forEach((row) => {
        row.forEach((cell) => {
            func(cell);
        });
    });
}

function getColor() {
    switch (colorSetting) {
        case "black":
            return COLOR_BLACK;
        case "grey":
            return COLOR_LIGHT_GREY;
        case "rainbow":
            return getRandHexColor("88", "FF");
        case "eraser":
            return COLOR_WHITE;
        case "custom":
            return customColor;
        default:
            return COLOR_LIGHT_GREY;
    }
}

function getTransitionToBlack(colorHex, transition) {
    colorInts = hexToRgbColor(colorHex);
    original = [...colorInts];

    colorInts.forEach((element, index, colorInts) => {
        colorInts[index] = Math.floor(element * (1 - transition));
    });

    return rgbToHexColor(colorInts[0], colorInts[1], colorInts[2]);
}

function getRandHexColor(min = "00", max = "FF") {
    let hexColor = "#";
    for (let i = 0; i < 3; i++) {
        colorInt = randInt(hexToInt(min), hexToInt(max));
        hexColor += intToHex(colorInt);
    }
    console.assert(hexColor.length == 7);
    return hexColor;
}

function getRandRgbColor(min = 0, max = 255) {
    return (
        "rgba(" +
        randInt(0, 255) +
        "," +
        randInt(0, 255) +
        "," +
        randInt(0, 255) +
        ")"
    );
}

function hexToRgbColor(hex) {
    rInt = hexToInt(hex.slice(1, 3));
    gInt = hexToInt(hex.slice(3, 5));
    bInt = hexToInt(hex.slice(5, 7));

    return [rInt, gInt, bInt];
}

function rgbToHexColor(r, g, b) {
    return "#" + intToHex(r) + intToHex(g) + intToHex(b);
}

function intToHex(i, places = 2) {
    return Math.round(i).toString(16).padStart(places, "0");
}

function hexToInt(hex) {
    return parseInt(hex, 16);
}

function randInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

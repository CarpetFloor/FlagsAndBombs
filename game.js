let debug = false;

/**
 * prevent right click menu from showing up when clicking anything other than tiles, 
 * this way in case space in between tiles is right-clicked the menu won't show up
 */
document.body.addEventListener("contextmenu", function(e){e.preventDefault();});

const bg = "#203555";
const tileColor = "#284877";
const highlightColor = "#31568d";
let tableElem = document.querySelector("table");
let div = document.querySelector("div");
let gameOverContainer = document.querySelector("section");

const cols = 10;
const rows = cols;
let tileSize = 50;
const totalBombs = Math.round(cols * 1.75);
const bombChance = Math.round(((cols * rows) / totalBombs) * 2);
let bombCount = 0;

let mobile = (Math.max(window.innerWidth, window.innerHeight) < 1000);
if(mobile) {
    let portrait = (window.innerHeight > window.innerWidth);
    document.getElementsByClassName("gameOverContainer")[0].style.marginTop = "7.75em";
    
    if(portrait) {
        tileSize = Math.floor(window.innerWidth / (cols * 1.5));
    }
    else {
        tileSize = Math.floor(window.innerHeight / (cols * 1.5));
        tableElem.style.marginTop = "1em";
    }
}

// -1: empty
// 9: bomb
// n: game value
const game = [];

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// generate html
for(let row = 0; row < rows; row++) {
    let rowElem = document.createElement("tr");
    
    for(let col = 0; col < cols; col++) {
        let tileElem = document.createElement("td");
        tileElem.id = row + "," + col;
        tileElem.style.width = tileSize + "px";
        tileElem.style.height = tileSize + "px";
        tileElem.style.border = "2px solid " + bg;

        if(!(mobile)) {
            tileElem.addEventListener("click", function(){clickTile(tileElem);});
            tileElem.addEventListener("contextmenu", function(e){flagTile(e, tileElem);});

            tileElem.addEventListener("mouseenter", function(){
                hoverTile(tileElem);
            });
            tileElem.addEventListener("mouseleave", function(){
                unHoverTile(tileElem);
            });
        }
        else {
            tileElem.addEventListener("touchstart", function(){press(tileElem);});
            tileElem.addEventListener("touchend", function(){release(tileElem);});
        }

        rowElem.appendChild(tileElem);
    }

    tableElem.appendChild(rowElem);
}

function hoverTile(tileElem) {
    let split = tileElem.id.split(",");
    let row = parseInt(split[0]);
    let col = parseInt(split[1]);

    let valid = (tileElem.innerHTML.length == 0);

    if(valid && !(revealedHas(row, col))) {
        tileElem.style.cursor = "pointer";
        tileElem.style.backgroundColor = highlightColor;
    }
    else {
        tileElem.style.cursor = "auto";
    }
}

function unHoverTile(tileElem) {
    let split = tileElem.id.split(",");
    let row = parseInt(split[0]);
    let col = parseInt(split[1]);

    if(!(revealedHas(row, col))) {
        tileElem.style.cursor = "auto";
        tileElem.style.backgroundColor = tileColor;
    }
}

function fillBombs() {
    let i = 0;
    let iteration = 0;
    
    while(bombCount < totalBombs) {
        for(let row = 0; row < rows; row++) {
            let rowData = [];
            
            for(let col = 0; col < cols; col++) {
                ++i;
                let tileElem = getTileElem(row, col);

                if((bombCount < totalBombs) && ((row != startRow) && (col != startCol))) {
                    let placeBombCheck = random(1, bombChance);
                    
                    if(placeBombCheck == 1) {
                        if(iteration == 0) {
                            ++bombCount;
                            rowData.push(0);
                        }
                        else if(game[row][col] != 0) {
                            ++bombCount;
                            game[row][col] = 0;
                        }
                    }
                    else {
                        rowData.push(-1);
                    }
                }
                else {
                    rowData.push(-1);
                }

            }

            if(iteration == 0) {
                game.push(rowData);
            }
        }

        ++iteration;
    }
}

function getAdjacentBombs(row, col) {
    let count = 0;

    let rowChecks = [0];
    if(row > 0) {
        rowChecks.push(-1);
    }
    if(row < rows - 1) {
        rowChecks.push(1);
    }

    let colChecks = [0];
    if(col > 0) {
        colChecks.push(-1);
    }
    if(col < cols - 1) {
        colChecks.push(1);
    }

    for(let r = 0; r < rowChecks.length; r++) {
        for(let c = 0; c < colChecks.length; c++) {
            if(!(rowChecks[r] == 0 && colChecks[c] == 0)) {
                if(game[row + rowChecks[r]][col + colChecks[c]] == 0) {
                    ++count;
                }
            }
        }
    }

    return (count == 0) ? -1 : count;
}

let startRow = -1;
let startCol = -1;

// left click
function clickTile(tileElem) {
    let split = tileElem.id.split(",");
    let row = parseInt(split[0]);
    let col = parseInt(split[1]);

    // ensure firest tile clicked is not a bomb
    if(bombCount == 0) {
        startRow = row;
        startCol = col;
        
        fillBombs();
    }

    // reveal tile
    
    // don't allow clicking if there is a flag
    if(!(flagAt(row, col))) {
        // bomb
        if(game[row][col] == 0) {
            let imgElem = document.createElement("img");
            imgElem.src = "Assets/bomb_1.png";
            
            tileElem.appendChild(imgElem);
            imgElem.setAttribute("draggable", false);

            gameOver();
        }
        else {
            // flag

            // calling this function also reveals all other non-number tiles
            let count = getAdjacentBombs(row, col);
            if(count == -1) {
                tileElem.style.backgroundColor = bg;
                tileElem.style.cursor = "auto";

                // recursively reveal adjacent non-number tiles
                revealed.push([row, col]);
                revealAdjacents(row, col);
            }
            // number
            else {
                tileElem.innerText = count;

                // remove hover effect
                tileElem.style.backgroundColor = tileColor;
                tileElem.style.cursor = "auto";
            }
        }
    }
}

let revealed = [];
const offsets = new Map();
offsets.set("up", [-1, 0]);
offsets.set("down", [1, 0]);
offsets.set("left", [0, -1]);
offsets.set("right", [0, 1]);
// recursively reveal adjacent non-number tiles
function revealAdjacents(row, col) {
    let tocheck = [];
    
    if(row > 0) {
        tocheck.push("up");
    }
    if(row < rows - 1) {
        tocheck.push("down");
    }

    if(col > 0) {
        tocheck.push("left");
    }
    if(col < cols - 1) {
        tocheck.push("right");
    }

    for(let c of tocheck) {
        let rcheck = row + offsets.get(c)[0];
        let ccheck = col + offsets.get(c)[1];
    
        if(
        !(revealedHas(rcheck, ccheck)) && 
        (getAdjacentBombs(rcheck, ccheck) == -1)) {
            let tileElem = getTileElem(rcheck, ccheck);
            tileElem.style.backgroundColor = bg;

            // remove flag if there is one
            if(flagAt(rcheck, ccheck)) {
                tileElem.innerHTML = "";
            }

            revealed.push([rcheck, ccheck]);
    
            revealAdjacents(rcheck, ccheck);
        }
        else if(getAdjacentBombs(rcheck, ccheck) != -1) {
            getTileElem(rcheck, ccheck).innerText = getAdjacentBombs(rcheck, ccheck);
        }
    }
}

function revealedHas(row, col) {
    for(let i = 0; i < revealed.length; i++) {
        if(revealed[i][0] == row && revealed[i][1] == col) {
            return true;
        }
    }

    return false;
}

function removeFlagAt(row, col) {
    for(let i = 0; i < flags.length; i++) {
        if(flags[i][0] == row && flags[i][1] == col) {
            flags.splice(i, 1);
            
            break;
        }
    }
}

let flags = [];
function flagAt(row, col) {
    for(let i = 0; i < flags.length; i++) {
        if(flags[i][0] == row && flags[i][1] == col) {
            return true;
        }
    }

    return false;
}

// right click
function flagTile(e, tileElem) {
    if(e != null) {
        e.preventDefault();
    }

    let split = tileElem.id.split(",");
    let row = parseInt(split[0]);
    let col = parseInt(split[1]);

    
    // only allow placing a flag on a non-number tile and a non-revealed tile
    let valid = (tileElem.innerHTML.length == 0) || ((tileElem.innerHTML.length != 0) && flagAt(row, col));
    let alreadyRevealed = revealedHas(row, col);
    
    if(valid && !(alreadyRevealed)) {
        // remove flag
        if(flagAt(row, col)) {
            removeFlagAt(row, col);

            tileElem.innerHTML = "";
        }
        // place flag
        else {
            flags.push([row, col]);
            
            let imgElem = document.createElement("img");
            imgElem.src = "Assets/flag_1.png";
            imgElem.setAttribute("draggable", false);
            
            tileElem.appendChild(imgElem);

            // remove hover effect when placing flag
            tileElem.style.backgroundColor = tileColor;
            tileElem.style.cursor = "auto";
        }
    }
}

// mobile controls
let pressStart;
let waitingForRelease = false;
const holdTime = 250;

function press(tileElem) {
    waitingForRelease = true;
    pressStart = new Date();

    window.setTimeout(function() {
        if(waitingForRelease) {
            waitingForRelease = false;
            flagTile(null, tileElem);
        }
    }, holdTime);
}

function release(tileElem) {
    if(waitingForRelease) {
        waitingForRelease = false;
        let pressEnd = new Date();
        let diff = pressEnd - pressStart;
        
        if(diff < holdTime) {
            clickTile(tileElem);
        }
        else {
            flagTile(null, tileElem);
        }
    }
}

function getTileElem(row, col) {
    return tableElem.children[row].children[col];
}

function gameOver() {
    div.style.display = "flex";
    gameOverContainer.style.display = "flex";
}

function restart() {
    revealed = [];
    flags = [];
    bombCount = 0;

    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            game[r][c] = -1;

            let tileElem = getTileElem(r, c);
            tileElem.innerHTML = "";
            tileElem.style.backgroundColor = "#284877";
        }
    }

    fillBombs();
    
    gameOverContainer.style.display = "none";
    div.style.display = "none";
}
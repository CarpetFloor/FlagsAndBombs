let debug = false;

/**
 * prevent right click menu from showing up when clicking anything other than tiles, 
 * this way in case space in between tiles is right-clicked the menu won't show up
 */
document.body.addEventListener("contextmenu", function(e){e.preventDefault();});

const bg = "#203555";
let tableElem = document.querySelector("table");

const cols = 10;
const rows = cols;
const tileSize = 50;
const totalBombs = Math.floor(cols * 1.5);
const bombChance = Math.round(((cols * rows) / totalBombs) * 2);
let bombCount = 0;

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

        tileElem.addEventListener("click", function(){clickTile(tileElem);});
        tileElem.addEventListener("contextmenu", function(e){flagTile(e, tileElem);});

        rowElem.appendChild(tileElem);
    }

    tableElem.appendChild(rowElem);
}

function fillBombs() {
    let i = 0;
    let iteration = 0;
    
    while(bombCount < totalBombs) {
        // console.log("ITERATION", iteration);

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
                            // console.log(i + ": placed bomb " + bombCount + " at " + tileElem.id);
                        }
                        else if(game[row][col] != 0) {
                            ++bombCount;
                            game[row][col] = 0;
                            // console.log(i + ": placed bomb " + bombCount + " at " + tileElem.id);
                        }
                        /*
                        else {
                            console.log(i + ": attempt fail");    
                        }
                        */
        
                    }
                    else {
                        rowData.push(-1);
                        // console.log(i + ": attempt fail");
                    }
                }
                else {
                    rowData.push(-1);
                    // console.log(i + ": no attempt");
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
    
    // console.log("click at:", row, col);

    // ensure firest tile clicked is not a bomb
    if(bombCount == 0) {
        startRow = row;
        startCol = col;
        
        fillBombs();

        // console.log("GAME");
        // console.log(game);
        // console.log("_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_");
 
        debug = false;
        if(debug) {
            for(let r = 0; r < rows; r++) {
                for(let c = 0; c < cols; c++) {
                    let color = "grey";
                    if(game[r][c] == 0) {
                        color = "red";
                    }
                    getTileElem(r, c).innerHTML += 
                    "<span style='font-size: 11px; color: " + color + ";'>" + 
                    getAdjacentBombs(r, c) + 
                    " (" + r + ", " + c + ")</span>";
                }
            }
        }
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
        }
        else {
            // calling this function also reveals all other non-number tiles
            let count = getAdjacentBombs(row, col);
            if(count == -1) {
                tileElem.style.backgroundColor = bg;

                // recursively reveal adjacent non-number tiles
                revealAdjacents(row, col);
            }
            else {
                tileElem.innerText = count;
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
    
    // console.log("--", row, col, "--");
    // console.log(tocheck);

    for(let c of tocheck) {
        let rcheck = row + offsets.get(c)[0];
        let ccheck = col + offsets.get(c)[1];

        // console.log(rcheck, ccheck);
    
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
    e.preventDefault();

    let split = tileElem.id.split(",");
    let row = parseInt(split[0]);
    let col = parseInt(split[1]);

    // console.log("flag at:", row, col);
    
    // only allow placing a flag on a non-number tile and a non-revealed tile
    let valid = (tileElem.innerHTML.length == 0) || ((tileElem.innerHTML.length != 0) && flagAt(row, col));
    let alreadyRevealed = revealedHas(row, col);
    
    if(valid && !(alreadyRevealed)) {
        if(flagAt(row, col)) {
            removeFlagAt(row, col);

            tileElem.innerHTML = "";
        }
        else {
            flags.push([row, col]);

            let imgElem = document.createElement("img");
            imgElem.src = "Assets/flag_1.png";
            imgElem.setAttribute("draggable", false);

            tileElem.appendChild(imgElem);
        }
    }
}

function getTileElem(row, col) {
    return tableElem.children[row].children[col];
}
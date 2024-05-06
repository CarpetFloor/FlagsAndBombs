let debug = false;

const bg = "#203555";
let tableElem = document.querySelector("table");

const cols = 10;
const rows = 10;
const tileSize = 50;
const totalBombs = 8;
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
    
    // fill bombs
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
                            
                            let imgElem = document.createElement("img");
                            imgElem.src = "Assets/bomb_1.png";
                            
                            tileElem.appendChild(imgElem);
                            // console.log(i + ": placed bomb " + bombCount + " at " + tileElem.id);
                        }
                        else if(game[row][col] != 0) {
                            ++bombCount;
                            game[row][col] = 0;
                            
                            let imgElem = document.createElement("img");
                            imgElem.src = "Assets/bomb_1.png";
                            
                            tileElem.appendChild(imgElem);
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

    // generate numbers
    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            if(game[row][col] != 0) {
                getTileElem(row, col).innerText = getAdjacentBombs(row, col);
            }
        }
    }
}

function getAdjacentBombs(row, col) {
    let count = 0;

    let rowChecks = [0];
    if(row != 0) {
        rowChecks.push(-1);
    }
    if(row != rows - 1) {
        rowChecks.push(1);
    }

    let colChecks = [0];
    if(col != 0) {
        colChecks.push(-1);
    }
    if(col != col - 1) {
        colChecks.push(1);
    }

    for(let r = 0; r < rowChecks.length; r++) {
        for(let c = 0; c < colChecks.length; c++) {
            if(!(rowChecks[r] == 0 && colChecks[c] == 0)) {
                if(debug) {
                    console.log(
                        "CHECKING " + 
                        (row + rowChecks[r]) + "," + (col + colChecks[c]) + 
                        "(" + rowChecks[r] + "," + colChecks[c] + ") : " + 
                        game[row + rowChecks[r]][col + colChecks[c]] + " " + 
                        (game[row + rowChecks[r]][col + colChecks[c]] == 0)
                    );
                }
                if(game[row + rowChecks[r]][col + colChecks[c]] == 0) {
                    ++count;
                }
            }
        }
    }

    return (count == 0) ? -1 : count;
}

console.log(game);

if(debug) {
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            getTileElem(r, c).innerHTML += "<span style='font-size: 11px; color: grey;'>(" + r + ", " + c + ")</span>";
        }
    }
}

let startRow = -1;
let startCol = -1;
function clickTile(tileElem) {
    console.log("click at:", tileElem.id);

    // ensure firest tile clicked is not a bomb
    if(bombCount == 0) {
        let split = tileElem.id.split(",");
        startRow = parseInt(split[0]);
        startCol = parseInt(split[1]);
        
        fillBombs();
    }
}

function flagTile(e, tileElem) {
    e.preventDefault();
    console.log("flag at:", tileElem.id);
}

function getTileElem(row, col) {
    return tableElem.children[row].children[col];
}
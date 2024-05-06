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

// fill bombs
let i = 0;
let iteration = 0;
while(bombCount < totalBombs) {
    console.log("ITERATION", iteration);

    for(let row = 0; row < rows; row++) {
        let rowData = [];
        
        for(let col = 0; col < cols; col++) {
            ++i;
            let tileElem = getTileElem(row, col);

            if(bombCount < totalBombs) {
                let placeBombCheck = random(1, bombChance);
                
                if(placeBombCheck == 1) {
                    if(iteration == 0) {
                        rowData.push(0);
                    }
                    else if(game[row][col] != 0) {
                        ++bombCount;
                        game[row][col] = 0;
                        console.log(i + ": placed bomb " + bombCount + " at " + tileElem.id);
                        
                        // html
                        let imgElem = document.createElement("img");
                        imgElem.src = "Assets/bomb_1.png";
        
                        tileElem.appendChild(imgElem);
                    }
                    else {
                        console.log(i + ": attempt fail");    
                    }
    
                }
                else {
                    rowData.push([-1]);
                    console.log(i + ": attempt fail");
                }
            }
            else {
                rowData.push([-1]);
                console.log(i + ": no attempt");
            }

        }

        if(iteration == 0) {
            game.push(rowData);
        }
    }

    ++iteration;
}

console.log(game);

function clickTile(tileElem) {
    console.log("click at:", tileElem.id);
}

function flagTile(e, tileElem) {
    e.preventDefault();
    console.log("flag at:", tileElem.id);
}

function getTileElem(row, col) {
    return tableElem.children[row].children[col];
}
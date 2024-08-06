let counter = 1;
let scores = {
    player1: {
        name: "player1",
    },
    player2: {
        name: "player2",
    },
    player3: {
        name: "player3",
    },
}
const keys = Object.keys(scores);

window.onload = function () {
    const popup = document.getElementById("init");
    popup.showModal();
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    document.body.appendChild(backdrop);
};

function prevGame() {
    const initailScores = JSON.parse(localStorage.getItem('scores3'));
    if (!initailScores) {
        alert("前回のゲームデータがありません");
        return;
    }
    const popup = document.getElementById("init");
    popup.close();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
    }
    const table = document.getElementById('table');
    const lastRow = table.rows[table.rows.length - 1];
    scores = initailScores;
    for (let i = 1; i <= keys.length; i++) {
        const playerName = scores[`player${i}`].name;
        const elems = document.getElementsByClassName(`p${i}`);
        for (let i = 0; i < elems.length; i++) {
            elems[i].firstChild.textContent = playerName;
        }
    }
    for (let subKey in initailScores[keys[0]]) {
        const tr = document.createElement('tr');
        for (let i = 0; i <= keys.length; i++) {
            if (subKey === 'name') {
                continue;
            }
            const td = document.createElement('td');
            if (i !== 0) {
                td.innerHTML = `<div>${initailScores[keys[i - 1]][subKey].calcScore}</div><div>(${initailScores[keys[i - 1]][subKey].score})</div>`;
            } else {
                if (subKey !== 'chip') {
                    td.innerHTML = `${subKey}半荘目 <button onclick="deleteRow(this)">削除</button>`;
                    tr.id = `row${subKey}`;
                    counter = parseInt(subKey) + 1;
                } else {
                    td.innerHTML = `チップ <button onclick="deleteRow(this)">削除</button>`;
                    tr.id = "chipTr";
                }
            }
            tr.appendChild(td);
        }
        lastRow.parentNode.insertBefore(tr, lastRow);
    }
    updateScore();
}

function closePopup() {
    const popup = document.getElementById("init");
    popup.close();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
    }
    localStorage.clear();
    for (let i = 1; i <= keys.length; i++) {
        const playerName = document.getElementById(`player${i}`).value;
        if (playerName !== "") {
            const elems = document.getElementsByClassName(`p${i}`);
            scores[`player${i}`].name = playerName;
            for (let i = 0; i < elems.length; i++) {
                elems[i].firstChild.textContent = playerName;
            }
        }
    }

    memory();
}

function addChip() {
    for (let i = 1; i <= keys.length; i++) {
        if (!document.getElementById(`chip${i}`).value) {
            alert("チップを全員分入力してください");
            return;
        }
    }
    const chipSelectElement = document.querySelector('#chip');
    const chip = parseInt(chipSelectElement.options[chipSelectElement.selectedIndex].value);

    const prevChip = document.getElementById('chipTr');
    if (prevChip) {
        prevChip.remove();
    }

    const table = document.getElementById('table');
    const lastRow = table.rows[table.rows.length - 1];
    const tr = document.createElement('tr');
    tr.id = "chipTr";

    for (let i = 0; i <= keys.length; i++) {
        const td = document.createElement('td');
        if (document.getElementById(`score${i}`)) {
            const chipNum = parseInt(document.getElementById(`chip${i}`).value)
            const chipScore = chipNum * chip;
            scores[keys[i - 1]]['chip'] = {
                score: chipNum + "枚",
                calcScore: chipScore,
            };
            td.innerHTML = `<div>${chipScore}</div><div>(${chipNum + "枚"})</div>`;
        } else {
            td.innerHTML = `チップ <button onclick="deleteRow(this)">削除</button>`;
        }
        tr.appendChild(td);
    }

    lastRow.parentNode.insertBefore(tr, lastRow);
    updateScore();
}

function addScore() {
    for (let i = 1; i <= keys.length; i++) {
        if (!document.getElementById(`score${i}`).value) {
            alert("スコアを全員分入力してください");
            return;
        }
    }
    const umaSelectElement = document.querySelector('#uma');
    const umaType = umaSelectElement.options[umaSelectElement.selectedIndex].value;
    const [uma1, uma2] = umaType.split("-").map(Number).map(num => num * 1000);
    const table = document.getElementById('table');
    const lastRow = table.rows[table.rows.length - 1];
    const tr = document.createElement('tr');
    tr.id = `row${counter}`;
    let score = [];
    for (let i = 1; i <= keys.length; i++) {
        score.push(parseInt(document.getElementById(`score${i}`).value));
    }
    let calcScore = [0, 0, 0];
    let temp = [...score];
    const firstMaxIndex = temp.indexOf(Math.max(...temp));
    temp[firstMaxIndex] = -1000000;
    const secondMaxIndex = temp.indexOf(Math.max(...temp));
    temp[secondMaxIndex] = -1000000;
    const thirdMaxIndex = temp.indexOf(Math.max(...temp));
    calcScore[thirdMaxIndex] = Math.round((score[thirdMaxIndex] - uma2) / 1000) - 40;
    calcScore[secondMaxIndex] = Math.round((score[secondMaxIndex] - uma1) / 1000) - 40;
    calcScore[firstMaxIndex] = -calcScore[thirdMaxIndex] - calcScore[secondMaxIndex];
    scores[keys[firstMaxIndex]][counter] = {
        score: score[firstMaxIndex],
        calcScore: calcScore[firstMaxIndex],
    }
    scores[keys[secondMaxIndex]][counter] = {
        score: score[secondMaxIndex],
        calcScore: calcScore[secondMaxIndex],
    }
    scores[keys[thirdMaxIndex]][counter] = {
        score: score[thirdMaxIndex],
        calcScore: calcScore[thirdMaxIndex],
    }
    for (let i = 0; i <= keys.length; i++) {
        const td = document.createElement('td');
        if (document.getElementById(`score${i}`)) {
            td.innerHTML = `<div>${calcScore.shift()}</div><div>(${score.shift()})</div>`;
        } else {
            td.innerHTML = `${counter}半荘目 <button onclick="deleteRow(this)">削除</button>`;
            counter++;
        }
        tr.appendChild(td);
    }
    lastRow.parentNode.insertBefore(tr, lastRow);
    updateScore();
    for (let i = 1; i <= keys.length; i++) {
        document.getElementById(`score${i}`).value = null;
    }
}

function deleteRow(button) {
    const tr = button.parentNode.parentNode;
    function extractNumber(str) {
        let match = str.match(/\d+/);
        return match ? Number(match[0]) : "chip";
    }
    const dict = extractNumber(tr.id);
    for (let i = 1; i <= keys.length; i++) {
        const key = keys[i - 1];
        delete scores[key][dict];
    }
    updateScore();
    tr.parentNode.removeChild(tr);
}

function updateScore() {
    const table = document.getElementById('table');
    const sumRow = table.rows[table.rows.length - 1];
    for (let i = 1; i <= keys.length; i++) {
        let total = 0;
        for (let key in scores[keys[i - 1]]) {
            if (scores[keys[i - 1]][key].calcScore) {
                total += parseInt(scores[keys[i - 1]][key].calcScore);
            }
        }
        sumRow.children[i].textContent = total;
    }
    memory();
}

function memory() {
    const jsonScores = JSON.stringify(scores);
    localStorage.setItem('scores3', jsonScores);
}
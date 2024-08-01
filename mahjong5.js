let counter = 1;
let scores = {
    かんまち: {},
    かねます: {},
    えちごや: {},
    ひろや: {},
    さがさ: {},
}
const keys = Object.keys(scores);

window.onload = function () {
    const table = document.getElementById('table');
    const lastRow = table.rows[table.rows.length - 1];
    const initailScores = JSON.parse(localStorage.getItem('scores'));
    if (initailScores) {
        scores = initailScores;
        for (let subKey in initailScores["かんまち"]) {
            const tr = document.createElement('tr');
            for (let i = 0; i < 6; i++) {
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
    }
    updateScore();
};

function addChip() {
    for (let i = 1; i < 6; i++) {
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

    for (let i = 0; i < 6; i++) {
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
    let exclusion;
    for (let i = 1; i < 6; i++) {
        if (!document.getElementById(`score${i}`).value) {
            alert("スコアを全員分入力してください");
            return;
        } else if (document.getElementById(`score${i}`).value == -1) {
            exclusion = i;
        }
    }
    if (exclusion === undefined) {
        alert("不参加者を選択してください");
        return;
    }
    const umaSelectElement = document.querySelector('#uma');
    const umaType = umaSelectElement.options[umaSelectElement.selectedIndex].value;
    const [uma1, uma2] = umaType.split("-").map(Number).map(num => num * 1000);
    const table = document.getElementById('table');
    const lastRow = table.rows[table.rows.length - 1];
    const tr = document.createElement('tr');
    tr.id = `row${counter}`;
    let score = [];
    for (let i = 1; i < 6; i++) {
        if (i == exclusion) score.push(-1000000);
        else score.push(parseInt(document.getElementById(`score${i}`).value));
    }
    let calcScore = [0, 0, 0, 0, 0];
    let temp = [...score];
    const firstMaxIndex = temp.indexOf(Math.max(...temp));
    temp[firstMaxIndex] = -1000000;
    const secondMaxIndex = temp.indexOf(Math.max(...temp));
    temp[secondMaxIndex] = -1000000;
    const thirdMaxIndex = temp.indexOf(Math.max(...temp));
    temp[thirdMaxIndex] = -1000000;
    const fourthMaxIndex = temp.indexOf(Math.max(...temp));
    calcScore[fourthMaxIndex] = Math.round((score[fourthMaxIndex] - uma2) / 1000) - 30;
    calcScore[thirdMaxIndex] = Math.round((score[thirdMaxIndex] - uma1) / 1000) - 30;
    calcScore[secondMaxIndex] = Math.round((score[secondMaxIndex] + uma1) / 1000) - 30;
    calcScore[firstMaxIndex] = -calcScore[fourthMaxIndex] - calcScore[thirdMaxIndex] - calcScore[secondMaxIndex];
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
    scores[keys[fourthMaxIndex]][counter] = {
        score: score[fourthMaxIndex],
        calcScore: calcScore[fourthMaxIndex],
    }
    scores[keys[exclusion - 1]][counter] = {
        score: "欠",
        calcScore: 0,
    }
    for (let i = 0; i < 6; i++) {
        const td = document.createElement('td');
        if (document.getElementById(`score${i}`)) {
            if (i == exclusion) {
                td.innerHTML = `<div>0</div><div>(欠)</div>`;
                calcScore.shift();
                score.shift();
            } else {
                td.innerHTML = `<div>${calcScore.shift()}</div><div>(${score.shift()})</div>`;
            }
        } else {
            td.innerHTML = `${counter}半荘目 <button onclick="deleteRow(this)">削除</button>`;
            counter++;
        }
        tr.appendChild(td);
    }
    lastRow.parentNode.insertBefore(tr, lastRow);
    updateScore();
    for (let i = 1; i < 6; i++) {
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
    for (let i = 1; i < 6; i++) {
        const key = keys[i - 1];
        delete scores[key][dict];
    }
    updateScore();
    tr.parentNode.removeChild(tr);
}

function updateScore() {
    const table = document.getElementById('table');
    const sumRow = table.rows[table.rows.length - 1];
    for (let i = 1; i < 6; i++) {
        let total = 0;
        for (let key in scores[keys[i - 1]]) {
            total += parseInt(scores[keys[i - 1]][key].calcScore);
        }
        sumRow.children[i].textContent = total;
    }
    const jsonScores = JSON.stringify(scores);
    localStorage.setItem('scores', jsonScores);
}
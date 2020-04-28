function elem(parent, name, className) {
    const e = document.createElement(name);
    if (className) {
        e.className = className;
    }
    parent.appendChild(e);
    return e;
}

function timestr(time) {
    const d = new Date(time);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (seconds > 60) {
        const minutes = Math.floor(seconds / 60);
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            return `${hours} hrs ago`;
        }
        return `${minutes} min ago`;
    }
    return `${seconds} sec ago`;
}

fetch('data').then((data) => {
    return data.json();
}).then((data) => {
    const ui = document.getElementById('ui');
    const gamesDiv = elem(ui, 'div');
    const gamesTable = elem(gamesDiv, 'table');
    const gamesTbody = elem(gamesTable, 'tbody');
    {
        const gamesTr1 = elem(gamesTbody, 'tr');
        elem(gamesTr1, 'th').innerText = 'Room';
        elem(gamesTr1, 'th').innerText = 'Start';
        elem(gamesTr1, 'th', 'num').innerText = 'Games';
        elem(gamesTr1, 'th').innerText = 'Active';
        elem(gamesTr1, 'th', 'num').innerText = 'Round';
        elem(gamesTr1, 'th').innerText = 'Phase';
        elem(gamesTr1, 'th', 'num').innerText = 'Players';
        elem(gamesTr1, 'th', 'num').innerText = 'Users';
    }
    for (const r of data.rooms) {
        const gamesTr = elem(gamesTbody, 'tr');
        elem(gamesTr, 'td').innerText = r.roomId;
        elem(gamesTr, 'td').innerText = timestr(r.start);
        elem(gamesTr, 'td', 'num').innerText = '' + r.completeGames;
        elem(gamesTr, 'td').innerText = timestr(r.active);
        elem(gamesTr, 'td', 'num').innerText = '' + r.round;
        elem(gamesTr, 'td').innerText = r.phase;
        elem(gamesTr, 'td', 'num').innerText = '' + r.players;
        elem(gamesTr, 'td', 'num').innerText = '' + r.users;
    }
});


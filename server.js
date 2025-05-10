const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Varsayılan durum
let state = {
  team1: 'MCI',
  team2: 'LIV',
  score: '0 - 0',
  color1: '#0000FF', // Takım 1 rengi (mavi)
  color2: '#FF0000', // Takım 2 rengi (kırmızı)
  timer: 0, // Zaman (saniye)
};

// Statik dosyaları sun
app.use(express.static('public'));
app.use(express.json());

// Timer başlatma
function startTimer() {
  state.timerInterval = setInterval(() => {
    if (!isNaN(state.timer)) {
      state.timer++;
      io.emit('update', {
        ...state,
        team1Color: state.color1,
        team2Color: state.color2,
      });
    } else {
      console.error("Timer değeri geçerli bir sayı değil!");
    }
  }, 1000);
}

// Timer işlemleri
app.post('/action', (req, res) => {
  const action = req.body.action;

  if (action === 'start') {
    startTimer();
  } else if (action === 'pause') {
    clearInterval(state.timerInterval);
  } else if (action === 'add30') {
    state.timer += 30;
  } else if (action === 'add60') {
    state.timer += 60;
  } else if (action === 'reset') {
    clearInterval(state.timerInterval);
    state.timer = 0;
  }

  io.emit('update', {
    ...state,
    team1Color: state.color1,
    team2Color: state.color2,
  });
  res.sendStatus(200);
});

// Skor değiştirme
app.post('/change-score', (req, res) => {
  const { team, action } = req.body;

  if (team === 'team1') {
    let score1 = parseInt(state.score.split(' - ')[0]);
    if (action === 'increment') score1++;
    if (action === 'decrement') score1--;
    state.score = `${score1} - ${state.score.split(' - ')[1]}`;
  } else if (team === 'team2') {
    let score2 = parseInt(state.score.split(' - ')[1]);
    if (action === 'increment') score2++;
    if (action === 'decrement') score2--;
    state.score = `${state.score.split(' - ')[0]} - ${score2}`;
  }

  io.emit('update', {
    ...state,
    team1Color: state.color1,
    team2Color: state.color2,
  });
  res.sendStatus(200);
});

// Takım adlarını güncelle
app.post('/update-team', (req, res) => {
  const { team, value } = req.body;
  state[team] = value;

  io.emit('update', {
    ...state,
    team1Color: state.color1,
    team2Color: state.color2,
  });
  res.sendStatus(200);
});

// Skor direkt güncelle
app.post('/update-score', (req, res) => {
  const { value } = req.body;
  state.score = value;

  io.emit('update', {
    ...state,
    team1Color: state.color1,
    team2Color: state.color2,
  });
  res.sendStatus(200);
});

// Renk güncelle
app.post('/update-color', (req, res) => {
  const { team, color } = req.body;
  if (team === 'team1') {
    state.color1 = color;
  } else if (team === 'team2') {
    state.color2 = color;
  }

  io.emit('update', {
    ...state,
    team1Color: state.color1,
    team2Color: state.color2,
  });
  res.sendStatus(200);
});

// Başlangıç zamanı güncelle
app.post('/update-start-time', (req, res) => {
  const { minutes, seconds } = req.body;
  state.timer = minutes * 60 + seconds;

  io.emit('update', {
    ...state,
    team1Color: state.color1,
    team2Color: state.color2,
  });
  res.sendStatus(200);
});

// Sunucuyu başlat
server.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor...');
});

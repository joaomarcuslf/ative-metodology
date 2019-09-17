const fs = require('fs-extra');

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const arr = [];

for (let i = 0; i < getRandomArbitrary(300, 30000); i++) {
  arr.push({
    user: i,
    rating: parseInt(getRandomArbitrary(900, 3000)),
  });
}

fs.writeFileSync('./data/data.json', JSON.stringify(arr));

const fs = require('fs-extra');

const GroupServiceFactory = require('./services/group.js');

const arr = fs.readJsonSync('./data/data.json');

const ProcessedData = new GroupServiceFactory(arr);

const groupsToPrint = ProcessedData.computed;

fs.writeFileSync('./data/groups.json', JSON.stringify(groupsToPrint, null, 4));

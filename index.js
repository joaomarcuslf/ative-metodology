const fs = require('fs-extra');

function getGroups(array, max, balanceCount = 0) {
  let groups = [];

  let ascIndex = 0;
  let decIndex = array.length - 1;

  let flow = 'asc';

  for (ascIndex = 0; ascIndex < max; ascIndex++) {
    const item = array[ascIndex];

    groups.push({
      rating: item.rating,
      members: [item],
    });
  }

  let shouldRunAgain = true;

  flow = 'dec';

  while (shouldRunAgain) {
    for (let index = 0; index < groups.length; index++) {
    
      if (decIndex < ascIndex) break;

      if (flow === 'dec') {
        groups[index].members.push(array[decIndex]);
        decIndex--;
      } else {
        groups[index].members.push(array[ascIndex]);
        ascIndex++;
      }

      const { members } = groups[index];

      groups[index].rating = parseInt(
        members.reduce((acc, nxt) => acc + nxt.rating, 0) / members.length,
      );
    }

    flow = flow === 'dec' ? 'asc' : 'dec';

    const { bigger, lesser } = groups.reduce((acc, actual, index) => {
      if (typeof acc.bigger === 'undefined' || groups[acc.bigger].rating < actual.rating) acc.bigger = index;
      if (typeof acc.lesser === 'undefined' || groups[acc.lesser].rating > actual.rating) acc.lesser = index;

      return acc;
    }, {});

    const isUnbalanced = (groups[bigger].rating - groups[lesser].rating) > 400;

  

    if (isUnbalanced && balanceCount < 3) {
      groups = balanceGroups(groups, bigger, lesser, balanceCount);
    }

    shouldRunAgain = !(decIndex < ascIndex);
  }

  return groups;
}

function balanceGroups(groupsRaw, biggerIndex, lesserIndex, balanceCount = 0) {

  const groups = groupsRaw;

  const bigger = groups[biggerIndex];
  const lesser = groups[lesserIndex];

  if (bigger.members.length <= lesser.members.length) {
  
    const biggerPopped = bigger.members.pop();
    const lesserPopped = lesser.members.pop();

    bigger.members.push(lesserPopped);
    lesser.members.push(biggerPopped);

    groups[biggerIndex] = bigger;
    groups[lesserIndex] = lesser;

    groups[biggerIndex].rating = parseInt(
      groups[biggerIndex].members.reduce((acc, nxt) => acc + nxt.rating, 0) / groups[biggerIndex].members.length,
    );

    groups[lesserIndex].rating = parseInt(
      groups[lesserIndex].members.reduce((acc, nxt) => acc + nxt.rating, 0) / groups[lesserIndex].members.length,
    );

    return groups;
  }



  const concatedArray = (lesser.members).concat(bigger.members);

  const [biggerBalanced, lesserBalanced] = getGroups(concatedArray, 2, balanceCount + 1);

  groups[biggerIndex] = biggerBalanced;
  groups[lesserIndex] = lesserBalanced;

  return groups;
}

function getGroupNumber(rawArray) {
  const isEven = rawArray.length % 2 === 0;

  let len = rawArray.length;

  if (!isEven) len--;

  if (len < 10) {
    let magicNumber = len - 1;

    while ((len / magicNumber) < 2 && !Number.isInteger(len / magicNumber)) {
      magicNumber--;
    }

    return magicNumber;
  } else {
    let magicNumber = parseInt((parseInt(len/10) * 5) / 4);

    return magicNumber;
  }
}
const arr = fs.readJsonSync('./data.json');

const sorted = arr.sort((a, b) => b.rating - a.rating);

const maximumGroupNumber = getGroupNumber(sorted);

const groupsToPrint = getGroups(sorted, maximumGroupNumber);

fs.writeFile('./groups.json', JSON.stringify(groupsToPrint, null, 4));
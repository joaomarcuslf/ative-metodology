const logger = require("../../helpers/log.js");

class GroupService {
  constructor(data = []) {
    this.raw = data;

    this.computed = this.processData(this.raw);
  }

  processData(raw) {
    return this.getGroups(
      raw.sort((a, b) => b.rating - a.rating),
      this.getGroupNumber(raw),
    );
  }

  getGroups(array, max, balanceCount = 0) {
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

        groups[index] = this.getMediumRating(groups[index]);
      }

      flow = flow === 'dec' ? 'asc' : 'dec';

      const { bigger, lesser } = groups.reduce((acc, actual, index) => {
        if (typeof acc.bigger === 'undefined' || groups[acc.bigger].rating < actual.rating) acc.bigger = index;
        if (typeof acc.lesser === 'undefined' || groups[acc.lesser].rating > actual.rating) acc.lesser = index;

        return acc;
      }, {});

      const isUnbalanced = (groups[bigger].rating - groups[lesser].rating) > 400;


      if (isUnbalanced && balanceCount < 3) {
        logger(`Is unbalanced ${groups[lesser].rating} ${groups[bigger].rating}`);
        groups = this.balanceGroups(groups, bigger, lesser, balanceCount);
      }

      shouldRunAgain = !(decIndex < ascIndex);
    }

    return groups;
  }

  balanceGroups(groupsRaw, biggerIndex, lesserIndex, balanceCount = 0) {
    const groups = groupsRaw;

    const bigger = groups[biggerIndex];
    const lesser = groups[lesserIndex];

    if (bigger.members.length <= lesser.members.length) {
      logger(`Balance strategy: Trade method ${balanceCount}, ${lesserIndex}, ${biggerIndex}`);

      const biggerPopped = bigger.members.pop();
      const lesserPopped = lesser.members.pop();

      bigger.members.push(lesserPopped);
      lesser.members.push(biggerPopped);

      groups[biggerIndex] = bigger;
      groups[lesserIndex] = lesser;

      groups[biggerIndex] = this.getMediumRating(groups[biggerIndex]);
      groups[lesserIndex] = this.getMediumRating(groups[lesserIndex]);

      return groups;
    }

    logger(`Balance strategy: Sort Method ${balanceCount}`);


    const concatedArray = (
      lesser.members
        .concat(bigger.members)
        .sort((a, b) => a.rating - b.rating)
    );

    const [biggerBalanced, lesserBalanced] = this.getGroups(concatedArray, 2, balanceCount + 1);

    groups[biggerIndex] = biggerBalanced;
    groups[lesserIndex] = lesserBalanced;

    return groups;
  }

  getGroupNumber(rawArray) {
    const isEven = rawArray.length % 2 === 0;

    let len = rawArray.length;

    if (!isEven) len--;

    if (len < 10) {
      let magicNumber = len - 1;

      while ((len / magicNumber) < 2 && !Number.isInteger(len / magicNumber)) {
        magicNumber--;
      }

      return magicNumber;
    }
    return parseInt((parseInt(len / 10) * 5) / 4);
  }

  getMediumRating(group) {
    const newGroup = { ...group };

    newGroup.rating = parseInt(
      group.members
        .reduce((acc, nxt) => acc + nxt.rating, 0) / group.members.length,
    );

    return newGroup;
  }
}

module.exports = GroupService;

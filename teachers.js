'use strict';

const fs = require('fs');
const data = fs.readFileSync('./data.csv', { encoding: 'utf-8' }).split('\n');
const output = fs.readFileSync('./output.csv', { encoding: 'utf-8' }).split('\n');

const baseGroup = new Set();
const teachers = new Map();

for (const string of data) {
  const arr = string.split(',');
  baseGroup.add(arr[2].toLowerCase()); //add group
}

for (const string of output) {
  const index = string.indexOf(',');
  const group = string.slice(0, index);
  const stringTeachers = string.slice(index + 1);
  const regexp = /[а-щА-ЩЬьЮюЯяЇїІіЄєҐґ][а-щА-ЩЬьЮюЯяЇїІіЄєҐґ ."']+[.а-щА-ЩЬьЮюЯяЇїІіЄєҐґ]+/g;
  const teachersArray = stringTeachers.match(regexp);
  teachers.set(group, teachersArray);
}

const select = () => {
  const result = new Map();
  for (const group of baseGroup) {
    const [groupName, ] = group.split(' ');
    if (teachers.has(group)) {
      result.set(group, teachers.get(group));
    } else if (teachers.has(groupName)) {
      result.set(groupName, teachers.get(groupName));
    } else {
      result.set(group, 'Помилка');
    }
  }
  return result;
};

module.exports = select;

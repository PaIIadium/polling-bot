'use strict';

const fs = require('fs');
const output = fs.readFileSync('./output.csv', { encoding: 'utf-8' }).split('\n');

const teachers = new Map();

for (const string of output) {
  const index = string.indexOf(',');
  const group = string.slice(0, index);
  const stringTeachers = string.slice(index + 1);
  const regexp = /[а-щА-ЩЬьЮюЯяЇїІіЄєҐґ][а-щА-ЩЬьЮюЯяЇїІіЄєҐґ ."']+[.а-щА-ЩЬьЮюЯяЇїІіЄєҐґ]+/g;
  const teachersArray = stringTeachers.match(regexp);
  teachers.set(group, teachersArray);
}

const select = () => {
  const data = fs.readFileSync('./data.csv', { encoding: 'utf-8' }).split('\n');
  const baseGroup = new Set();

  for (const string of data) {
    const arr = string.split(',');
    baseGroup.add(arr[2].toLowerCase()); //add group
  }
  const result = new Map();
  baseGroup.forEach(group => result.set(group, teachers.get(group)));
  return result;
};

module.exports = { select, teachers };

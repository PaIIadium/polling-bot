'use strict';

process.env['NTBA_FIX_319'] = 1;

const Bot = require('node-telegram-bot-api');
const fs = require('fs');
const { select, teachers } = require('./teachers');
const token = process.env.TOKEN;
const bot = new Bot(token, { 
  polling: {
    params: {
      timeout: 20
    }
  }
});

const file = fs.readFileSync('./data.csv', { encoding: 'utf-8' });
const arr = file.split('\n');

const base = new Map();

for (const substr of arr) {
  if (substr === '') break;
  const data = substr.split(',');
  const [id, tag, group] = data;
  base.set(+id, { tag, group });
}

const ansSuccessful = `Дякуємо, вашу групу зареєстровано в опитуванні.
На початку опитування вам автоматично буде надіслано повідомлення з інструкціями. 
Якщо ви помилково вказали групу, введіть назву ще раз для перезапису. 
Якщо ви хочете видалити вашу групу з опитування, введіть /delete`;
const askGroup = 'Будь ласка, введіть назву і *кафедру* вашої групи *українською* мовою у такому форматі: ТМ-81 (АПЕПС)';
const ansError = 'Неправильна назва групи, спробуйте ввести ще раз.';
const ansDuplicate = 'Вашу групу вже зареєстровано, чекайте на початок опитування.';
const ansDelete = 'Вашу групу видалено з опитування';

const onStart = msg => {
  if (base.has(msg.chat.id)) bot.sendMessage(msg.chat.id, ansDuplicate);
  else bot.sendMessage(msg.chat.id, askGroup, { parse_mode: 'Markdown' });
};

const onGroup = msg => {
  //const regexp = /^[а-щА-ЩЬьЮюЯяЇїІіЄєҐґ]{2}-([0-9]|[а-щА-ЩЬьЮюЯяЇїІіЄєҐґ-])+ \([а-щА-ЩЬьЮюЯяЇїІіЄєҐґ]+\)$/;
  const group = msg.text.toLowerCase();
  const [groupName, ] = group.split(' ');
  if (teachers.has(group)) {
    base.set(msg.chat.id, { tag: msg.from.username, group: group.toUpperCase() });
    saveFile(() => bot.sendMessage(msg.chat.id, ansSuccessful));
  } else if (teachers.has(groupName)) {
    base.set(msg.chat.id, { tag: msg.from.username, group: groupName.toUpperCase() });
    saveFile(() => bot.sendMessage(msg.chat.id, ansSuccessful));
  } else {
    bot.sendMessage(msg.chat.id, ansError);
  }
};

const onDelete = msg => {
  base.delete(msg.chat.id);
  saveFile(() => bot.sendMessage(msg.chat.id, ansDelete));
};

const saveFile = fn => {
  let string = '';
  for (const [id, obj] of base) {
    string += id + ',' + obj.tag + ',' + obj.group + '\n';
  }
  fs.writeFile('./data.csv', string, fn);//
  return string;
};

const onDownload = msg => {
  bot.sendMessage(msg.chat.id, saveFile(() => {}));
};

const formatTeachers = map => {
  let str = '';
  const set = new Set();
  for (const [, teachers] of map) {
    teachers.forEach(val => set.add(val));
  }
  set.forEach(val => str += val + '\n');
  return str;
};

const formatGroupTeachers = map => {
  let str = '';
  for (const [group, teachers] of map) {
    str += group.toUpperCase() + ':\n';
    teachers.forEach(val => str += val + '\n');
  }
  return str;
};

const onTeachers = msg => {
  const str = formatTeachers(select());
  bot.sendMessage(msg.chat.id, str);
};

const onGroupTeachers = msg => {
  const str = formatGroupTeachers(select());
  bot.sendMessage(msg.chat.id, str);
};

const handler = msg => {
  switch (msg.text) {
  case '/start': {
    onStart(msg);
    break;
  }
  case '/delete': {
    onDelete(msg);
    break;
  }
  case '/_download': {
    onDownload(msg);
    break;
  }
  case '/_teachers': {
    onTeachers(msg);
    break;
  }
  case '/_groupteachers': {
    onGroupTeachers(msg);
    break;
  }
  default: onGroup(msg);
  }
};

bot.on('text', handler);

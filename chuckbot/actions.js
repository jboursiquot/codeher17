/* eslint-disable no-console */
const qs = require('querystring');
const fetch = require('node-fetch');

const log = (event) => {
  console.log('Event', JSON.stringify(event, null, 2));
  return Promise.resolve(event);
};

const getCommand = text => /^<@[A-Z0-9]*>(.+)/.exec(text)[1].trim();

const parseCommand = (command) => {
  const pattern = /([0-9]{1,})|(random{1})/g;
  const matches = command.match(pattern);
  if (matches) {
    return {
      whichJoke: matches[0],
    };
  }
  return null;
};

// Send API request to http://www.icndb.com/api/
const callICNDB = (command) => {
  const url = `http://api.icndb.com/jokes/${command.whichJoke}`;
  console.log(`Requesting ${url}`);
  return fetch(url)
    .then(response => response.json())
    .then((json) => {
      return `${json.value.joke}`;
    });
};

// Generate a response to the command.
const doCommand = (event) => {
  const rawCommand = event.slack.event.text;
  const command = getCommand(rawCommand);
  const jokeCommand = parseCommand(command);
  if (jokeCommand) {
    return callICNDB(jokeCommand)
      .then(reply => Object.assign(event, { reply }));
  }
  const defaultReply = `ChuckBot does not understand the command "${command}".
Try "tell me a random joke" or "tell me joke # 112"`;
  return Object.assign(event, { reply: defaultReply });
};

// Send a response via Slack.
const sendResponse = (event) => {
  const params = {
    token: event.team.bot.bot_access_token,
    channel: event.slack.event.channel,
    text: event.reply,
  };
  const url = `https://slack.com/api/chat.postMessage?${qs.stringify(params)}`;
  console.log(`Requesting ${url}`);
  return fetch(url)
    .then(response => response.json())
    .then((response) => {
      if (!response.ok) throw new Error('SlackAPIError');
      return Object.assign(event, { response });
    });
};

module.exports.handler = (event, context, callback) => log(event)
  .then(doCommand) // Attempt the command
  .then(sendResponse) // Update the channel
  .then(log) // Testing: Log the event
  .then(() => callback(null)) // Sucess
  .catch(callback); // Error

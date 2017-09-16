# Building the Slack Bot

## Our Goal

We want to build "chuckbot", a Slack bot that we can ask for a Chuck Norris joke from the Internet Chuck Norris Database at [http://www.icndb.com](http://www.icndb.com). We will do so by using the API made freely available from the site at [http://www.icndb.com/api/](http://www.icndb.com/api/).

## Example Calls to the ICNDB API

> You can use a chrome extension like [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) to help you test these API calls as well.

Fetch a random joke:

```
$ curl http://api.icndb.com/jokes/random
{
   "value" : {
      "categories" : [],
      "id" : 591,
      "joke" : "There is no April 1st in Chuck Norris' calendar, because no one can fool him."
   },
   "type" : "success"
}
```

Fetch a specific joke:

```
$ curl http://api.icndb.com/jokes/112
{
   "value" : {
      "joke" : "The Bermuda Triangle used to be the Bermuda Square, until Chuck Norris Roundhouse kicked one of the corners off.",
      "id" : 112,
      "categories" : []
   },
   "type" : "success"
}
```

> Note that a small number of the jokes are not kid-appropriate in case you need to be aware.

## Demo Time!

Let's demo this Slack bot in an actual workspace.

> Instructor's demo.

## Let's do some (more) setup

## Create a new Slack workspace
* Head to [https://slack.com](https://slack.com)
* Click "Create Workspace"
* Specify an email address (for the team owner)
* Receive your confirmation code at the email address specified and enter it
* Specify a full name and optionally a display name
* Specify a password
* Tell Slack about your team (e.g. shared interest group, 1-10 people)
* Give your group a name (I use CodeHer17x to keep mine simple)
* Slack will suggest team URL based on your team name
* Agree to the terms
* Send or skip invitations
* Slack will take you to your team immediately after that. Explore Slack or Skip the tutorial.

## Set up a Slack application for our bot

Head over to https://api.slack.com/apps and click on "Create an App" to get started.

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/slack-app-creation/slack-create-app.png?token=AAPkTRFMKMUYiuHwRRmPo-2V2yCKFu5qks5ZxS4TwA%3D%3D)

Give the app a name and select your workspace.`

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/slack-app-creation/slack-create-app-details.png?token=AAPkTdhdlzZBwpE2HDaqaqDllYy6RZckks5ZxS5_wA%3D%3D)

Back on the "Basic Information" page, copy the **ClientID**, **Client Secret** and **Verification Token** values from the "App Credentials" section to a safe place. We'll need them soon.

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/slack-app-creation/slack-app-secrets.png?token=AAPkTZA8e6XbWKmffCa-oKDnzhczmT43ks5ZxjYawA%3D%3D)

We want to create a bot so select "Bots" from the "Add features and functionality" list of options.

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/slack-app-creation/slack-select-bot.png?token=AAPkTQEwZhd-5C8Gk0ZtiK9OeVgxsyf9ks5ZxS-SwA%3D%3D)

Confirm the name and username for our bot and toggle the "Always Show My Bot as Online" button. Click "Add Bot User".

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/slack-app-creation/slack-create-bot.png?token=AAPkTRlQ87hiE6N2XXGVxm4FEmmo2Uqxks5ZxS_hwA%3D%3D)

## The Installation Flow
Before our bot can be installed into a Slack workspace for use, we need to set up an installation process that involves multiple components, including Slack (for authorization), our own install Lambda function, and AWS DynamoDB for storage purposes (to store security information we need in order to talk to the Slack API).

Here's what the flow looks like:

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow.png?token=AAPkTXFZClVDhmkVCMeTtpgr5d9pywZQks5Zxl0CwA%3D%3D)

> Note: This is the OAuth2 workflow.

## Setting up our install Lambda function

In our `chuckbot` directory, you'll see the following files:

```
chuckbot
├── README.md
├── actions.js
├── events.js
├── install.js
├── node_modules
...
├── package-lock.json
├── package.json
├── public
│   ├── install-failed.html
│   └── install-success.html
└── serverless.yml
```

Open up `serverless.yml`. An excerpt of that document is listed below.

```
service: chuckbot

frameworkVersion: "<=1.6.1"

provider:
  name: aws
  runtime: nodejs4.3
  stage: dev
  region: us-east-1
  environment:
    CLIENT_ID: CHANGEME
    CLIENT_SECRET: CHANGEME
    VERIFICATION_TOKEN: CHANGEME
    INSTALL_ERROR_URL: https://s3.amazonaws.com/codeher17a/install-failed.htm
    INSTALL_SUCCESS_URL: https://s3.amazonaws.com/codeher17a/install-success.html

functions:
  install:
    handler: install.handler
    events:
      - http:
          path: install
          method: get
```

Under the `environment` section, you'll need to update the `CLIENT_ID`, `CLIENT_SECRET` and `VERIFICATION_TOKEN` to the values we saved earlier. We'll come back to the other variables later on. These changes will ensure that our function has access to the correct information needed for it to talk to Slack during the installation flow.

Now let's take a look at the handler we expose in `install.js`:

```
module.exports.handler = (event, context, callback) =>
  Promise.resolve(event)
    .then(getCode) // Get code from event
    .then(requestToken) // Exchange code for token
    .then(saveResponse) // Save token to DDB
    .then(() => successResponse(callback))
    .catch(error => errorResponse(error, callback));
```


Note the use of our "promise chain" for get a code from the user's request to use in a subsequent request to Slack in exchange for a token, followed by a save to DynamoDB and a success or error response to the user.

Run `npm install --save` to pull in all the dependencies for the project before we deploy. You should see a new `node_modules` folder in the directory now. These dependencies will be packaged up and shipped with our function during the deploy process.

Let's deploy.

```
$ sls deploy

Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (245.55 KB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
................................................................
Serverless: Stack update finished...
Service Information
service: chuckbot
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - https://iia7wqsi8k.execute-api.us-east-1.amazonaws.com/dev/events
  GET - https://iia7wqsi8k.execute-api.us-east-1.amazonaws.com/dev/install
functions:
  chuckbot-dev-actions
  chuckbot-dev-events
  chuckbot-dev-install
```

You should see something like the above output. We haven't talked about the `actions` and `events` yet but will soon.

Our next step is to copy the `GET` endpoint for the `install` we see listed from our deploy and head over to our Slack app's OAuth settings page and paste it into our **Redirect URL(s)** field.

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-oauth-redirect-url.png?token=AAPkTWrQjp7OlU_nMfwv993qY9D6DXnwks5ZxkZdwA%3D%3D)

This now means that installation requests will be sent to this endpoint with the parameters we expect in order to obtain a token from Slack before the app can be installed in a user's workspace.

## Set up the success/error pages on S3

Recall in the `serverless.yml` document we had two variables containing URLs to a success page and an error page for our installation:

```
INSTALL_ERROR_URL: https://s3.amazonaws.com/codeher17a/install-failed.html
INSTALL_SUCCESS_URL: https://s3.amazonaws.com/codeher17a/install-success.html
```

Let's ensure we have those ready by uploading the documents in our `public` folder to an S3 bucket we own and that we configure for public access.

![Create an S3 bucket](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/aws-create-bucket-1.png?token=AAPkTeriM5yr4iUhaoiJ-xKwv-FC-y7sks5ZxkzqwA%3D%3D)

![Grant public access to it](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/aws-create-bucket-2.png?token=AAPkTXNoNu-UAuKRRFtktcmW1LfYMtbGks5Zxk0SwA%3D%3D)

![Upload install-success.html and install-failed.html](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/aws-upload-files.png?token=AAPkTXccU3H5Uf31sSs80Z4sq3HT5hlUks5Zxk03wA%3D%3D)

![Verify we can access the files](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/aws-s3-listing.png?token=AAPkTcrtpF5rKEh4ZO9Yhcsqmju5lySRks5Zxk17wA%3D%3D)

## Let's test the installation process

Head over to the [Slack Button documentation page](https://api.slack.com/docs/slack-button), scroll to the "Add the Slack button" section, unselect the "incoming webhook" checkbox, select the "bot" checkbox.

![Add to Slack button](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/slack-add-to-slack-button.png?token=AAPkTRDjRtFMJkoGRx9EUGrMHwdxsTV1ks5Zxk8_wA%3D%3D)

Click the `Add to Slack` button to test out the authorization process.

![Authorization page](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow-1.png?token=AAPkTV8AN5ejucc8K4Y6ZFhkDHP9XIbjks5ZxlG5wA%3D%3D)

Click "Authorize" to trigger the interaction with our install Lambda function.

![Authorizing...](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow-2.png?token=AAPkTauctqAenWUgqM5dqH-O5rdU1zmoks5ZxlJtwA%3D%3D)

![Success!](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow-3.png?token=AAPkTf72XBQfTk6Ay9IL2GqQhYyejgRJks5ZxlKXwA%3D%3D)

Now let's see what the logs look like for our `install` function to see what went on.

```
$ sls logs -f install
START RequestId: 347da67b-9ad9-11e7-8bd3-8f33a50106ad Version: $LATEST
2017-09-16 08:18:54.268 (-04:00)        347da67b-9ad9-11e7-8bd3-8f33a50106ad    Requesting token with 241597234627.242202067650.9c3bded4d69bfd51a6231c9f10bc78eb4f47fee77cecdf58fc59f3fc099b43de
2017-09-16 08:18:54.269 (-04:00)        347da67b-9ad9-11e7-8bd3-8f33a50106ad    Fetching https://slack.com/api/oauth.access?client_id=241597234627.242734898214&client_secret=a964e7dc587c455818a57ceec79f6b5e&code=241597234627.242202067650.9c3bded4d69bfd51a6231c9f10bc78eb4f47fee77cecdf58fc59f3fc099b43de
2017-09-16 08:18:54.895 (-04:00)        347da67b-9ad9-11e7-8bd3-8f33a50106ad    Put { TableName: 'chuckbot-dev-teams',
  Item:
   { ok: true,
     access_token: 'xoxp-241597234627-241154615937-243292023943-39ba1fe528126a5b43df7b630d685399',
     scope: 'identify,bot',
     user_id: 'U734JJ3TK',
     team_name: 'CodeHer17a',
     team_id: 'T73HK6WJF',
     bot:
      { bot_user_id: 'U752NBP1C',
        bot_access_token: 'xoxb-243090397046-hk5KB50JzRVaXMpndEkhJ5Hg' } } }
END RequestId: 347da67b-9ad9-11e7-8bd3-8f33a50106ad
REPORT RequestId: 347da67b-9ad9-11e7-8bd3-8f33a50106ad  Duration: 770.98 ms     Billed Duration: 800 ms         Memory Size: 1024 MB  Max Memory Used: 38 MB
```

We can see that a token was successfully requested from the Slack API. We're also saving this information in our DynamoDB table for later use.

![Our DynamoDB table](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow-4.png?token=AAPkTVMzrLyt51f7Ud2Q5nfVeawYxc6Rks5ZxlpCwA%3D%3D)

Select the item listed and you'll see the values that we saw in the logs earlier have been persisted in DynamoDB.

![Our data's been saved!](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow-5.png?token=AAPkTfNCvearnvr4Od2M3F40SNnYYNZTks5ZxlpjwA%3D%3D)

But did the bot install? Let's find out by going back to our workspace.

![ChuckBot is installed!](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-bot-is-listed.png?token=AAPkTT4oPPpIuAgVdIW66UwA5xEjkH0Uks5ZxlkAwA%3D%3D)

We've now completed all the steps in the installation flow diagram from earlier:

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/install/install-flow.png?token=AAPkTXFZClVDhmkVCMeTtpgr5d9pywZQks5Zxl0CwA%3D%3D)

Now we're ready to actually get into what it takes for ChuckBot to respond to our users.

## Handling Events from the Slack API

When a user interacts with ChuckBot in a Slack channel, this triggers an event that Slack can in turn relay to our bot in order for us to generate a response.

Let's see what that flow looks like.

![Events flow](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/events/events-flow.png?token=AAPkTTEkpnT_ZKpyI02Jdq6MIadmj661ks5Zxl7ZwA%3D%3D)

> We'll talk about the Actions Function soon.

Let's open up `events.js` and do a walkthrough of the handler we're exposing.

```
module.exports.handler = (event, context, callback) =>
  Promise.resolve(event) // Start the promise chain
    .then(getSlackEvent) // Get just the Slack event payload
    .then(respond(callback)) // Respond OK to Slack
    .then(verifyToken) // Verify the token
    .then(getTeam) // Get the team data from DDB
    .then(checkForMention) // Check message contains a mention of our bot
    .then(invokeAction) // Invoke action function
    .catch(callback);
```

Back in `serverless.yml`, we can see the relevant function definition for our events function as well:

```
functions:
  ...
  events:
    handler: events.handler
    events:
      - http:
          path: events
          method: post
  ....
```

## Deploy the Events function

```
$ sls deploy function -f events
Serverless: Deploying function: events...
Serverless: Packaging function: events...
Serverless: Uploading function: events (248.91 KB)...
Serverless: Successfully deployed function: events
```

Recall back in our first deploy, there were two listings under our `endpoints` section, a GET which we used for Slack OAuth Redirect URL(s) and a POST which we're now going to use to enable the events API for our application in Slack.

Head over to your app's Event Subscription page on Slack:

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/events/slack-events-setup-1.png?token=AAPkTSevuhwmhybCOFhPemInMiJeshorks5ZxmXGwA%3D%3D)

Click "Enable Events" and add the POST endpoint we copied from our original `sls deploy` (or run `sls deploy` again to see it):

![Add Request URL](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/events/slack-events-setup-2.png?token=AAPkTaDMuxWmAfyVohctcGxANM-kRSqYks5ZxmZAwA%3D%3D)

You should notice a green "Verified" label after you paste in the **Request URL**. If not, use the logs to figure out what went wrong.

Next, we subscribe to the events that our bot will care about and save:

![Subscribe to message.channel events](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/events/slack-events-setup-3.png?token=AAPkTcChumsHAG6MSOShIDeKkjZWYRdhks5ZxmamwA%3D%3D)

## The Slack Events API

Let's head over to the Slack Events API [documentation page](https://api.slack.com/events-api) to get a quick understanding of what it is and what it can do for us. 

Here's a quick summary:

* It is event-based
* You subscribe to events you're interested in and only those
* Well suited for FaaS applications

Since we've already deployed our `events` function and configured Slack to send messages in a channel to it, we can try interacting with the bot and see what happens.

## Invite ChuckBot into a channel

Before we can talk to ChuckBot, we must first invite it into a channel.

![](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/events/slack-invite-bot.png?token=AAPkTZPdpqZtnt-yHOe45Zl_VXFUi5gmks5ZxmrOwA%3D%3D)

Note that simply mentioning the name "chuckbot" is not enough to trigger an event. You must use the `@` symbol to actually make a mention. Once we do, slack gives us the option to invite @ChuckBot into the channel and we do so.

We say hello to @ChuckBot but seemingly nothing happens. Well, something did happen. Let's look at the logs.

```
$ sls logs -f events
2017-09-16 10:02:23.416 (-04:00)	a9b195b1-9ae7-11e7-8e2b-577e510de757	Bot U752NBP1C is mentioned in "<@U752NBP1C> has joined the channel"
2017-09-16 10:02:23.416 (-04:00)	a9b195b1-9ae7-11e7-8e2b-577e510de757	Invoking chuckbot-dev-actions with event { slack:
   { token: 'zMhnts6rL1iU8vtpzQEq0Fzy',
     team_id: 'T73HK6WJF',
     api_app_id: 'A74MLSE6A',
     event:
      { user: 'U752NBP1C',
        inviter: 'U734JJ3TK',
        text: '<@U752NBP1C> has joined the channel',
        type: 'message',
        subtype: 'channel_join',
        ts: '1505570542.000093',
        channel: 'C730MLQ3A',
        event_ts: '1505570542.000093' },
     type: 'event_callback',
     authed_users: [ 'U752NBP1C' ],
     event_id: 'Ev753154LW',
     event_time: 1505570542 },
  team:
   { team_name: 'CodeHer17a',
     user_id: 'U734JJ3TK',
     bot:
      { bot_access_token: 'xoxb-243090397046-hk5KB50JzRVaXMpndEkhJ5Hg',
        bot_user_id: 'U752NBP1C' },
     scope: 'identify,bot',
     team_id: 'T73HK6WJF',
     ok: true,
     access_token: 'xoxp-241597234627-241154615937-243292023943-39ba1fe528126a5b43df7b630d685399' } }
END RequestId: a9b195b1-9ae7-11e7-8e2b-577e510de757
REPORT RequestId: a9b195b1-9ae7-11e7-8e2b-577e510de757	Duration: 156.56 ms	Billed Duration: 200 ms 	Memory Size: 1024 MB	Max Memory Used: 42 MB
```

Our logs indicate that an event came in when we invited @ChuckBot into the channel and it in turn sent an event to an `actions` function. We'll get into the `actions` function next.

## Responding to users

The last major component to go over is what to do when a user interacts with ChuckBot. Recall that we want ChuckBot to respond to requests for jokes by talking to the ICNDB API behind the scenes to request a joke and relay that joke back to us in our slack channel.

Here's what the flow looks like:

![Simplified flow](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/actions/flow-simplified.png?token=AAPkTZL4iSX6TzIh6qeXQJ-cRfldtxbiks5ZxnZ9wA%3D%3D)

Open up `actions.js` and take a peek at the handler we're exposing:

```
module.exports.handler = (event, context, callback) => log(event)
  .then(doCommand) // Attempt the command
  .then(sendResponse) // Update the channel
  .then(log) // Testing: Log the event
  .then(() => callback(null)) // Sucess
  .catch(callback); // Error
```

> Instructor-led walkthrough of the code.

The flow of what's going on looks a little more complex. Below is a diagram that helps us understand the different components involved.

![Complete flow](https://raw.githubusercontent.com/jboursiquot/codeher17/master/walkthrough/images/actions/flow-complete.png?token=AAPkTdmCGH6OAXv45VuXw69idBVW3xqiks5ZxnhgwA%3D%3D)

## Conclusion

In this walkthrough, we saw all the components that are involved in creating a Slack bot powered by AWS Lambda functions.

* We used the Serverless Framework's `sls` tool to manage the deploys.
* We configured a custom Slack application to talk to our lambda function endpoints exposed through AWS API Gateway.
* We got our bot installed into a Slack team/workspace.
* We got our bot to listen to and respond to events triggered from Slack channels.
* We got our bot to parse commands which it used to interact with an external API to retrieve the correct information.
* We got our bot to communicate the results of our commands back to Slack and back to the user.
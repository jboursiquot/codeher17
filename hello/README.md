## Getting comfortable with the serverless model

Let's get a feel for what it's like to work with serverless architectures by creating, deploying and testing a "hello" AWS Lambda function. We'll do this using the [Serverless Framework](https://serverless.com/) and need to install it.

### Install the Serverless Framework CLI tool

> Note: This step assumes you've already installed NodeJS.

```
$ npm install serverless -g
```

This will install the `sls` utility globally and make the command accessible anywhere from your machine.

`sls` will make managing all the different components that go into a serverless application a lot easier to deal with than they would be otherwise.

### Getting to know `sls`

```
$ sls -v
1.6.1

$ sls -h

Commands
* Serverless documentation: http://docs.serverless.com
* You can run commands with "serverless" or the shortcut "sls"
* Pass "--help" after any <command> for contextual help

config credentials ............ Configures a new provider profile for the Serverless Framework
create ........................ Create new Serverless service
install ....................... Install a Serverless service from GitHub
deploy ........................ Deploy a Serverless service
deploy function ............... Deploy a single function from the service
deploy list ................... List deployed version of your Serverless Service
invoke ........................ Invoke a deployed function
invoke local .................. Invoke function locally
info .......................... Display information about the service
logs .......................... Output the logs of a deployed function
metrics ....................... Show metrics for a specific function
remove ........................ Remove Serverless service and all resources
rollback ...................... Rollback the Serverless service to a specific deployment
slstats ....................... Enable or disable stats

Plugins
AwsConfigCredentials, Config, Create, Deploy, Info, Install, Invoke, Logs, Metrics, Package, Remove, Rollback, SlStats

```

### Creating our "hello" service with the Serverless Framework

We want to create a new service that will deploy to AWS using NodeJS as the runtime. We'd like to name the service "hello" as well.

Let's look at our options for deploying with `sls`:

```
$ sls create -h
Plugin: Create
create ........................ Create new Serverless service
    --template / -t (required) ......... Template for the service. Available templates: "aws-nodejs", "aws-python", "aws-java-maven", "aws-java-gradle", "aws-scala-sbt", "aws-csharp", "openwhisk-nodejs" and "plugin"
    --path / -p ........................ The path where the service should be created (e.g. --path my-service)
    --name / -n ........................ Name for the service. Overwrites the default name of the created service.
```

We now know we'll need to specify the `-t` and `-n` to provide our template and name parameters. Let's make a `hello` directory and create our service inside of it.

```
$ mkdir hello 
$ cd hello
$ sls create --t aws-nodejs -n hello
Serverless: Generating boilerplate...
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.6.1
 -------'

Serverless: Successfully generated boilerplate for template: "aws-nodejs"
```

Take a look at stripped down `serverless.yml` without all the comments:

```
service: hello

provider:
  name: aws
  runtime: nodejs4.3

functions:
  hello:
    handler: handler.hello
```

* `service` is the service name we specified with `-n`.
* `provider` specifies that we'll be using AWS and its supported `nodejs4.3` runtime (the engine that runs our JavaScript code).
* `functions` lists out the function we get by default after creating a service.

Let's take a peek at `handler.js`:

```
'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
```

This is where our functionality lives. By default, this function is designed to return some JSON with a "Go Serverless v1.0!..." message in the body.

Let's change the default message and add a log statement before the `callback(null, response)` statement so we can see how to look at logs later after we deploy.

```
'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello Coder(Her) Conf!',
      input: event,
    }),
  };

  console.log("Hello Code(Her) Conf!")
  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
```

Let's deploy this function to AWS!

### Deploying our service with the Serverless Framework

Let's look at our options for deployment:

```
$ sls deploy -h
Plugin: Deploy
deploy ........................ Deploy a Serverless service
deploy function ............... Deploy a single function from the service
deploy list ................... List deployed version of your Serverless Service
    --stage / -s ....................... Stage of the service
    --region / -r ...................... Region of the service
    --noDeploy / -n .................... Build artifacts without deploying
    --verbose / -v ..................... Show all stack events during deployment
```

Let's try `sls deploy` but with the `--verbose` flag so we can see a detailed output of the deployment process. Note that the first time we deploy, things will take a bit longer than subsequent deploys.

```
$ sls deploy --verbose

Serverless: Creating Stack...
Serverless: Checking Stack create progress...
CloudFormation - CREATE_IN_PROGRESS - AWS::CloudFormation::Stack - hello-dev
CloudFormation - CREATE_IN_PROGRESS - AWS::S3::Bucket - ServerlessDeploymentBucket
CloudFormation - CREATE_IN_PROGRESS - AWS::S3::Bucket - ServerlessDeploymentBucket
CloudFormation - CREATE_COMPLETE - AWS::S3::Bucket - ServerlessDeploymentBucket
CloudFormation - CREATE_COMPLETE - AWS::CloudFormation::Stack - hello-dev
Serverless: Stack create finished...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (583 B)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
CloudFormation - UPDATE_IN_PROGRESS - AWS::CloudFormation::Stack - hello-dev
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_COMPLETE - AWS::Logs::LogGroup - HelloLogGroup
CloudFormation - CREATE_COMPLETE - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Policy - IamPolicyLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::IAM::Policy - IamPolicyLambdaExecution
CloudFormation - CREATE_COMPLETE - AWS::IAM::Policy - IamPolicyLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Function - HelloLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - HelloLambdaVersionpWiorIODwxvLt1faxoBu1JoN9hI3YjeC7o7w9FB3EEs
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - HelloLambdaVersionpWiorIODwxvLt1faxoBu1JoN9hI3YjeC7o7w9FB3EEs
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Version - HelloLambdaVersionpWiorIODwxvLt1faxoBu1JoN9hI3YjeC7o7w9FB3EEs
CloudFormation - UPDATE_COMPLETE_CLEANUP_IN_PROGRESS - AWS::CloudFormation::Stack - hello-dev
CloudFormation - UPDATE_COMPLETE - AWS::CloudFormation::Stack - hello-dev
Serverless: Stack update finished...
Service Information
service: hello
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  hello-dev-hello

Stack Outputs
HelloLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:990800646976:function:hello-dev-hello:1
ServerlessDeploymentBucketName: hello-dev-serverlessdeploymentbucket-1mjleno6xdjee
```

Note the use of AWS services and tools (CloudFormation, S3, IAM, CloudWatch and Lambda) all coming together to make our function available in the cloud.

> You can use the AWS console to navigate to S3, CloudWatch and Lambda to see some of the artifacts that were created for us.

Some high-level information is displayed once the deploy is complete and we see the one function we've deployed so far `hello-dev-hello`. 

### Invoking our function with the Serverless Framework

We can invoke our function from the command line using `sls` as well. Let's see what our options are.

```
$ sls invoke -h
Plugin: Invoke
invoke ........................ Invoke a deployed function
invoke local .................. Invoke function locally
    --function / -f (required) ......... The function name
    --stage / -s ....................... Stage of the service
    --region / -r ...................... Region of the service
    --path / -p ........................ Path to JSON or YAML file holding input data
    --type / -t ........................ Type of invocation
    --log / -l ......................... Trigger logging data output
    --data / -d ........................ input data
```

We'll use `sls invoke -f hello` to invoke our function:

```
$ sls invoke -f hello
{
    "statusCode": 200,
    "body": "{\"message\":\"Hello Code(Her) Conf!\",\"input\":{}}"
}
```

We see the JSON result that we previously say in our `handler.js` source code. Recall that we also logged "Hello Code(Her) Conf!" using `console.log` as well. Let's see if that made it into our logs using `sls logs`. Our options are:


```
$ sls logs -h 
Plugin: Logs
logs .......................... Output the logs of a deployed function
    --function / -f (required) ......... The function name
    --stage / -s ....................... Stage of the service
    --region / -r ...................... Region of the service
    --tail / -t ........................ Tail the log output
    --startTime ........................ Logs before this time will not be displayed
    --filter ........................... A filter pattern
    --interval / -i .................... Tail polling interval in milliseconds. Default: `1000`
```

Same as before, we'll need to specify `-f` and pass the function name for which we wish to see the logs:

```
$ sls logs -f hello
START RequestId: 5dfc7484-9a26-11e7-aa6f-ed7ba20730fa Version: $LATEST
2017-09-15 10:58:43.679 (-04:00)    5dfc7484-9a26-11e7-aa6f-ed7ba20730fa    Hello Code(Her) Conf!
END RequestId: 5dfc7484-9a26-11e7-aa6f-ed7ba20730faSTART RequestId: aa724708-9a26-11e7-a910-5509f0fd9ee5 Version: $LATEST
```

And there it is in the logs. Progress! Time to set up our Slack app.

> Note: You can keep a separate window open that "tails" (aka streams as new updates come in) your logs as you work with the `--tail` or `-t` flag.
# Build a Serverless Chat Bot
**Code(Her) Conference 2017 Workshop**

## Overview
* What is "serverless" and why should I care?
* Setup
** AWS Account
** AWS CLI
** NodeJS
* Getting comfortable working with serverless
** Serverless Framework CLI setup
** Walkthrough and code-along of example Lambda function
* What are we building? (Slack bot demo)
* Building our Slack bot
** Slack team setup
** Slack app setup
** Walkthrough and code-along
* Recap and next steps

## What is "serverless" and why should I care?

* "Serverless Computing" explained
** Does not mean running code without servers. There's always a server :)
* Related terms
** Backed as a Service or "BaaS"
** Function as a Service or "FaaS"
* The main benefits
** "Decreased time to market" and what that means
** "Enhanced scalability" and what that means
** "Low Cost" and what that means
* Some of the drawbacks
** You give up a lot of control in exchange.
** Debugging and monitoring remote function execution is painful.
** You're entering the land of Distributed Systems and that requires new knowledge acquisition if you're used to traditional web application development (e.g. Rails, Django, etc).
** Architectural complexity
*** from one app to multiple independent functions executing asynchronously
*** function orchestration is hard and usually requires cloud provider to make tools available to ease that process
* Resources & Reads
** The ["Serverless Framework"](https://serverless.com/)  - Open Source tooling to help manage serverless computing infrastructure on Cloud Providers (We'll be using this throughout the workshop.)
** [AWS Lambda](https://aws.amazon.com/lambda/)
** [Google Cloud Functions](https://cloud.google.com/functions/)
** [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)
** [Serverless Architectures](https://martinfowler.com/articles/serverless.html) - A thorough (and technical) breakdown of how to think of serverless. Highly recommended.

## Setup
In order to try out any of this "serverless computing" awesomeness (on AWS) we need to set up a few things:

1. An [AWS account](http://docs.aws.amazon.com/lambda/latest/dg/setting-up.html) (if you don't already have one)
2. The [AWS CLI](http://docs.aws.amazon.com/lambda/latest/dg/setup-awscli.html) tool and configure it to use an IAM account (that is not the root owner of the AWS account for security reasons--you want this)
3. [NodeJS](https://nodejs.org/en/)

> Verify set up with instructor.

Next up: **Getting comfortable working with serverless**
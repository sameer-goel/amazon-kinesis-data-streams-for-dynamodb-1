
## To deploy

You can deploy this app and the back end infrastructure in one of two ways:
 
1. One click deploy button
2. The Amplify CLI

### Requirements for deployment
* <a href="https://aws.amazon.com/cli/" target="_blank">AWS CLI</a>
* Forked copy of this repository. Instructions for forking a GitHib repository can be found <a href="https://help.github.com/en/github/getting-started-with-github/fork-a-repo" target="_blank">here</a>
* A GitHub personal access token with the *repo* scope as shown below. Instructions for creating a personal access token can be found <a href="https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line#creating-a-token" target="blank">here</a>

    ![Personal access token scopes](./images/pat.png)

    **Be sure and store you new token in a place that you can find it.**

### One click deploy
<a href="https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/sameer-goel/dynamodb-streaming" target="_blank"><img src="./images/deplywithamplifyconsole.png" alt="deplywithamplifyconsole"></a>

### Amplify CLI

1. First install and configure the Amplify CLI.

> For a complete walkthrough of how to configure the CLI, see [this video](https://www.youtube.com/watch?v=fWbM5DLh25U)

```sh
$ npm install -g @aws-amplify/cli
$ amplify configure
```

2. Clone the repo, install dependencies

```sh
$ git clone https://github.com/sameer-goel/dynamodb-streaming
$ cd dynamodb-streaming
$ npm install
```

3. Initialize the app

```sh
$ amplify init

? Enter a name for the environment: dev (or your preferred env name)
? Choose your default editor: (your preferred editor)
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: your-profile-name

? Do you want to configure Lambda Triggers for Cognito? No
```

4. Deploy the back end

```sh
$ amplify push --y
```

5. Run the app

```sh
$ npm start
```

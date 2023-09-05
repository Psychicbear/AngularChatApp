# Angular Chat App

## Git Structure
Git repository primarily uses the main branch during development. This branch contains both the client source code within `./src` and the server source code within `./server`.

Changes made to the code is committed regularly, often occurring after a feature has been implemented/updated and tested. This allows developers to investigate any arising issues that occur from a particular feature update and revert if needed.
## Data Structures
Data types and structures vary between client and server, however the core data structures can be simplified as follows:

### User
```ts
id: <string>,
name: <string>,
email: <string>,
password: <string>,
groups: <string>[],
roles: <string, string>[]
```
User specifies the data representing the end user of the application.

- `id` provides the object with a universal unique identifier (uuid) as a string.
- `name` is used for identification on the front end.
- `email` is the user's email used for registration and login.
- `password` is used for registration/login authorisation.
- `groups` contains the ids of the groups which the user is a part of.
- `roles` is an array of objects where the key is the groupId, and the value is the permission level. It is used to determine what the user is permitted to see on the front-end.

### Group
```ts
id: <string>,
name: <string>,
desc: <string>,
channels: <Channel>[]
```
Group represents the groups which users can join and interact with.

- `id` provides a uuid as a string.
- `name` is what displays on the front end.
- `desc` is for including additional info about the group.
- `channels` is an array of channels which the user can interact with.

### Channel
```ts
id: <string>,
name: <string>,
desc: <string>,
messages: <Message>[]
```
Channel represents the individual chat rooms where users can send messages to one another.

- `id` provides uuid as string.
- `name` is displayed on front end.
- `desc` is additional info about the channel.
- `messages`: is an array of messages sent by the users.

### Message
```ts
id: <string>,
user: <string>,
content: <string>,
timestamp: <Date>
```
Message represents the messages sent by the users

- `id` provides uuid as string.
- `user` is the uuid of the user whom sent the message.
- `content` is the message content that the user wrote.
- `timestamp` is the exact time the user sent the message as unix time.

## Angular Architecture

## Server Architecture

## Server Routes

## Front-end/Back-end Interactions
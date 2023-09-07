# Angular Chat App

# Git Structure
Git repository primarily uses the main branch during development. This branch contains both the client source code within `./src` and the server source code within `./server`.

Changes made to the code is committed regularly, often occurring after a feature has been implemented/updated and tested. This allows developers to investigate any arising issues that occur from a particular feature update and revert if needed.
# Data Structures
Data types and structures vary between client and server, however the core data structures can be simplified as follows:

## User
```ts
id: string,
name: string,
email: string,
password: string,
groups: string[],
roles: {global: string, [key: string]: string}
```
User specifies the data representing the end user of the application.

- `id` provides the object with a universal unique identifier (uuid) as a string.
- `name` is used for identification on the front end.
- `email` is the user's email used for registration and login.
- `password` is used for registration/login authorisation.
- `groups` contains the ids of the groups which the user is a part of.
- `roles` an object containing a default `global` key with the value indicating the permission level of the user. It also contains each group that the user is part of as a key, with the value indicating the permission level of the user within said group. 

## Group
```ts
id: string,
name: string,
desc: string,
channels: Channel[]
```
Group represents the groups which users can join and interact with.

- `id` provides a uuid as a string.
- `name` is what displays on the front end.
- `desc` is for including additional info about the group.
- `channels` is an array of channels which the user can interact with.

## Channel
```ts
id: string,
name: string,
desc: string,
messages: Message[]
```
Channel represents the individual chat rooms where users can send messages to one another.

- `id` provides uuid as string.
- `name` is displayed on front end.
- `desc` is additional info about the channel.
- `messages`: is an array of messages sent by the users.

## Message
```ts
id: string,
user: string,
content: string,
timestamp: Date
```
Message represents the messages sent by the users

- `id` provides uuid as string.
- `user` is the uuid of the user whom sent the message.
- `content` is the message content that the user wrote.
- `timestamp` is the exact time the user sent the message as unix time.

# Angular Architecture
The client uses the Angular JavaScript framework to enforce type safety and reactive design patterns. Components were created as NG-Modules initially, but upgraded to standalone components later on, potentially leaving behind redundant code.

## Components
### Auth Service
The Auth service is used for authenticating user and tracking the currently logged in user's data, passing necessary values into each component. The main function of this service is to enforce data persistence using localStorage and Observables, and enable HTTP requests to the server.

### Auth Guard
The Auth Guard is a simple route guard which prevents unauthorised users from accessing the application's various routes if they are not logged in. It depends on the Auth Service and checks it to determine whether to allow access to routes other than the login page.

### Login Component
Route: `/login`<br>
The Login Component provides users with a login/register page to enable access to the applications features. Users will fill out either the login form or register form, and allow users to authorise with the Auth Service.

### Group Component
Route: `/`<br>
The Group Component provides the user with a list of all the groups available on the application, and allows users to access groups that they are members of. This page also allows users to request to join groups they are not a member of. Administrators may also use this page to create new groups and delete existing ones.

### Channel Component
Route: `/groups/:id`<br>
The Channel Component provides users with a list of available channels within the group they have selected. The group is selected using the id parameter found within the URL. Users can click on a channel to reveal the chat menu for it. This page also allows group administrators to promote or ban users, create or edit channels, and moderate the chat within channels.

## Models
Models are found within the `./src/app/classes` folder and are split into Group and User related models.

### Group/IdentifiableObj
IdentifiableObj is an interface not intended to be used by itself, but rather to be extended by other types which share the same/similar structure.
`id: string`

# Server Architecture
The server is located within the `./server` directory of the repo. The server is run on Node.js, and is run via the server.js file. The main http server uses express js to serve data to clients via a number of GET and POST requests.

## Routes
All server routes are located within the `./server/routes` folder and are exported from .js files. Routes related to user management are found within userRoutes.js and routes related to group management are found within groupRoutes.js. This decision was made to improve code maintainability whilst avoiding creating too many files.

## Data Models
The aim with server side data models was to replicate the general functionality of ODM packages such as Mongoose for the local JSON database. Data models can be found within the `./server/models` folder as JS Classes to enforce typing within vanilla JS.

## Data Storage/Serialisation
All Data Models include a method to serialise their data, reducing the class instance to an object which can be saved to a JSON file. User data is saved within the 'users.json' file, and group data is saved within the 'groups.json' file. Whenever a piece of data is modified by a route, that route will trigger a save function on the modified data, saving the JSON file with the new data.


# Server Routes
## API route
All API calls are to be sent to the route at `./api/`. All responses from the API will return an object containing `{success: boolean}` indicating whether or not the process completed as intended. If the process fails, the returning object will also return `{err: string}` containing an error message
## User Management
### Login
|:--|:--|
|**Description**|This route authenticates user login requests. If authentication succeeds then server responds with the User object (not including password) and otherwise returns an error|
|**Route**|`/api/login`|
|**Method**|`POST`|
|**Parameters**|`{ email: string, password: string }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Get User
|:--|:--|
|**Description**|This route takes a user ID in the URL, and searches the database for a user with the same ID. The route is used populating user details within a page
|**Route**|`/api/user/:id`|
|**Method**|`GET`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Get Users By Group
|:--|:--|
|**Description**|Takes a group ID in the URL, and searches the database for all users which contain the group ID within their group list. This route is used for fetching a list of users for displaying group participants.
|**Route**|`/api/user/byGroup/:id`|
|**Method**|`GET`|
|**Return Value**|`{ users: User[], success: boolean, err?: string }`|

### Create User
|:--|:--|
|**Description**|Takes new user credentials and creates a new User within the database if their credentials don't already exist within the database. This route is used for user registration.
|**Route**|`/api/register`|
|**Method**|`POST`|
|**Parameters**|`{ email: string, username: string, password: string }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Edit User
|:--|:--|
|**Description**|Takes new user credentials and creates a new User within the database if their credentials don't already exist within the database. This route is used for user registration.
|**Route**|`/api/editUser`|
|**Method**|`POST`|
|**Parameters**|`{ email: string, username: string }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

## Group Management
### Get Group
|:--|:--|
|**Description**|Takes group ID as URL params, returns a group with matching ID if found. This route is used for displaying group details
|**Route**|`/api/group/:id`|
|**Method**|`GET`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Get Groups
|:--|:--|
|**Description**|Simply returns a list of all the groups that exist within the database. This route is used for the group list page.
|**Route**|`/api/groups`|
|**Method**|`GET`|
|**Return Value**|`{ groups: Group[], success: boolean, err?: string }`|

### Get Requests
|:--|:--|
|**Description**|Takes a group ID as URL params, returns a list of user IDs of whom have requested to join the group.
|**Route**|`/api/requests/:id`|
|**Method**|`GET`|
|**Return Value**|`{ requests: string[], success: boolean, err?: string }`|

### Create Group
|:--|:--|
|**Description**|Takes a group name and description, creates a new Group within the database and returns it if successful.
|**Route**|`/api/addGroup`|
|**Method**|`POST`|
|**Parameters**|`{ name: string, desc: string }`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Edit Group
|:--|:--|
|**Description**|Takes new group name and description, applies new attributes to group matching id and returns the modified group if successful.
|**Route**|`/api/editGroup`|
|**Method**|`POST`|
|**Parameters**|`{ name: string, desc: string }`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Delete Group
|:--|:--|
|**Description**|Takes group id, deletes group from database if found.
|**Route**|`/api/deleteGroup`|
|**Method**|`POST`|
|**Parameters**|`{ id: string }`|
|**Return Value**|`{ removed: Group, success: boolean, err?: string }`|

### Request Join
|:--|:--|
|**Description**|Takes user id and group id, adds user id to the request array of the group with matching id. Returns the user id on success
|**Route**|`/api/requestJoin`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string }`|
|**Return Value**|`{ user: string, success: boolean, err?: string }`|

### Accept Request
|:--|:--|
|**Description**|Takes user id and group id, adds the user to the respective group by removing the user id from request list, and adding the group to the user data
|**Route**|`/api/acceptRequest`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string }`|
|**Return Value**|`{ user: string, joined: groupId, success: boolean, err?: string }`|

### Accept Request
|:--|:--|
|**Description**|Takes user id and group id, removes the user id from the group's request array.
|**Route**|`/api/denyRequest`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string }`|
|**Return Value**|`{ user: string, denied: groupId, success: boolean, err?: string }`|

## Channel Management
### Get Channels
|:--|:--|
|**Description**|Takes group Id in URL params, gets all channels from the selected group. This route is for displaying the list of channels.
|**Route**|`/api/channels/:id`|
|**Method**|`GET`|
|**Return Value**|`{ channels: Channel[], success: boolean, err?: string }`|

### Add Channel
|:--|:--|
|**Description**|Creates a new Channel within the Group matching id using the name and desc params. Returns the affected Group if successful
|**Route**|`/api/addChannel`|
|**Method**|`POST`|
|**Parameters**|`{ id: string, name: string, desc: string }`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|


### Edit Channel
|:--|:--|
|**Description**|Applies the name and desc attributes to the channel matching the chanId within the group matching the groupId. Returns the affected Group if successful
|**Route**|`/api/editChannel`|
|**Method**|`POST`|
|**Parameters**|`{ groupId: string, chanId: string, name: string, desc: string }`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Delete Channel
|:--|:--|
|**Description**|Deletes the channel matching chanId from the group matching groupId, returning the removed Channel on success.
|**Route**|`/api/denyRequest`|
|**Method**|`POST`|
|**Parameters**|`{ groupId: string, chanId: string }`|
|**Return Value**|`{ removed: Channel, success: boolean, err?: string }`|


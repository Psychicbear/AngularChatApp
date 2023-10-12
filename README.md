# Angular Chat App

# Git Structure
Git repository primarily uses the main branch during development. This branch contains both the client source code within `./src` and the server source code within `./server`.

Changes made to the code is committed regularly, often occurring after a feature has been implemented/updated and tested. This allows developers to investigate any arising issues that occur from a particular feature update and revert if needed.
# Data Structures
Data types and structures vary between client and server, however the core data structures can be simplified as follows:

## User
```ts
_id: string,
name: string,
email: string,
password: string,
groups: string[],
roles: {global: string, [key: string]: string}
img?: string
```
User specifies the data representing the end user of the application.

- `_id` provides the object with a mongoDB ObjectID as a string.
- `name` is used for identification on the front end.
- `email` is the user's email used for registration and login.
- `password` is used for registration/login authorisation.
- `groups` contains the ids of the groups which the user is a part of.
- `roles` an object containing a default `global` key with the value indicating the permission level of the user. It also contains each group that the user is part of as a key, with the value indicating the permission level of the user within said group. 
- `img` is an optional parameter containing the file name of the user's profile picture stored on the server
## Group
```ts
_id: string,
name: string,
desc: string,
channels: Channel[]
```
Group represents the groups which users can join and interact with.

- `_id` provides mongoDB id as a string.
- `name` is what displays on the front end.
- `desc` is for including additional info about the group.
- `channels` is an array of channels which the user can interact with.

## Channel
```ts
_id: string,
name: string,
desc: string,
messages: Message[]
```
Channel represents the individual chat rooms where users can send messages to one another.

- `_id` provides mongoDB id as string.
- `name` is displayed on front end.
- `desc` is additional info about the channel.
- `messages`: is an array of messages sent by the users.

## Message
```ts
user: string,
content: string,
timestamp: Date
```
Message represents the messages sent by the users

- `user` is the id of the user whom sent the message.
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

## Controllers
The `./server/controllers` contains various classes which assist in controlling the flow of data between the client, server and mongoDB instance.
 - **database.js** contains a DatabaseWrapper class used for simplifying database operations, and implements custom functions which run on the `MongoClient` instance.
 - **validate.js** contains a small class for simplifying and streamlining responses to the client from the server. It ensures that all responses follow a particular structure.

## Data Storage/Serialisation
All data models are saved and loaded using mongoDB, with the express server connecting to the instance and forwarding commands from the client to modify data. Each data model is saved in a respective collection with the database, and is modified using the functions within the database wrapper class in `./controllers/database.js`.

## End to End (e2e) Testing
Using the cypress testing library which is standard for Angular, a number of test files have been written which test both front and back end interaction. Using the command `ng e2e` will launch the graphical interface for cypress, where you can select the browser to test in. This will launch a browser instance with a testing page, where clicking on a .cy.ts file will launch the tests within the file. Currently tests run through to test all CRUD operations on the front end application, and basic user interactions.

# Server Routes
## API route
All API calls are to be sent to the route at `./api/`. All responses from the API will return an object containing `{success: boolean}` indicating whether or not the process completed as intended. If the process fails, the returning object will also return `{err: string}` containing an error message
## User Management
### Login
|||
|:--|:--|
|**Description**|This route authenticates user login requests. If authentication succeeds then server responds with the User object (not including password) and otherwise returns an error|
|**Route**|`/api/login`|
|**Method**|`POST`|
|**Parameters**|`{ email: string, password: string }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Get User
|||
|:--|:--|
|**Description**|This route takes a user ID in the URL, and searches the database for a user with the same ID. The route is used populating user details within a page
|**Route**|`/api/user/:id`|
|**Method**|`GET`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Get Users By Group
|||
|:--|:--|
|**Description**|Takes a group ID in the URL, and searches the database for all users which contain the group ID within their group list. This route is used for fetching a list of users for displaying group participants.
|**Route**|`/api/user/byGroup/:id`|
|**Method**|`GET`|
|**Return Value**|`{ users: User[], success: boolean, err?: string }`|

### Create User
|||
|:--|:--|
|**Description**|Takes new user credentials and creates a new User within the database if their credentials don't already exist within the database. This route is used for user registration.
|**Route**|`/api/register`|
|**Method**|`POST`|
|**Parameters**|`{ email: string, username: string, password: string }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Edit User
|||
|:--|:--|
|**Description**|Takes an edited user object and uses it to save new data to the user in the database.
|**Route**|`/api/editUser`|
|**Method**|`POST`|
|**Parameters**|`{ user: User }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Delete User
|||
|:--|:--|
|**Description**|Uses the passed in id to delete a user from the database
|**Route**|`/api/deleteUser`|
|**Method**|`POST`|
|**Parameters**|`{ id: string }`|
|**Return Value**|`{ deleted: User , success: boolean, err?: string }`|

### Upload Profile Pic
|||
|:--|:--|
|**Description**|Takes an image file and uploads it to the server, using the userId to save the filename to the img parameter of a user within the database
|**Route**|`/api/user/upload`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, img: File }`|
|**Return Value**|`{ imgUrl: string, success: boolean, err?: string }`|

### Update User Role
|||
|:--|:--|
|**Description**|Uses the userId to select a user in the database, groupId to select the role of the user, and changes said role to the value of update
|**Route**|`/api/user/updateRole`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string, update: string}`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

### Ban User
|||
|:--|:--|
|**Description**|Uses the groupId to remove the group and role from the user selected with userId, kicking the user from the group
|**Route**|`/api/user/ban`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId }`|
|**Return Value**|`{ ...User, success: boolean, err?: string }`|

## Group Management
### Get Group
|||
|:--|:--|
|**Description**|Takes group ID as URL params, returns a group with matching ID if found. This route is used for displaying group details
|**Route**|`/api/group/:id`|
|**Method**|`GET`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Get Groups
|||
|:--|:--|
|**Description**|Uses the passed in user id in params to get an array of groups that the user is in, and a list of the remaining groups that the user can request to join
|**Route**|`/api/groups/:id`|
|**Method**|`GET`|
|**Return Value**|`{ user: Group[], remaining: Group[], success: boolean, err?: string }`|

### Get Requests
|||
|:--|:--|
|**Description**|Takes a group ID as URL params, returns a list of user IDs of whom have requested to join the group.
|**Route**|`/api/requests/:id`|
|**Method**|`GET`|
|**Return Value**|`{ requests: string[], success: boolean, err?: string }`|

### Create Group
|||
|:--|:--|
|**Description**|Takes a group name and description, creates a new Group within the database and returns it if successful.
|**Route**|`/api/addGroup`|
|**Method**|`POST`|
|**Parameters**|`{ name: string, desc: string }`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Edit Group
|||
|:--|:--|
|**Description**|Takes an updated Group object, sets it to the group matching it's id within the database
|**Route**|`/api/editGroup`|
|**Method**|`POST`|
|**Parameters**|`{ name: string, desc: string }`|
|**Return Value**|`{ ...Group, success: boolean, err?: string }`|

### Delete Group
|||
|:--|:--|
|**Description**|Takes group id, deletes group from database if found.
|**Route**|`/api/deleteGroup`|
|**Method**|`POST`|
|**Parameters**|`{ id: string }`|
|**Return Value**|`{ removed: Group, success: boolean, err?: string }`|

### Request Join
|||
|:--|:--|
|**Description**|Takes user id and group id, adds user id to the request array of the group with matching id. Returns the user id on success
|**Route**|`/api/requestJoin`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string }`|
|**Return Value**|`{ user: string, success: boolean, err?: string }`|

### Accept Request
|||
|:--|:--|
|**Description**|Takes user id and group id, adds the user to the respective group by removing the user id from request list, and adding the group to the user data
|**Route**|`/api/acceptRequest`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string }`|
|**Return Value**|`{ user: string, joined: groupId, success: boolean, err?: string }`|

### Deny Request
|||
|:--|:--|
|**Description**|Takes user id and group id, removes the user id from the group's request array.
|**Route**|`/api/denyRequest`|
|**Method**|`POST`|
|**Parameters**|`{ userId: string, groupId: string }`|
|**Return Value**|`{ user: string, denied: groupId, success: boolean, err?: string }`|

## Channel Management
### Get Channels
|||
|:--|:--|
|**Description**|Takes a list of channel ids found within a group, returns all the channel objects using these ids
|**Route**|`/api/channels/`|
|**Method**|`POST`|
|**Parameters**|`{ channels: string[]}`|
|**Return Value**|`{ channels: Channel[], success: boolean, err?: string }`|

### Get Channel
|||
|:--|:--|
|**Description**|Takes a channel id in url params, returns the channel matching the id
|**Route**|`/api/channels/:id`|
|**Method**|`GET`|
|**Return Value**|`{ ...Channel, success: boolean, err?: string }`|

### Add Channel
|||
|:--|:--|
|**Description**|Creates a new Channel within the Group matching id using the name and desc params. Returns the channel if successful
|**Route**|`/api/addChannel`|
|**Method**|`POST`|
|**Parameters**|`{ id: string, name: string, desc: string }`|
|**Return Value**|`{ ...Channel, success: boolean, err?: string }`|


### Edit Channel
|||
|:--|:--|
|**Description**|Takes an updated Channel object and sets it to the channelId within the database
|**Route**|`/api/editChannel`|
|**Method**|`POST`|
|**Parameters**|`{ channel: Channel }`|
|**Return Value**|`{ ...Channel, success: boolean, err?: string }`|

### Delete Channel
|||
|:--|:--|
|**Description**|Deletes the channel matching chanId from the group matching groupId, returning the removed Channel on success.
|**Route**|`/api/deleteChannel`|
|**Method**|`POST`|
|**Parameters**|`{ chanId: string }`|
|**Return Value**|`{ deleted: Channel, success: boolean, err?: string }`|


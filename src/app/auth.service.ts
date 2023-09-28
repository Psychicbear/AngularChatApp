import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs';
import { User, Roles } from './classes/user';
import { Channel, Group } from './classes/group';
import { Socket, io } from 'socket.io-client';


interface GenericResponse<T> {
  (args: T): T,
  success: boolean,
  err?: string
}






@Injectable({
  providedIn: 'root'
})
export class AuthService{
  user: BehaviorSubject<User> = new BehaviorSubject({_id: '', username: '', email: '', roles: {global: ''}, groups: []} as User)
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false)
  isSuper: BehaviorSubject<boolean> = new BehaviorSubject(false)
  remember?: boolean
  _id: string = ''
  username: string = ''
  email: string = ''
  groups: string[] = []
  roles: Roles = {global: ''}
  cachedUsers: User[] = []
  socket?: Socket

  constructor(private http: HttpClient) {
    //Loads login data from session or local storage
    let existing = sessionStorage.getItem('user')
    if(!existing){
      existing = localStorage.getItem('user')
    } 

    //Loads found data into auth service and connects to socket
    if(existing){
      this.user.next(JSON.parse(existing) as User)
      this.socket = io('http://localhost:3000')
    }

    //Loads necessary behavioursubjects which components will monitor for changes.
    //Individual user attribute assignment may no longer be necessary
    this.user.subscribe(data => {
      this.isAuthenticated.next(data._id != '')
      console.log(data._id != '' ? "User is Authenticated" : "User is not logged in")
      this.isSuper.next(data.roles.global == 'super')
      console.log(data.roles.global == 'super' ? "User is Super" : "User is not Super")
      this._id = data._id
      this.username = data.username
      this.email = data.email
      this.roles = data.roles
      console.log(data.groups)
      this.groups = data.groups
      
    })
  }


  getSelf(){
    return this.user.asObservable()
  }


  //Loops through user roles and finds one which matches passed in ID
  getRole(id: string){
    let role = ''
    for (const [key, value] of Object.entries(this.roles)) {
      if(key == id) role = value
    }

    return role
  }


  isLoggedIn(){
    return this.isAuthenticated.getValue()
  }


  updateUserDB(user: User){
    return this.http.post<GenericResponse<User>>('http://localhost:3000/api/updateme', user, {headers: {'ContentType': 'Application/json'}})
  }

  //Saves login to session storage, saving also to local storage if remember me is ticked
  saveSession(user: User, remember: boolean = false){
    sessionStorage.setItem('user', JSON.stringify(user))
    if(remember){
      localStorage.setItem('user', JSON.stringify(user))
    }
    this.remember = remember
    this.user.next(user)
  }

  //Returns observable which sends request on subscribe
  login(email: string, password: string): Observable<any>  {
    let jsonData = {email: email, password: password}
    console.log('Creating observable')
    let req = this.http.post<any>('http://localhost:3000/api/login', jsonData, {headers: {'ContentType': 'Application/json'}})
    return req
  }

  
  register(email: string, username:string, password: string){
    return this.http.post<any>('http://localhost:3000/api/register', {email: email, username: username, password: password}, {headers: {'ContentType': 'Application/json'}})
  }

  logout(){
    sessionStorage.clear()
    localStorage.clear()
    this.user.next({_id: '', username: '', email: '', roles: {global: ''}, groups: []} as User)
  }

  getGroups(){
    return this.http.get<any>('http://localhost:3000/api/groups')
  }

  getRequests(id: string){
    return this.http.get<any>('http://localhost:3000/api/requests/' + id)
  }

  requestJoin(userId: string, groupId: string){
    return this.http.post<GenericResponse<any>>('http://localhost:3000/api/requestJoin', {userId: userId, groupId: groupId} , {headers: {'ContentType': 'Application/json'}})
  }

  acceptRequest(userId: string, groupId: string){
    return this.http.post<GenericResponse<any>>('http://localhost:3000/api/acceptRequest', {userId: userId, groupId: groupId} , {headers: {'ContentType': 'Application/json'}})
  }

  denyRequest(userId: string, groupId: string){
    return this.http.post<GenericResponse<any>>('http://localhost:3000/api/denyRequest', {userId: userId, groupId: groupId} , {headers: {'ContentType': 'Application/json'}})
  }

  getUser(id: string){
    return this.http.get<any>('http://localhost:3000/api/user/' + id)
  }

  //WIP, pulls user data from either cachedUsers or api
  fetchUser(id: string){
    let user = this.cachedUsers.find(user => user._id == id)
    let local = of(user)
    let api = this.getUser(id)
    
  }

  editUser(user: User){
    return this.http.post<GenericResponse<User>>('http://localhost:3000/api/editUser', user, {headers: {'ContentType': 'Application/json'}})
  }

  deleteAccount(){
    return this.http.post<any>('http://localhost:3000/api/deleteUser', {id: this._id}, {headers: {'ContentType': 'Application/json'}})
  }

  getChannels(groupId: string){
    return this.http.get<any>('http://localhost:3000/api/channels/' + groupId)
  }

  getUsersInGroup(groupId: string){
    return this.http.get<any>('http://localhost:3000/api/user/byGroup/' + groupId)
  }

  getGroup(id: string){
    return this.http.get<any>('http://localhost:3000/api/group/' + id)
  }

  addGroup(name: string, desc: string){
    return this.http.post<GenericResponse<Group>>('http://localhost:3000/api/addGroup', {name: name, desc: desc}, {headers: {'ContentType': 'Application/json'}})
  }

  editGroup(group: Group){
    return this.http.post<GenericResponse<Group>>('http://localhost:3000/api/editGroup', {update: group}, {headers: {'ContentType': 'Application/json'}})
  }

  deleteGroup(id: string){
    return this.http.post<any>('http://localhost:3000/api/deleteGroup', {id: id}, {headers: {'ContentType': 'Application/json'}})
  }

  addChannel(groupId: string, name: string, desc: string){
    return this.http.post<GenericResponse<Group>>('http://localhost:3000/api/addChannel', {id: groupId, name: name, desc: desc}, {headers: {'ContentType': 'Application/json'}})
  }

  editChannel(groupId: string, chanId: string, name: string, desc: string){
    return this.http.post<GenericResponse<Channel>>('http://localhost:3000/api/editChannel', {groupId: groupId, chanId: chanId, name: name, desc: desc}, {headers: {'ContentType': 'Application/json'}})
  }

  deleteChannel(groupId: string, chanId: string){
    return this.http.post<any>('http://localhost:3000/api/deleteChannel', {groupId: groupId, chanId: chanId}, {headers: {'ContentType': 'Application/json'}})
  }
}

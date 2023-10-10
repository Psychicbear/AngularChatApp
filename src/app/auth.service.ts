import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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
  _id: BehaviorSubject<string> = new BehaviorSubject('')
  remember?: boolean
  socket: Socket

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000')
    //Loads login data from session or local storage
    let existing = sessionStorage.getItem('user')
    if(!existing){
      existing = localStorage.getItem('user')
    } 

    //Loads found data into auth service and connects to socket
    if(existing){
      let user = JSON.parse(existing) as User
      this.user.next(user)
      this.socket.emit('auth', user._id)
    }

    //Loads necessary behavioursubjects which components will monitor for changes.
    //Individual user attribute assignment may no longer be necessary
    this.user.subscribe(data => {
      this.isAuthenticated.next(data._id != '')
      console.log(data._id != '' ? "User is Authenticated" : "User is not logged in")
      this.isSuper.next(data.roles.global == 'super')
      this._id.next(data._id)
    })
  }


  getSelf(){
    return this.user.asObservable()
  }


  //Loops through user roles and finds one which matches passed in ID
  getRole(id: string){
    let role = ''
    for (const [key, value] of Object.entries(this.user.getValue().roles)) {
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
    this.socket.emit('auth', user._id)
  }

  //Returns observable which sends request on subscribe
  login(email: string, password: string): Observable<any>  {
    return this.http.post<any>('http://localhost:3000/api/login', {email: email, password: password}, {headers: {'ContentType': 'Application/json'}})
  }

  
  register(email: string, username:string, password: string){
    return this.http.post<any>('http://localhost:3000/api/register', {email: email, username: username, password: password}, {headers: {'ContentType': 'Application/json'}})
  }

  logout(){
    sessionStorage.clear()
    localStorage.clear()
    this.user.next({_id: '', username: '', email: '', roles: {global: ''}, groups: []} as User)
    this.socket.emit('deauth')
  }

  getGroups(){
    return this.http.get<any>('http://localhost:3000/api/groups/' + this._id.getValue())
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


  editUser(user: User){
    return this.http.post<GenericResponse<User>>('http://localhost:3000/api/editUser', user, {headers: {'ContentType': 'Application/json'}})
  }

  deleteAccount(){
    return this.http.post<any>('http://localhost:3000/api/deleteUser', {id: this.user.getValue()._id}, {headers: {'ContentType': 'Application/json'}})
  }

  getChannels(channels: string[]){
    return this.http.post<any>('http://localhost:3000/api/channels/', {channels: channels}, {headers: {'ContentType': 'Application/json'}})
  }
  
  getChannel(id: string){
    return this.http.get<any>('http://localhost:3000/api/channels/' + id)
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

  editChannel(channel: Channel){
    return this.http.post<GenericResponse<Channel>>('http://localhost:3000/api/editChannel', {channel: channel}, {headers: {'ContentType': 'Application/json'}})
  }

  deleteChannel(groupId: string, chanId: string){
    return this.http.post<any>('http://localhost:3000/api/deleteChannel', {groupId: groupId, chanId: chanId}, {headers: {'ContentType': 'Application/json'}})
  }

  uploadImage(content:any){
    return this.http.post<any>('http://localhost:3000/api/upload', content, {headers: {'ContentType': 'Application/json'}})
  }
}

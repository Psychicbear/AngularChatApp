import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Roles } from './classes/user';
import { Group } from './classes/group';


interface GenericResponse<T> {
  (args: T): T,
  success: boolean,
  err?: string
}






@Injectable({
  providedIn: 'root'
})
export class AuthService{
  user: BehaviorSubject<User> = new BehaviorSubject({id: '', username: '', email: '', roles: {global: ''}, groups: []} as User)
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false)
  isSuper: BehaviorSubject<boolean> = new BehaviorSubject(false)
  remember?: boolean
  id: string = ''
  username: string = ''
  email: string = ''
  groups: string[] = []
  roles: Roles = {global: ''}


  constructor(private http: HttpClient) {
    let existing = sessionStorage.getItem('user')
    if(!existing){
      existing = localStorage.getItem('user')
    } 

    if(existing){
      this.user.next(JSON.parse(existing) as User)
    }

    this.user.subscribe(data => {
      this.isAuthenticated.next(data.id != '')
      console.log(data.id != '' ? "User is Authenticated" : "User is not logged in")
      this.isSuper.next(data.roles.global == 'super')
      console.log(data.roles.global == 'super' ? "User is Super" : "User is not Super")
      this.id = data.id
      this.username = data.username
      this.email = data.email
      this.roles = data.roles
      this.groups = data.groups
      
    })
  }

  getSelf(){
    return this.user.asObservable()
  }

  isLoggedIn(){
    return this.isAuthenticated
  }


  updateUserDB(user: User){
    return this.http.post<GenericResponse<User>>('http://localhost:3000/api/updateme', user, {headers: {'ContentType': 'Application/json'}})
  }

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
    this.user.next({id: '', username: '', email: '', roles: {global: ''}, groups: []} as User)
  }

  getGroups(){
    return this.http.get<any>('http://localhost:3000/api/groups')
  }

  requestJoin(userId: string, groupId: string){
    return this.http.post<GenericResponse<any>>('http://localhost:3000/api/requestJoin', {userId: userId, groupId: groupId} , {headers: {'ContentType': 'Application/json'}})
  }

  getUser(id: string){
    this.http.get<any>('http://localhost:3000/api/user/' + id)
  }

  editUser(user: User){
    return this.http.post<GenericResponse<User>>('http://localhost:3000/api/editUser', user, {headers: {'ContentType': 'Application/json'}})
  }





}

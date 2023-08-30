import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './classes/user';







@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit{
  user: BehaviorSubject<User> = new BehaviorSubject({})
  isAuthenticated: boolean = false
  
  ngOnInit(): void {
    let existing = sessionStorage.getItem('user')
    if(!existing){existing = localStorage.getItem('user')} 

    if(existing){
      this.user.next(existing as User)
      this.isAuthenticated = true
    }
  }
  constructor(private http: HttpClient) {

  }

  getUser(){
    return this.user.asObservable()
  }

  isLoggedIn(){
    return this.isAuthenticated
  }


  updateUserDB(user: User){
    return this.http.post<any>('http://localhost:3000/api/updateme', user, {headers: {'ContentType': 'Application/json'}})
  }

  saveSession(user: User, remember: boolean = false){
    sessionStorage.setItem('user', JSON.stringify(user))
    if(remember){
      localStorage.setItem('user', JSON.stringify(user))
    }
    this.user.next(user)
    this.isAuthenticated = true
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

  getGroups(){
    return this.http.get<any>('http://localhost:3000/api/groups')
  }

  /* 
  Requirements:
  - [x] Check Session storage for user on init
  - [ ] Login as user (for now, check local storage, load auth and session storage with properties, send success )
  - [ ] Log out as user (Clear user properties and session storage)
  - [ ] Edit user account
  - [ ] Permission Level Observable
  - [ ] Change permission level based on group id
  */
}

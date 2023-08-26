import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';



type Role = Record<string, number>
interface User {
  id?: string,
  username?: string,
  email?: string,
  roles?: [Role],
  groups?: [string]
}

interface UserAuth extends User {
  password: string
}
@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit{
  user?: BehaviorSubject<User>
  
  ngOnInit(): void {
    let existing = sessionStorage.getItem('user')

    if(existing){
      this.user = new BehaviorSubject(existing as User)
    }
  }
  constructor(private http: HttpClient) {

  }

  //Returns observable which sends request on subscribe
  login(username: string, password: string): Observable<any>  {
    let req = this.http.post('localhost:3000/api/login', {username: username, password: password})
    return req
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

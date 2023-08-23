import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';



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
  constructor() {

  }

  //WIP, problem: converting successful local storage get item to correct type for handling 
  login(username: string, password: string): {valid: boolean}  {
    let response = {valid: false}
    let storage = localStorage.getItem('users')
    let users: [UserAuth] = storage ? storage : [{id: '', password: ''}]
    let auth = users.find((user) => {user.username == username && user.password == password})

    if(auth){
      const {password: _, ...user} = auth
      this.user = new BehaviorSubject(user)
      response.valid = true
    }
    return response
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

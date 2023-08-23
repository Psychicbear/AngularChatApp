import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgSwitch, NgSwitchDefault, NgSwitchCase } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [NgSwitch, NgSwitchDefault, NgSwitchCase, RouterOutlet]
})
export class AppComponent {
  title = 'chat-app';

  initLocalStorage(){
    let users: any = localStorage.getItem('users')

    if(!users){
      users = [
        { username: 'rjscho', password: 'helloworld', email: 'rjscho@live.com.au', roles: [], groups: [], super: true},
        { 
          username: 'bob', password: 'alice123', email: 'bob@.com.au', 
          roles: [{'g1': 'user'}, {'g2': 'admin'}, {'g4': 'user'}], 
          groups: ['g1', 'g2', 'g4'] 
        },
        { 
          username: 'alice', password: 'bob123', email: 'alice@.com.au', 
          roles: [{'g1': 'admin'}, {'g2': 'user'}, {'g3': 'user'}], 
          groups: ['g1', 'g2', 'g3']
        },
      ]

      localStorage.setItem('users', users)
    }
  }
}

import { Component, inject} from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../classes/user';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class AccountComponent {
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  user$: Observable<User>
  editMode: boolean = false
  error?: string
  
  constructor() {
    this.user$ = this.auth.getSelf()
  }

  saveUser(user: User, username: string, email: string){
    let save = {...user, username: username, email: email}
    this.auth.editUser(save).subscribe( res => {
      console.log(res)
      const {success, ...user} = res

      if(success){
        this.auth.saveSession(user as User, this.auth.remember)
        this.editMode = false
      } else {
        this.error = res.err
      }
      
    })
  }

  deleteAccount(){
    this.auth.deleteAccount().subscribe(res => {
      console.log(res)
      if(res.success){
        this.auth.logout()
        this.router.navigate(['login'])
      }
    })
  }

  changePassword(password: string, confirm: string){

  }
}

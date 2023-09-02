import { Component, inject} from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../classes/user';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class AccountComponent {
  auth = inject(AuthService)
  user$?: Observable<User>
  editMode: boolean = false
  error?: string
  
  constructor() {
    this.user$ = this.auth.getUser()
  }

  saveUser(id: string, username: string, email:string){
    this.auth.editUser(id, {username: username, email: email}).subscribe( res => {
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

  changePassword(password: string, confirm: string){

  }
}

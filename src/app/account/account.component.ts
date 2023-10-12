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
    user.username = username, user.email = email
    this.auth.editUser(user).subscribe( res => {
      console.log(res)

      if(res.success){
        this.auth.saveSession(user as User, this.auth.remember)
        this.editMode = false
      } else {
        this.error = res.err
      }
      
    })
  }

  saveProfilePic(file: HTMLInputElement){
    if(file){
      this.auth.uploadProfilePic(file.files![0]).subscribe(res => {
        console.log(res)
        if(res.success){
          let user = this.auth.user.getValue()
          user.img = res.imgUrl
          this.auth.saveSession(user as User, this.auth.remember)
          this.editMode = false
        } else {
          this.error = res.err
        }
      })
    } else console.log('No file uploaded')
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

}

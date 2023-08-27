import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent {
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  error: boolean = false
  username: string = ""
  password: string = ""


  login() {
    console.log('Attempting login')
    this.auth.login(this.username, this.password).subscribe((data) => {
      console.log(data)
      if(data.success){
        this.router.navigateByUrl('/')
      } else {
        this.error = true
      }
    })
  }
}

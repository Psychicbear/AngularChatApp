import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule, ActivatedRoute, ParamMap } from '@angular/router';


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
  route = inject(ActivatedRoute)
  error?: string
  username: string = ""
  password: string = ""
  register: boolean = false

  styles = {
    active: 'bg-slate-600 text-white',
    inputfield: 'flex flex-1 py-2 gap-2'
  }

  ngOnInit(){
    this.route.data.subscribe(data => {
      console.log(data)
    })
  }

  login(username: string, password: string) {
    console.log('Attempting login')
    this.auth.login(username, password).subscribe((data) => {
      console.log(data)
      if(data.success){
        this.auth.saveSession(data)
        this.router.navigateByUrl('/')
      } else {
        this.error = "Invalid login"
      }
    })
  }

  signup(email: string, username: string, password: string, confirm: string){
    if(password == confirm){
      this.auth.register(email, username, password).subscribe((data) => {
        console.log(data)
        if(data.success){
          this.auth.saveSession(data)
          this.router.navigateByUrl('/')
        } else {
          this.error = data.error
        }
      })
    } else {
      this.error = "Passwords do not match"
    }
  }
}

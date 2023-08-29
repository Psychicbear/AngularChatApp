import { Component, inject} from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../classes/user';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class AccountComponent {
  auth = inject(AuthService)
  user$?: Observable<User>
  constructor() {
    this.user$ = this.auth.getUser()

  }
}

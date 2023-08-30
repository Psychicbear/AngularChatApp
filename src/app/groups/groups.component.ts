import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class GroupsComponent {
  auth: AuthService = inject(AuthService)
  groups$: Observable<any>
  usergroups: any[] = []

  constructor(){
    this.groups$ = this.auth.getGroups()
    this.auth.getUser().subscribe(user => {
      this.usergroups = user.groups || []
    })
  }

  userHasAccess(id: string){
    return this.usergroups.find(group => group == id)
  }
}

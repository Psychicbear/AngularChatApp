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
  usergroups: string[] = []
  userId: string = ''
  requestListName: string = ''
  requestList: string[] = []
  isSuper: boolean = false

  constructor(){
    this.groups$ = this.auth.getGroups()
    this.usergroups = this.auth.groups!
    this.userId = this.auth.id
  }

  userHasAccess(id: string){
    return this.usergroups.find(group => group == id) || this.auth.isSuper.getValue()
  }

  userHasAdmin(id: string){
  let admin = false
  for (const [key, value] of Object.entries(this.auth.roles)) {
    if(key == id && value == "admin") admin = true
  }
    console.log(admin)
    return admin || this.auth.isSuper.getValue()
  }

  isRequested(requests: string[]){
    console.log(requests)
    return requests.find(id => id == this.userId)
  }

  setRequestList(name: string, requests: string[]){
    this.requestListName = name, this.requestList = requests
  }

  requestJoin(groupId: string){
    this.auth.requestJoin(this.userId, groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.groups$ = this.auth.getGroups()
      }
    })
  }
}

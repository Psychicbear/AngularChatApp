import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Observable, forkJoin, from, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class GroupsComponent {
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  groups$: Observable<any>
  usergroups: string[] = []
  userId: string = ''
  requestListName: string = ''
  requestList?: Observable<any>
  isAdmin: boolean = false
  isSuper: boolean = false
  editId: string = ''
  editName: string = ''
  editDesc: string = ''

  constructor(){
    this.groups$ = this.auth.getGroups()
    this.usergroups = this.auth.groups!
    console.log(['groups', this.usergroups])
    this.userId = this.auth.id
    this.isAdmin = this.userHasAdmin('global')
    this.isSuper = this.auth.isSuper.getValue()
    console.log(this.auth.roles)
  }

  userHasAccess(id: string){
    return this.usergroups.find(group => group == id) || this.isSuper
  }

  userHasAdmin(id: string){
  let admin = false
  for (const [key, value] of Object.entries(this.auth.roles)) {
    if(key == id && value == "admin") admin = true
  }
    console.log(admin)
    return admin
  }

  userIsPermitted(id: string){
    return this.isSuper || this.isAdmin || this.userHasAdmin(id)
  }

  isRequested(requests: string[]){
    console.log(requests)
    return requests.find(id => id == this.userId)
  }

  setRequestList(name: string, requests: string[]){
    console.log({name, requests})
    this.requestListName = name
    this.requestList = forkJoin(requests.map(req => this.auth.getUser(req)))
  }

  requestJoin(groupId: string){
    this.auth.requestJoin(this.userId, groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.groups$ = this.auth.getGroups()
      }
    })
  }

  goToGroup(groupId: string){
    this.router.navigate(['groups', groupId])
  }

  addGroup(name: any, desc: any){
    this.auth.addGroup(name.value, desc.value).subscribe(res => {
      if(res.success){
        this.groups$ = this.auth.getGroups()
        name.value = ''
        desc.value = ''
      }
    })
  }

  setEdit(id: string, name: string, desc: string){
    this.editId = id, this.editName = name, this.editDesc = desc
  }

  editGroup(id: string, name: string, desc: string){
    this.auth.editGroup(id, name, desc).subscribe(res => {
      if(res.success){
        this.groups$ = this.auth.getGroups()
      }
    })
  }

  deleteGroup(id: string){
    this.auth.deleteGroup(id).subscribe(res => {
      if(res.success){
        this.groups$ = this.auth.getGroups()
      }
    })
  }
}

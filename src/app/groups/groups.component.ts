import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Observable, BehaviorSubject, forkJoin, from, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Group } from '../classes/group';
import { User } from '../classes/user';

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
  userGroups$: BehaviorSubject<Group[]> = new BehaviorSubject([] as Group[])
  groups$: BehaviorSubject<Group[]> = new BehaviorSubject([] as Group[])
  userId: string = ''
  requestListId: string = ''
  requestListName: string = ''
  requestList: BehaviorSubject<User[]> = new BehaviorSubject([] as User[])
  isAdmin: boolean = false
  isSuper: boolean = false
  editId: string = ''
  editName: string = ''
  editDesc: string = ''

  //TODO: Could convert edit page to a behaviourSubject which is updated with edit.next()
  constructor(){
    this.populateGroups()
    this.userId = this.auth._id
    this.isAdmin = this.userHasAdmin('global')
    this.isSuper = this.auth.isSuper.getValue()
    console.log(this.auth.roles)
  }

  populateGroups(){
    this.auth.getGroups().subscribe(res => {
      console.log(res)
      if(res.success){
        this.groups$.next(res.remaining)
        this.userGroups$.next(res.user)
      }
    })
  }

  userHasAccess(id: string){
    return this.isSuper || this.userGroups$.getValue().find(group => group._id == id)
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

  setRequestList(name: string, groupId: string){
    console.log({name, groupId})
    this.requestListName = name
    this.requestListId = groupId
    this.auth.getRequests(groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.requestList.next(res.requests)
      }
    })
  }

  requestJoin(groupId: string){
    this.auth.requestJoin(this.userId, groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.populateGroups()
      }
    })
  }

  acceptRequest(userId: string , groupId: string){
    this.auth.acceptRequest(userId, groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.auth.getRequests(groupId).subscribe(res => {
          console.log(res)
          if(res.success){
            this.requestList.next(res.requests)
          }
        })
      }
    })
  }

  denyRequest(userId: string , groupId: string){
    this.auth.denyRequest(userId, groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.auth.getRequests(groupId).subscribe(res => {
          console.log(res)
          if(res.success){
            this.requestList.next(res.requests)
          }
        })
      }
    })
  }

  goToGroup(groupId: string){
    this.router.navigate(['groups', groupId])
  }

  addGroup(name: any, desc: any){
    this.auth.addGroup(name.value, desc.value).subscribe(res => {
      if(res.success){
        this.populateGroups()
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
        this.populateGroups()
      }
    })
  }

  deleteGroup(id: string){
    this.auth.deleteGroup(id).subscribe(res => {
      if(res.success){
        this.populateGroups()
      }
    })
  }
}

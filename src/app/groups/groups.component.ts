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
  editGroup$: BehaviorSubject<Group> = new BehaviorSubject({} as Group)

  //TODO: Could convert edit page to a behaviourSubject which is updated with edit.next()
  constructor(){
    this.populateGroups()
  }

  // Gets list of groups, seperated between saved groups and all groups
  populateGroups(){
    this.auth.getGroups().subscribe(res => {
      console.log(res)
      if(res.success){
        this.groups$.next(res.remaining)
        this.userGroups$.next(res.user)
      }
    })
  }

  // Returns boolean if the user is superuser or has privileges for the specified group
  userHasAccess(id: string){
    return this.auth.isSuper.getValue() || this.userGroups$.getValue().find(group => group._id == id)
  }


  userIsPermitted(id: string){
    return this.auth.isSuper.getValue() || this.auth.getRole(id) == 'admin'
  }

  // Checks the group requests to see if user's id is within array
  isRequested(requests: string[]){
    console.log(requests)
    return requests.find(id => id == this.userId)
  }

  // Sets the request list to the specified group, requests the list from the server
  // Updates the requestList subject on success
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

  // Sends request for user to join the specified group, reloading the group list on success
  requestJoin(groupId: string){
    this.auth.requestJoin(this.userId, groupId).subscribe(res => {
      console.log(res)
      if(res.success){
        this.populateGroups()
      }
    })
  }

  // Sends request to server to accept the join request, reloading the request list on completion
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

  // Sends request to server to deny the join request, reloading the request list on completion
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

  // Navigates to the specified group page
  goToGroup(groupId: string){
    this.router.navigate(['groups', groupId])
  }

  // Sends new group values to server, reloads the group list on success
  addGroup(name: any, desc: any){
    this.auth.addGroup(name.value, desc.value).subscribe(res => {
      if(res.success){
        this.populateGroups()
        name.value = ''
        desc.value = ''
      }
    })
  }

  // Sets the editgroup subject to the specified group for modification in the edit form
  setEdit(group: Group){
    this.editGroup$.next(group)
  }

  // Sends completed edit form to the server, reloads the group list if edit job completes successfully
  editGroup(name: string, desc: string){
    let group = this.editGroup$.getValue()
    group.name = name; group.desc = desc
    this.auth.editGroup(group).subscribe(res => {
      if(res.success){
        this.populateGroups()
      }
    })
  }

  // Sends Id of group to delete to the server, reloads group list if successful
  deleteGroup(id: string){
    this.auth.deleteGroup(id).subscribe(res => {
      if(res.success){
        this.populateGroups()
      }
    })
  }
}

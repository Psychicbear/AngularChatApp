import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Channel, Group } from '../classes/group' 
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../classes/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ChannelsComponent {
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  params: ActivatedRoute = inject(ActivatedRoute)
  groupId: string = ''
  groupName: string = ''
  isGroupAdmin: boolean = false
  isSuper: boolean = false
  channels$?: Observable<Record<string, Channel[]>>
  users$?: Observable<Record<string, User[]>>
  channel$: BehaviorSubject<Channel> = new BehaviorSubject({} as Channel)
  edit$: BehaviorSubject<Channel> = new BehaviorSubject({} as Channel)

  constructor(){
    this.isSuper = this.auth.isSuper.getValue()
    this.params.paramMap.subscribe(url => {
      this.groupId = url.get('groupid')!
      this.loadGroup()
      this.users$ = this.auth.getUsersInGroup(this.groupId)
      this.isGroupAdmin = this.auth.getRole(this.groupId) == 'admin'
      console.log(this.isGroupAdmin ? 'User is Group Admin' : 'Basic User')

    })

    this.channels$?.subscribe(chan => {
      this.auth.socket //Connect socket to channel
    })
  }

  //Loads group by ID then gets the list of channels
  loadGroup(){
    this.auth.getGroup(this.groupId).subscribe(res => {
      if(res.success){
        console.log(res)
        console.log(res.channels)
        this.groupName = res.name
        this.channels$ = this.auth.getChannels(res.channels)
      }
    })
  }

  loadChannel(id: string){
    this.auth.getChannel(id).subscribe(res => {
      let {success, ...channel} = res
      this.channel$.next(channel)
    })
  }



  log(i: any){
    console.log(i)
  }

  dropdownId(i:number){
    return `dropdown${i}`
  }

  addChannel(name: any, desc: any){
    console.log(desc)
    this.auth.addChannel(this.groupId, name.value, desc.value).subscribe(res => {
      if(res.success){
        this.loadGroup()
        name.value = ''
        desc.value = ''
      }
    })
  }


  editChannel(name: string, desc: string){
    let channel = this.edit$.getValue()
    channel.name = name, channel.desc = desc
      this.auth.editChannel(channel).subscribe(res => {
        if(res.success){
          this.loadGroup()
          this.edit$.next({} as Channel)
        }
      })
  }


  deleteChannel(id: string){
    this.auth.deleteChannel(this.groupId, id).subscribe(res => {
      console.log(res)
      if(res.success){
        this.loadGroup()
      }
    })
  }

}

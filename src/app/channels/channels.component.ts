import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Channel, Group, Message } from '../classes/group' 
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
  @ViewChild('chat') chatElement?: ElementRef<HTMLDivElement>
  error: string = ''
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  params: ActivatedRoute = inject(ActivatedRoute)
  groupId: string = ''
  groupName: string = ''
  isGroupAdmin: boolean = false
  isSuper: boolean = false
  channels$?: Observable<Record<string, Channel[]>>
  users$: BehaviorSubject<User[]> = new BehaviorSubject([] as User[])
  channel$: BehaviorSubject<Channel> = new BehaviorSubject({} as Channel)
  edit$: BehaviorSubject<Channel> = new BehaviorSubject({} as Channel)
  messages: Message[] = []
  online$: BehaviorSubject<User[]> = new BehaviorSubject([] as User[])
  offline$: BehaviorSubject<User[]> = new BehaviorSubject([] as User[])


  constructor(){
    this.isSuper = this.auth.isSuper.getValue()
    this.params.paramMap.subscribe(url => {
      this.groupId = url.get('groupid')!
      this.loadGroup()
      this.loadUserList()
      this.isGroupAdmin = this.auth.getRole(this.groupId) == 'admin'
      console.log(this.isGroupAdmin ? 'User is Group Admin' : 'Basic User')
      this.auth.socket?.emit('join-group', this.groupId)
    })

    this.channel$.subscribe(chan => {
       this.messages = chan.messages
    })

    this.auth.socket?.on('message', msg => {
      if(this.auth._id != msg.userId){
        this.messages.push(msg)
      }
    })

    this.auth.socket?.on('update-user-list', list => {
      let online: User[] = []; let offline: User[] = []

      this.users$.getValue().forEach(user => {
        if(list.find(user._id)){
          online.push(user)
        } else offline.push(user)
      })
      
      this.online$.next(online)
      this.offline$.next(offline)
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

  //Loads list of users for user sidebar
  loadUserList(){
    this.auth.getUsersInGroup(this.groupId).subscribe(res => {
      if(res.success){
        this.users$.next(res.users)
      }
    })
  }

  //Loads channel chat menu
  loadChannel(id: string){
    this.auth.getChannel(id).subscribe(res => {
      let {success, ...channel} = res
      if(success){
        let {_id, name} = this.channel$.getValue()
        console.log(channel)
        this.auth.socket?.emit('leave-channel', {id: _id, name: name})
        this.channel$.next(channel)
        this.auth.socket?.emit('join-channel', {id: channel._id, name: channel.name})
        console.log(this.chatElement)
      }
    })
  }

  //Gets user details for message presentation
  getUsername(id: string){
    let { username, img } = this.users$.getValue().find(user => user._id == id)!
    return { username: username, img: img }
  }

  //Sends message to socket, appending to message list locally
  sendMessage(content: any){
    let msg = {
      userId: this.auth._id.getValue(),
      timestamp: new Date(),
      content: content.value
    }
    this.auth.socket?.emit('sendMessage', {source: this.channel$.getValue()._id, ...msg})
    this.messages.push(msg)
    content.value = ''
    this.chatElement!.nativeElement.scrollTo(0, this.chatElement!.nativeElement.scrollHeight)
  }

  //Kicks user from the group and reloads channel list
  banUser(id: string){
    this.auth.banUser(id, this.groupId).subscribe(res => {
      if(res.success){
        this.loadUserList()
      }
    })
  }

  //Updates the role of the user for specified group
  updateUserRole(id: string, role: string, update: string){
    this.auth.updateUserRole(id, role, update).subscribe(res => {
      if(res.success){
        this.loadUserList()
      } else if(res.err){
        this.error = res.err
      }
    })
  }


  getUserRole(user: User, role: string = this.groupId){
    type RoleKey = keyof typeof user.roles
    return user.roles[role as RoleKey]
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
        this.channel$.next({} as Channel)
      }
    })
  }

}

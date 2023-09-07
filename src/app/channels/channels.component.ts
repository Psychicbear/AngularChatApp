import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Channel } from '../classes/group' 
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../classes/user';
import { NgbDropdownModule, NgbModalModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css'],
  imports: [CommonModule, FormsModule, NgbDropdownModule, NgbModalModule],
  standalone: true
})
export class ChannelsComponent {
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  modal: NgbModal = inject(NgbModal)
  closeResult: string = ''
  params: ActivatedRoute = inject(ActivatedRoute)
  groupId: string = ''
  groupName: string = ''
  isGroupAdmin: boolean = false
  isSuper: boolean = false
  channels$?: Observable<Record<string, Channel[]>>
  users$?: Observable<Record<string, User[]>>
  channel?: Channel
  editType: string = ''
  editId: string = ''
  editName: string = ''
  editDesc: string = ''

  constructor(){
    this.isSuper = this.auth.isSuper.getValue()
    this.params.paramMap.subscribe(url => {
      this.groupId = url.get('groupid')!
      this.auth.getGroup(this.groupId).subscribe(res => {
        if(res.success){
          console.log(res)
          this.groupName = res.name
        }
      })
      this.isGroupAdmin = this.auth.getRole(this.groupId) == 'admin'
      console.log(this.isGroupAdmin ? 'User is Group Admin' : 'Basic User')
      this.channels$ = this.auth.getChannels(this.groupId)
      this.users$ = this.auth.getUsersInGroup(this.groupId)
    })
  }

  open(content: any) {
		this.modal.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}

  private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

  log(i: any){
    console.log(i)
  }

  setChannel(chan: Channel){
    this.channel = chan
  }

  dropdownId(i:number){
    return `dropdown${i}`
  }

  addChannel(name: any, desc: any){
    console.log(desc)
    this.auth.addChannel(this.groupId, name.value, desc.value).subscribe(res => {
      if(res.success){
        this.channels$ = this.auth.getChannels(this.groupId)
        name.value = ''
        desc.value = ''
      }
      
    })
  }

  setEdit(id: string, name: string, desc: string){
    this.editId = id, this.editName = name, this.editDesc = desc
  }

  clearEdit(){
    this.editId = '', this.editName = '', this.editDesc = ''
  }


  editChannel(name: string, desc: string){
      this.auth.editChannel(this.groupId, this.editId, name, desc).subscribe(res => {
        if(res.success){
          this.channels$ = this.auth.getChannels(this.groupId)
          let {success, err, ...channel} = res
          this.channel = channel as Channel
          this.clearEdit()
        }
      })
  }


  deleteChannel(id: string){
    this.auth.deleteChannel(this.groupId, id).subscribe(res => {
      console.log(res)
      if(res.success){
        this.channels$ = this.auth.getChannels(this.groupId)
        this.channel = undefined
      }
    })
  }

}

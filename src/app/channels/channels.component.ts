import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Channel } from '../classes/group' 
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../classes/user';
import { NgbDropdownModule, NgbModalModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css'],
  imports: [CommonModule, NgbDropdownModule, NgbModalModule],
  standalone: true
})
export class ChannelsComponent {
  auth: AuthService = inject(AuthService)
  router: Router = inject(Router)
  modal: NgbModal = inject(NgbModal)
  closeResult: string = ''
  params: ActivatedRoute = inject(ActivatedRoute)
  groupId: string = ''
  isGroupAdmin: boolean = false
  isSuper: boolean = false
  channels$?: Observable<Record<string, Channel[]>>
  users$?: Observable<Record<string, User[]>>
  channel?: Channel

  constructor(){
    this.isSuper = this.auth.isSuper.getValue()
    this.params.paramMap.subscribe(url => {
      this.groupId = url.get('groupid')!
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

  addChannel(name: string, desc: string, modal: any){
    console.log(desc)
    this.auth.addChannel(this.groupId, name, desc).subscribe(res => {
      console.log(res)
      modal.close('Save click')
      this.channels$ = this.auth.getChannels(this.groupId)
    })
  }

}

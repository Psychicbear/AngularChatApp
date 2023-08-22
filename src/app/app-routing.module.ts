import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChannelsComponent } from './channels/channels.component';
import { AccountComponent } from './account/account.component';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './groups/groups.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  {path: '', component: GroupsComponent},
  {path: 'account', component: AccountComponent},
  {path: 'login', component: LoginComponent},
  {path: 'groups/:groupid', component: ChannelsComponent},
  {path: 'channels/:channelid', component: ChatComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

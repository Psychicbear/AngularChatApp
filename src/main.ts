/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
// import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { GroupsComponent } from './app/groups/groups.component';
import { authGuardGuard } from './app/auth-guard.guard';
import { AccountComponent } from './app/account/account.component';
import { LoginComponent } from './app/login/login.component';
import { ChannelsComponent } from './app/channels/channels.component';
import { ChatComponent } from './app/chat/chat.component';

const routes: Routes = [
  {path: '', component: GroupsComponent, canActivate: [authGuardGuard]},
  {path: 'account', component: AccountComponent, canActivate: [authGuardGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'groups/:groupid', component: ChannelsComponent, canActivate: [authGuardGuard]},
  {path: 'channels/:channelid', component: ChatComponent, canActivate: [authGuardGuard]},
];

bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(BrowserModule,  HttpClientModule, FormsModule),
      provideRouter(routes, withComponentInputBinding())
    ]
})
  .catch(err => console.error(err));

  
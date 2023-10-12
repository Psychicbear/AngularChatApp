/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { GroupsComponent } from './app/groups/groups.component';
import { authGuardGuard } from './app/auth-guard.guard';
import { AccountComponent } from './app/account/account.component';
import { LoginComponent } from './app/login/login.component';
import { ChannelsComponent } from './app/channels/channels.component';

const routes: Routes = [
  {path: '', title: 'Dashboard', component: GroupsComponent, canActivate: [authGuardGuard]},
  {path: 'account', title: 'Account Details', component: AccountComponent, canActivate: [authGuardGuard]},
  {path: 'login', title: 'Login or Register', component: LoginComponent},
  {path: 'groups/:groupid', title: 'Group Chat', component: ChannelsComponent, canActivate: [authGuardGuard]},
];

bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(BrowserModule,  HttpClientModule, FormsModule),
      provideRouter(routes, withComponentInputBinding())
    ]
})
  .catch(err => console.error(err));

  
import { RouterModule,Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { HostComponent } from './host/host.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';
import { LobbyComponent } from './lobby/lobby.component';

import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';


const redirectUnauthorizedToLobby = () => redirectUnauthorizedTo(['lobby']);
const redirectLoggedInToPlay = () => redirectLoggedInTo(['play']);

const routeConfig: Routes = [
    {   path: '',
        component: HomeComponent,
        title: 'Home page'},
    {   path: 'host',
        component: HostComponent,
        title : 'Hosting'
    },
    {
        path: 'lobby',
        component: LobbyComponent,
        title: "Join a game",
        ...canActivate(redirectLoggedInToPlay),
      },
    {
        path: 'play',
        component: PlayerComponent,
        title : 'Playing',
        ...canActivate(redirectUnauthorizedToLobby),
    }, //Add new route guards when not logged into game-play
    {
        path :'about',
        component: AboutComponent,
        title: "About Us"
    },
    {
        path: '**',
        component: PagenotfoundComponent,
        title : "404 Error"
    },
    
];
    export default routeConfig;

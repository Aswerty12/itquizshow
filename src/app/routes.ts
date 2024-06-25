import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { HostComponent } from './host/host.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayerLobbyComponent } from './player-lobby/player-lobby.component';
import { GamePlayerComponent } from './game-player/game-player.component';

import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { GameLobbyGuard } from './guards/game-lobby.guard'; // You'll need to create this guard

const redirectUnauthorizedToLobby = () => redirectUnauthorizedTo(['lobby']);
const redirectLoggedInToPlayerLobby = () => redirectLoggedInTo(['player-lobby']);

const routeConfig: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Home page'
    },
    {
        path: 'host',
        component: HostComponent,
        title: 'Hosting',
        ...canActivate(redirectUnauthorizedToLobby)
    },
    {
        path: 'lobby',
        component: LobbyComponent,
        title: "Join a game",
        ...canActivate(redirectLoggedInToPlayerLobby),
    },
    {
        path: 'player-lobby',
        component: PlayerLobbyComponent,
        title: "Player Lobby",
        ...canActivate(redirectUnauthorizedToLobby),
    },
    {
        path: 'game-player/:gameId',
        component: GamePlayerComponent,
        title: "Playing Game",
        canActivate: [GameLobbyGuard],
    },
    {
        path: 'play',
        component: PlayerComponent,
        title: 'Playing',
        ...canActivate(redirectUnauthorizedToLobby),
    },
    {
        path: 'about',
        component: AboutComponent,
        title: "About Us"
    },
    {
        path: '**',
        component: PagenotfoundComponent,
        title: "404 Error"
    },
];

export default routeConfig;
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';
import { LobbyComponent } from './lobby/lobby.component'; //player login
import { PlayerLobbyComponent } from './player-lobby/player-lobby.component'; //player lobby
import { GamePlayerComponent } from './game-player/game-player.component'; //player game
import { GameLoginComponent  } from './game-login/game-login.component'; //login
import { GameLobbyComponent } from './game-lobby/game-lobby.component'; //lobby
import { GameHostComponent } from './gamehost/gamehost.component';// game for host

import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { GameLobbyGuard } from './guards/game-lobby.guard'; //Guard for player side
import { HostLobbyGuard } from './guards/host-lobby.guard'; // Guard for host side

const redirectUnauthorizedToLobby = () => redirectUnauthorizedTo(['lobby']);
const redirectLoggedInToPlayerLobby = () => redirectLoggedInTo(['player-lobby']);
const redirectLoggedInToGameLobby = () => redirectLoggedInTo(['game-lobby']);

const routeConfig: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Home page'
    },
    {
        path: 'lobby',
        component: LobbyComponent,
        title: "Log in for Players",
        ...canActivate(redirectLoggedInToGameLobby),
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
        path: 'host-login',
        component: GameLoginComponent,
        title: "Log in for Hosting",
        ...canActivate(redirectLoggedInToGameLobby)
    },
    {
        path: 'game-lobby',
        component: GameLobbyComponent,
        title: "Create A Game",
        ...canActivate(redirectUnauthorizedToLobby)
    },
    {
        path :'game-host/:gameId',
        component: GameHostComponent,
        title: "Hosting a Game",
        canActivate: [HostLobbyGuard],
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
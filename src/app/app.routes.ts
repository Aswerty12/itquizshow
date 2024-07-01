import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';
import { LobbyComponent } from './lobby/lobby.component'; //player login
import { PlayerLobbyComponent } from './player-lobby/player-lobby.component'; //player lobby
import { GamePlayerComponent } from './game-player/game-player.component'; //player game
import { GameLoginComponent  } from './game-login/game-login.component'; //login

import { GameSetupComponent } from './game-setup/game-setup.component'; // New Lobby Component with question upload
import { GameHostComponent } from './gamehost/gamehost.component';// game for host

import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { GameLobbyGuard } from './guards/game-lobby.guard'; //Guard for player side
import { HostLobbyGuard } from './guards/host-lobby.guard'; // Guard for host side


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['lobby']);
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
        ...canActivate(redirectLoggedInToPlayerLobby),
    },
    {
        path: 'player-lobby',
        component: PlayerLobbyComponent,
        title: "Player Lobby",
        ...canActivate(redirectUnauthorizedToLogin),
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
        component: GameSetupComponent,
        title: "Create A Game",
        ...canActivate(redirectUnauthorizedToLogin)
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
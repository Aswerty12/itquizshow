import { RouterModule,Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { HostComponent } from './host/host.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';


const routeConfig: Routes = [
    {   path: '',
        component: HomeComponent,
        title: 'Home page'},
    {   path: 'host',
        component: HostComponent,
        title : 'Hosting'
    },
    {
        path: 'play',
        component: PlayerComponent,
        title : 'Playing'
    },
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

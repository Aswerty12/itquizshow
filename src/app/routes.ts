import {Routes} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { HostComponent } from './host/host.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';

const routeConfig: Routes = [
    {
      path: '',
      component: HomeComponent,
      title: 'Home page',
    },
    {
      path: 'play',
      component: PlayerComponent,
      title: 'Player View',
    },
    {
      path: 'host',
      component: HostComponent,
      title: 'Host View',},
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
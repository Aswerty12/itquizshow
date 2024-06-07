import {Routes} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { HostComponent } from './host/host.component';

const routeConfig: Routes = [
    {
      path: '',
      component: HomeComponent,
      title: 'Home page',
    },
    {
      path: 'player/:id',
      component: PlayerComponent,
      title: 'Player View',
    },
    {
      path: 'host/:id',
      component: HostComponent,
      title: 'Host View'
    }
  ];
  export default routeConfig;
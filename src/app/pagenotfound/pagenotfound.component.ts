import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { AboutComponent } from '../about/about.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagenotfound',
  standalone: true,
  imports: [HomeComponent,AboutComponent,RouterLink],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.scss'
})
export class PagenotfoundComponent {

}

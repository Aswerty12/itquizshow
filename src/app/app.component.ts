import { Component, inject } from '@angular/core';
import { RouterOutlet , RouterModule, RouterLink} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HomeComponent,RouterLink,CommonModule],
  template: `<main>
    <nav>
      <a [routerLink]="['/']">
        <header class="brand-name">
          <img class="brand-logo" src="logo.svg" alt="logo" aria-hidden="true" />
        </header>
      </a>
      <a routerLink="/lobby"> Play!</a>
      <a routerLink="/host">  HOST!</a>
      <a routerLink="/about"> About</a>
      </nav>

    <section class = "content"> 
      <router-outlet> </router-outlet>
      
    </section>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ITQuizshow';
}


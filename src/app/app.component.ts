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
  /*firestore: Firestore = inject(Firestore);
  items$: Observable<any[]>;
  hasData = false;

  constructor() {
    const aCollection = collection(this.firestore, 'items')
    this.items$ = collectionData(aCollection);

    // Check if data exists initially
    this.items$.subscribe(data => {
      this.hasData = data.length > 0;
    });
  } */
}

/* 
Test code for the firestore
      <ul>
        <li class="text" *ngFor="let item of items$ | async">
          {{item.name}}
        </li>
      </ul>
*/
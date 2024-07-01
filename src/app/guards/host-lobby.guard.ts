import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../account.service';
import { GameService } from '../game.service';

@Injectable({
  providedIn: 'root'
})
export class HostLobbyGuard implements CanActivate {
  constructor(
    private accountService: AccountService,
    private gameService: GameService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(route);
  }

  private async checkAccess(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const isLoggedIn = await this.accountService.isLoggedIn();
    if (!isLoggedIn) {
      return this.router.parseUrl('/host-login');
    }

    const gameId = route.paramMap.get('gameId');
    if (!gameId) {
      return this.router.parseUrl('/game-setup');
    }

    const isValidGame = await this.gameService.isValidGame(gameId);
    if (!isValidGame) {
      return this.router.parseUrl('/game-setup');
    }

    return true;
  }
}
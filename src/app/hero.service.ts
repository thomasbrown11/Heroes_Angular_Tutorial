//processing, instantiation
import { Injectable } from '@angular/core';
//interface
import { Hero } from "./hero";
//simulated db
import { HEROES } from "./mock-heroes";
//for async calls (coupled with subscribe in view component)
import { Observable, of } from 'rxjs';
//for service in service calls
import { MessageService } from './message.service';
//http server calls
import { HttpClient, HttpHeaders } from '@angular/common/http'
//error handling and JSON traversal
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  //root means singleton resource shared amoung all components
  providedIn: 'root'
})
export class HeroService {

  constructor(private messageService: MessageService, private http: HttpClient) { }

  // getHeroes(): Hero[] {
  //   return HEROES;
  // }

  //replace old getHeroes with the async version employing rxjs 
  //async emit HEROES array in single value and place in heroes var
  //return when component subscribes to this observable value
  // getHeroes(): Observable<Hero[]> {
  //   const heroes = of(HEROES);
  //   return heroes;
  // }

  //changed to service-in-servie, now calls messageService .add() method which appends 
  //the MessageService singleton array wih the fetched heroes (presumably)
  // getHeroes(): Observable<Hero[]> {
  //   const heroes = of(HEROES);
  //   this.messageService.add('HeroService: fetched heroes');
  //   return heroes;
  // }

  //changed getHeroes() to retrieve data from a server
  //when http response received pipe the result to both tap() and catchError() RxJS
  //methods. messageService.add() that you fetched something, call handleError if error
  //this will log a message, console.log() a message, and also return a safe value that
  //won't break the app. 
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(tap(_ => this.log('fetched heroes')), catchError(this.handleError<Hero[]>('getHeroes', [])));
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 *
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  //removed to accomdate new http request version
  // getHero(id: number): Observable<Hero> {
  //   // For now, assume that a hero with the specified `id` always exists.
  //   // Error handling will be added in the next step of the tutorial.
  //   const hero = HEROES.find(h => h.id === id)!; //scrub server HEROES array for the hero.id match 
  //   this.messageService.add(`HeroService: fetched hero id=${id}`); //update messages based on the id 
  //   //passed from the component's url
  //   return of(hero); //return the matching hero (which will be ssaved by the component as a new var)
  // }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    //3 args: heroesUrl is the api endpoint, hero is the info there to update
    //not sure how the api knows to update via id, but that's what's happening,
    //this.httpOptions fulfills the options argument, which is meant to couple a header
    //with the request
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** POST: add a new hero to the server */
  //Post expects an id from the server itself to be created). newHero references
  //the http response from the post request which should return the new hero from the 
  //collection array with an id assigned (most servers assign id to new entries)
  //tap logs the id.
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) { //if white-space removed arg is empty
      return of([]); //return empty array from rxjs 
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
        this.log(`found heroes matching "${term}"`) :
        this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );

  }


  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`)
  }

  //this is where the api url would go, here it's api/heroes to work with the simulated
  //server in in-memory-data.service.ts 
  private heroesUrl = 'api/heroes';

  //configure options to packet with put request
  httpOptions = {
    //HttpHeaders was imported globally in the AppModule
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };


}
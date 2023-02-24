import { Component, OnInit } from '@angular/core';
import { Hero } from '../hero';
// import { HEROES } from '../mock-heroes';
//import the hero service meant to retrieve the mock-hero array
import { HeroService } from '../hero.service';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})

export class HeroesComponent implements OnInit {

  //looks like normal constructor but is specifying this component at a HeroService injection site
  constructor(private heroService: HeroService, private messageService: MessageService) { };

  // heroes = HEROES; //replace with:
  heroes: Hero[] = [];
  hero: Hero = {
    id: 1,
    name: 'windstorm'
  };

  //the value can be null, but if added it must be like Hero interface type
  //display selectedHero when there is a value
  selectedHero?: Hero;

  //onClick handling for hero list buttons 
  //removed onselect when buttons became links to routing
  // onSelect(hero: Hero): void {
  //   this.selectedHero = hero;
  //   this.messageService.add(`HeroesComponent: Selected Hero id = ${hero.id} `)
  // }

  //make the HeroService getHeroes() method into a local getHeroes method. 
  // getHeroes(): void {
  //   this.heroes = this.heroService.getHeroes();
  // }

  //change getHeroes() to accomodate async features in new rxjs method call from service
  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes);
  }

  //built-in lifecycle hook that runs code block on component instantiation 
  ngOnInit(): void {
    this.getHeroes()
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => {
        this.heroes.push(hero);
      });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteHero(hero.id).subscribe();
  }

}


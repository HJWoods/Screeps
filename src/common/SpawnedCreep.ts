import {CreepPrototype} from "./CreepPrototype";
import {CreepBehaviour} from "./CreepBehaviour";
import {Maybe} from "./Maybe";
import {GameState} from "./GameState";

export class SpawnedCreep {
  public _prototype: CreepPrototype;
  private stillSpawning = true;
  constructor(private creep: Creep, prototype: CreepPrototype) {
    console.log(`New creep spawned with prototype ${prototype.name}`);
    this._prototype = prototype;
  }
  public getCreep() {
    return this.creep;
  }
  public isSpawning() {
    return this.creep.spawning;
  }

  public isDead() {
    return !this.isSpawning() && this.creep.hits <= 0;
  }
  public doesExist() {
      return !this.isDead() && !this.isSpawning();
  }
  public run() {
    if(this.isSpawning()) {
      console.log(`Creep ${this._prototype.name} is still spawning`);
      return;
    }
    this._prototype.behaviour.run(this.creep);
  }
}

import {Maybe} from "./Maybe";
import {GameObject} from "./Helpers";




//TODO: Implement for all prototypes
export class GameState {
  protected static allSpawns: Map<string,StructureSpawn[]> = new Map();
  protected static friendlySpawns: Map<string, StructureSpawn[]> = new Map();
  protected static enemySpawns: Map<string, StructureSpawn[]> = new Map();
  protected static allCreeps: Map<string, Creep[]> = new Map();
  protected static friendlyCreeps: Map<string, Creep[]> = new Map();
  protected static enemyCreeps:  Map<string, Creep[]> = new Map();
  public static energySources : Map<string, Source[]> = new Map();
  public static containers : Map<string, StructureContainer[]> = new Map();


  private static getInMapHelper<T, R>(map : Map<T, R>, key : T, def : R) : R {
    return Maybe.fromValue(map.get(key)).getOrDefault(def);
  }

  public static getAllSpawns(roomName : string) : StructureSpawn[] {
    return GameState.getInMapHelper(GameState.allSpawns, roomName, []);
  }
  public static getFriendlySpawns(roomName : string) : StructureSpawn[] {
    return GameState.getInMapHelper(GameState.friendlySpawns, roomName, []);
  }
  public static getEnemySpawns(roomName : string) : StructureSpawn[] {
    return GameState.getInMapHelper(GameState.enemySpawns, roomName, []);
  }
  public static getAllCreeps(roomName : string) : Creep[] {
    return GameState.getInMapHelper(GameState.allCreeps, roomName, []);
  }
  public static getFriendlyCreeps(roomName : string) : Creep[] {
    return GameState.getInMapHelper(GameState.friendlyCreeps, roomName, []);
  }
  public static getEnemyCreeps(roomName : string) : Creep[] {
    return GameState.getInMapHelper(GameState.enemyCreeps, roomName, []);
  }
  public static getEnergySources(roomName : string) : Source[] {
    return GameState.getInMapHelper(GameState.energySources, roomName, []);
  }

  public static getAllContainers(roomName : string) : StructureContainer[] {
      return GameState.getInMapHelper(GameState.containers, roomName, []);
  }

  private static getByType(roomName : string, type : string) : GameObject[] {
    let objects : GameObject[] = [];
    switch (type) {
      case "Spawns":
        objects = GameState.getAllSpawns(roomName);
        break;
      case "FriendlySpawns":
        objects = GameState.getFriendlySpawns(roomName);
        break;
      case "EnemySpawns":
        objects = GameState.getEnemySpawns(roomName);
        break;
      case "Creeps":
        objects = GameState.getAllCreeps(roomName);
        break;
      case "FriendlyCreeps":
        objects = GameState.getFriendlyCreeps(roomName);
        break;
      case "EnemyCreeps":
        objects = GameState.getEnemyCreeps(roomName);
        break;
      case "EnergySources":
        objects = GameState.getEnergySources(roomName);
        break;
      case "Containers":
        objects = GameState.getAllContainers(roomName);
        break;
      default:
        throw Error("Unknown type: " + type);
    }
    return objects;
  }

  private static findClosestByRange(from : GameObject, toSearch : GameObject[]) : Maybe<RoomPosition> {
    let roomPositions = toSearch.map(obj => obj.pos);
    let pos = from.pos;
    return Maybe.fromValue(pos.findClosestByRange(roomPositions));
  }

  public static getNearestContainerWithContents(from : GameObject, resource : ResourceConstant) : Maybe<StructureContainer> {
    let roomName = from.pos.roomName;
    let containers = GameState.getAllContainers(roomName).filter(container => {
      return container.store[resource] > 0;
    });
    if(containers.length === 0) {
      return Maybe.nothing();
    }else{
      return Maybe.fromValue(from.pos.findClosestByRange(containers));
    }
  }


  public static getClosestByRange(from : GameObject, toSearch : GameObject[]) : Maybe<GameObject> {
    if (toSearch.length === 0) {
      return Maybe.nothing();
    }else {
      return Maybe.fromValue(from.pos.findClosestByRange(toSearch));
    }
  }

  public static getClosestByRangeByType(type : string, from : GameObject) : Maybe<GameObject> {
    let gameObjs = GameState.getByType(from.pos.roomName, type);
    return GameState.getClosestByRange(from, gameObjs);
  }
  public static getClosestByPathByType(type : string, from : GameObject) : Maybe<GameObject> {
    let gameObjs = GameState.getByType(from.pos.roomName, type);
    if(gameObjs.length === 0) {
      return Maybe.nothing();
    }else{
      return Maybe.fromValue(from.pos.findClosestByPath(gameObjs));
    }
  }
  public static findInRange(from : GameObject, toSearch : GameObject[], range : number) : GameObject[] {
    return from.pos.findInRange(toSearch, range);
  }
  public static findTypeInRange(type : string, from : GameObject, range : number) : GameObject[] {
    let objects = GameState.getByType(from.pos.roomName, type);
    return GameState.findInRange(from, objects, range);
  }
  public static getDist(from : GameObject, to : GameObject) : number {
    return from.pos.getRangeTo(to.pos);
  }


  public static update(room : Room) {
    let roomName = room.name;
    let friendlySpawns  = room.find(FIND_MY_SPAWNS);
    let enemySpawns = room.find(FIND_HOSTILE_SPAWNS);
    let allSpawns = friendlySpawns.concat(enemySpawns);
    let allCreeps = room.find(FIND_CREEPS);
    let friendlyCreeps = room.find(FIND_MY_CREEPS);
    let enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
    let energySources = room.find(FIND_SOURCES);
    let allContainers = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_CONTAINER;
      }
    });
    GameState.allSpawns.set(roomName, allSpawns);
    GameState.friendlySpawns.set(roomName, friendlySpawns);
    GameState.enemySpawns.set(roomName, enemySpawns);
    GameState.allCreeps.set(roomName, allCreeps);
    GameState.friendlyCreeps.set(roomName, friendlyCreeps);
    GameState.enemyCreeps.set(roomName, enemyCreeps);
    GameState.energySources.set(roomName, energySources);
    GameState.containers.set(roomName, <StructureContainer[]>allContainers);
  }
}

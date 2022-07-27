import {Maybe} from "./Maybe";

export type FSMState = string;

export class FiniteStateMachine<T, R> {
  public _initialState : FSMState;
  private _transitions: Map<FSMState, (x : T) => FSMState>;
  private _actions : Map<FSMState, (x : T) => R>;
  private _defaultAction : R

  constructor(initialState: FSMState, transitions: Map<FSMState, (x : T) => FSMState>,
              actions: Map<FSMState, (x : T) => R>, defaultAction: R) {
    this._initialState = initialState
    this._transitions = transitions
    this._actions = actions
    this._defaultAction = defaultAction
  }
  public setTransitionFunction(state: FSMState, transition: (x : T) => FSMState) {
    this._transitions.set(state, transition)
  }
  public updateState(x : T, state : FSMState): FSMState {
    let transitionFunction = Maybe.fromValue(this._transitions.get(state));
    return transitionFunction.doOrError((f) => {
      return f(x)
    }, "No transition function for state " + state).getOrError(
      "Error in transition function for " + state);
  }
  public getAction(x : T, state : FSMState) : R {
    let actionFunction = Maybe.fromValue(this._actions.get(state));
    return actionFunction.doOrError((f) => {
      return f(x)
    }, "No action function for state " + state).getOrDefault(this._defaultAction);
  }
  public updateThenGetAction(x : T, state : FSMState) : R {
    let newState = this.updateState(x, state);
    return this.getAction(x, newState);
  }
}

export class FiniteStateMachineMap<K,T,R> {
  private _fsm : FiniteStateMachine<T, R>;
  private _map : Map<K, FSMState>;
  constructor(fsm : FiniteStateMachine<T, R>) {
      this._fsm = fsm;
      this._map = new Map<K, FSMState>();
  }
  public addEntry(key : K) {
    this._map.set(key, this._fsm._initialState);
  }
  public getState(key : K) : Maybe<FSMState> {
    return Maybe.getInMap(this._map, key);
  }
  public setState(key : K, state : FSMState) {
    this._map.set(key, state);
  }
  public getAction(key : K, x : T) : R {
    let state = this._fsm.updateState(x, Maybe.getInMap(this._map, key).getOrDefault(this._fsm._initialState));
    console.log(`Creep state for ${key} is ${state}`);
    this.setState(key, state);
    return this._fsm.getAction(x, state);
  }
}






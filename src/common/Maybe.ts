/**
 * Rough implementation of Haskell's Maybe monad.
 */

type Nothing = undefined | null;

export class Maybe<T> {
  private constructor(private value: T | undefined) {
  }

  /**
   * Creates a new Maybe with the given value. Can only be called on values that are not undefined.
   * @param value The value to wrap in a Maybe.
   */
  static just<T>(value: T) {
    if (!value) {
      throw Error("Provided value must not be empty");
    }
    return new Maybe(<T>value);
  }

  /**
   * An empty Maybe for the given type T.
   */
  static nothing<T>() {
    return new Maybe<T>(undefined);
  }

  /**
   * Wrap a value in a Maybe. If the value is undefined, then the Maybe will equal nothing<T>.
   * @param value The value to wrap in a Maybe.
   */
  static fromValue<T>(value: T | Nothing) {
    return value ? Maybe.just(value) : Maybe.nothing<T>();
  }


  /**
   * Gets the value of the Maybe. If the Maybe is nothing, then return defaultValue.
   * @param defaultValue The value to return if the Maybe is nothing.
   */
  public getOrDefault(defaultValue: T): T {
    return this.value === undefined ? defaultValue : this.value;
  }

  public getOrError(errorMessage: string): T {
    if (this.value === undefined) {
      throw Error(errorMessage);
    }
    return this.value;
  }

  public get(): T {
    if (this.value === undefined) {
      throw Error("Trying to get value from Nothing");
    }
    return this.value;
  }

  /**
   * Checks if the Maybe is nothing.
   */
  public isNothing(): boolean {
    return this.value === undefined;
  }

  /**
   * perform a callback over this Maybe. If the Maybe is nothing, then return nothing.
   * Works over Map's. flattens them to a single map, so you don't get Maybe<Maybe<T>> types.
   * See https://codewithstyle.info/advanced-functional-programming-in-typescript-maybe-monad/
   * @param f The function to apply to the value.
   */
  public do<R>(f: (wrapped: T) => R): Maybe<R> {
    if (this.value === undefined) {
      return Maybe.nothing<R>();
    } else {
      return Maybe.fromValue(f(<T>this.value));
    }
  }

  /**
   * Perform a callback over this Maybe. If the Maybe is nothing, then perform a different callback.
   * @param f The function to apply to the value.
   * @param elseF The function to apply if the Maybe is nothing.
   */
  public doOrElse<R>(f: (wrapped: T) => R, elseF: () => R): Maybe<R> {
    if (this.value === undefined) {
      return Maybe.fromValue(elseF());
    } else {
      return Maybe.fromValue(f(<T>this.value));
    }
  }

  public doOrError<R>(f: (wrapped: T) => R, errorMessage: string): Maybe<R> {
    return this.doOrElse(f, () => {
      throw Error(errorMessage);
    });
  }

  public static getInMap<T, R>(map: Map<T, R>, key: T): Maybe<R> {
    return Maybe.fromValue(map.get(key));
  }

  public static setInMapIfNothing<T, R>(map: Map<T, R>, key: T, value: R): Maybe<R> {
    if (map.get(key) === undefined) {
      map.set(key, value);
    }
    return Maybe.fromValue(map.get(key));
  }

  /**
   * Get a value from an array. If the index is not valid, return nothing.
   * @param array The array to get the value from.
   * @param index The index of the value to get.
   */
  public static getInArray<T>(array: T[], index: number): Maybe<T> {
    return Maybe.fromValue(array[index]);
  }

  /**
   * Error if Nothing, otherwise return this
   * @param errorMessage The error message to throw if the Maybe is nothing.
   */
  public errorIfNothing(errorMessage: string): Maybe<T> {
    if (this.value === undefined) {
      throw Error(errorMessage);
    }
    return this;
  }

}

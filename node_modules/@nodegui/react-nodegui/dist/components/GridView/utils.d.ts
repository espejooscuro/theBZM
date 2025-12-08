export interface DataWithOffset<T> {
    offset: number;
    data: T;
}
declare type SetParentFunc<T> = (parent: T, index: number) => void;
/**
 * Extract the keys of type `T` matching type `TType`
 */
declare type KeysOfType<T, TType> = {
    [Key in keyof T]-?: T[Key] extends TType | undefined ? Key : never;
}[keyof T];
/**
 * Show TypeScript that the fields we're interested in are of type `TType`
 */
declare type OnlyType<T, TType> = {
    [Key in KeysOfType<T, TType>]?: TType;
};
export declare const offsetForIndex: <T>(index: number, items: DataWithOffset<OnlyType<T, number>>[], sizeKey: KeysOfType<T, number>) => number;
declare type Allowed<TItem, TParent> = OnlyType<TItem, SetParentFunc<TParent>>;
export declare function updateDisplacedChildren<TItem, TParent>(startIndex: number, items: Array<DataWithOffset<OnlyType<TItem, number> & Allowed<TItem, TParent>>>, parent: TParent, sizeKey: keyof OnlyType<TItem, number>, setParentFuncKey: keyof Allowed<TItem, TParent>): void;
export {};

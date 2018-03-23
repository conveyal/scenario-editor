// flow-typed signature: 0b826327269d7d14f59dd65ade0ccc67
// flow-typed version: da30fe6876/redux-actions_v1.x.x/flow_>=v0.25.x

declare module "redux-actions" {
  declare type DefaultState = Object | number | string | boolean | Array<any>;
  declare function createAction(
    type: string | Symbol,
    payloadCreator?: Function,
    metaCreator?: Function
  ): Function;
  declare function createActions(
    ...actionCreators: Array<string | Symbol | Function>
  ): { [actionCreators: string]: Function };
  declare function handleAction(
    type: string,
    reducer: Object | Function,
    defaultState: DefaultState
  ): Function;
  declare function handleActions(
    reducerMap: Object,
    defaultState: DefaultState
  ): Function;
  declare function combineActions(
    ...actions: Array<Function | string | Symbol>
  ): string;
}

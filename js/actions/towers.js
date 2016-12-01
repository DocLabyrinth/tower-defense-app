import { createActions } from 'redux-actions';
import * as ActionTypes from '../constants/ActionTypes';

export const { towerBuild, towerStateChange } = createActions({
  [ActionTypes.TOWER_BUILD]: (position, type) => ({type, position}),
  [ActionTypes.TOWER_STATE_CHANGE]: (position, towerState) => ({position, towerState}),
})

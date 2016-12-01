import { createActions } from 'redux-actions';
import * as ActionTypes from '../constants/ActionTypes';

export const { giveMoney, spendMoney } = createActions({
  [ActionTypes.GIVE_MONEY]: (key, value) => ({ [key]: {amount: value} }),
  [ActionTypes.MONEY_SPEND]: (key, value) => ({ [key]: {amount: -value} }),
})

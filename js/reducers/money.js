import * as ActionTypes from '../constants/ActionTypes';
// import * as ErrorTypes from '../errors/money';
import { handleActions } from 'redux-actions';

export default handleActions({
  [ActionTypes.SPEND_MONEY]: (state, { payload: { amount } }) => {
    return  {...state, balance: state.balance - amount}
  },
  [ActionTypes.GIVE_MONEY]: (state, { payload: { amount } }) => {
    return {...state, balance: state.balance + amount}
  }
}, {balance: 100})

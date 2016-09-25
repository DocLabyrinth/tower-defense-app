import noop from 'lodash/noop';
import rest from 'lodash/_baseRest';
import onlyOnce from './internal/onlyOnce';

export default function doWhilstWithState(state, iteratee, test, callback) {
    var next = rest(function(err, args) {
        if (err) return callback(err);
        if (test.apply(this, args)) return iteratee(state, next);
        callback.apply(null, [null].concat(args));
    });
    iteratee(next);
}

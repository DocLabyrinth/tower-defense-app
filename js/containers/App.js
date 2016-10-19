import React from 'react';
import {Provider} from 'react-redux';
import Home from '../components/Home';
import {renderDevTools} from '../utils/devTools';

export default React.createClass({
  render() {
    return (
      <div>

        {/* <Home /> is your app entry point */}
        <Home />

        {/* only renders when running in DEV mode */
          renderDevTools(store)
        }
      </div>
    );
  }
});

import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch,} from 'react-router-dom';
import HomePage from './pages/HomePage';
import TimingAttack from './pages/TimingAttack';
import WebCachePoisoning from './pages/WebCachePoisoning';
import JasonWeb from './pages/JasonWeb';
import NotFoundPage from './pages/NotFoundPage';
import NavBar from './NavBar';
import './App.css';
import {timingAttack, webCachePoisoning, jwt} from "./constants/urls";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <NavBar />
          <div id="page-body">
            <Switch>
              <Route path="/" component={HomePage} exact />
              <Route path={timingAttack} component={TimingAttack} />
              <Route path={webCachePoisoning} component={WebCachePoisoning} />
              <Route path={jwt} component={JasonWeb} />
              <Route component={NotFoundPage} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;

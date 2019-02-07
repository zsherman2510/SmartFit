import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import TrainerRegister from "./components/auth/TrainerRegister";
import TrainerLogin from "./components/auth/TrainerLogin";
import ClientRegister from "./components/auth/ClientRegister";
import ClientLogin from "./components/auth/ClientLogin";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />

          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/trainer/register" component={TrainerRegister} />
            <Route exact path="/trainer/login" component={TrainerLogin} />
            <Route exact path="/client/register" component={ClientRegister} />
            <Route exact path="/client/login" component={ClientLogin} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;

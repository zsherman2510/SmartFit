import React, { Component } from "react";
import { Link } from "react-router-dom";

class Landing extends Component {
  render() {
    return (
      <div className="landing">
        <div className="dark-overlay landing-inner text-light">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h1 className="display-3 mb-4">SmartFit</h1>
                <p className="lead">
                  Connecting Clients with Trainers so everyone can meet their
                  training goals.
                </p>
                <hr />
                <Link
                  to="/trainer/register"
                  className="btn btn-lg btn-info mr-2"
                >
                  Trainers Sign-up
                </Link>
                <Link to="/client/register" className="btn btn-lg btn-light">
                  Clients Sign-up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;

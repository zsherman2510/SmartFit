import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutClient } from "../../action/authAction";

class Navbar extends Component {
  onLogoutClick(e) {
    e.preventDefault();
    this.props.logoutClient();
  }
  render() {
    const { isAuthenticated, client } = this.props.auth;

    const clientAuthLinks = (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a
            href="/"
            onClick={this.onLogoutClick.bind(this)}
            className="nav-link"
          >
            <img
              className="rounded-circle"
              src={client.avatar}
              alt={client.name}
              style={{ width: "25px", marginRight: "5px" }}
            />
            Logout
          </a>
        </li>
      </ul>
    );

    const guestLinks = (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/client/login">
            Login
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/client/register">
            Sign Up
          </Link>
        </li>
      </ul>
    );
    return (
      <nav className="navbar navbar-expand-sm mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">
            SmartFit
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#mobile-nav"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mobile-nav">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/clients">
                  {" "}
                  Find a New Gym Partner
                </Link>
              </li>
            </ul>
          </div>
          {isAuthenticated ? clientAuthLinks : guestLinks}
        </div>
      </nav>
    );
  }
}

Navbar.propTypes = {
  logoutClient: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutClient }
)(Navbar);

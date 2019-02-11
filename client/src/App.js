import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentClient, logoutClient } from './action/authAction';
import { Provider } from 'react-redux';
import store from './store';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';

import ClientRegister from './components/auth/ClientRegister';
import ClientLogin from './components/auth/ClientLogin';

import './App.css';

//Check for token
if (localStorage.jwtToken) {
	// Set auth token header auth
	setAuthToken(localStorage.jwtToken);
	// decode token and get user info and exp
	const decoded = jwt_decode(localStorage.jwtToken);
	// Set user and isAuthenticated
	store.dispatch(setCurrentClient(decoded));

	// check for expired token
	const currentTime = Date.now() / 1000;
	if (decoded.exp < currentTime) {
		// logout user
		store.dispatch(logoutClient());
		//TODO: clear current profile

		// redirect to homepage
		window.location.href = '/';
	}
}

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Router>
					<div className="App">
						<Navbar />

						<Route exact path="/" component={Landing} />
						<div className="container">
							<Route exact path="/client/register" component={ClientRegister} />
							<Route exact path="/client/login" component={ClientLogin} />
						</div>
						<Footer />
					</div>
				</Router>
			</Provider>
		);
	}
}

export default App;

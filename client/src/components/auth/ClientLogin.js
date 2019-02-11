import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import classnames from 'classnames';
import { loginClient } from '../../action/authAction';
import TextFieldGroup from '../common/TextFieldGroup';

class ClientLogin extends Component {
	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
			errors: {}
		};
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	componentDidMount() {
		if (this.props.auth.isAuthenticated) {
			this.props.history.push('/dashboard');
		}
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.errors) {
			return { errors: nextProps.errors };
		}
		return null;
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.errors !== this.props.errors) {
			this.setState({ errors: this.props.errors });
		}
		if (this.props.auth.isAuthenticated) {
			this.setState({ isAuthenticated: this.props.auth.isAuthenticated });
			this.props.history.push('/dashboard');
		}
	}
	onChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	onSubmit(e) {
		e.preventDefault();

		const clientData = {
			email: this.state.email,
			password: this.state.password
		};
		this.props.loginClient(clientData);
	}

	render() {
		const { errors } = this.state;

		return (
			<div className="login">
				<div className="container">
					<div className="row">
						<div className="col-md-8 m-auto">
							<h1 className="display-4 text-center">Log In</h1>
							<p className="lead text-center">Sign in to your SmartFit Trainee account</p>
							<form onSubmit={this.onSubmit}>
								<TextFieldGroup
									placeholder="Email Address"
									name="email"
									type="email"
									value={this.state.email}
									onChange={this.onChange}
									error={errors.email}
								/>
								<TextFieldGroup
									placeholder="Password"
									name="password"
									type="password"
									value={this.state.password}
									onChange={this.onChange}
									error={errors.password}
								/>
								<div className="invalid-feedback">{errors.password}</div>

								<input type="submit" className="btn btn-info btn-block mt-4" />
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
ClientLogin.propTypes = {
	loginClient: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
});
export default connect(mapStateToProps, { loginClient })(ClientLogin);

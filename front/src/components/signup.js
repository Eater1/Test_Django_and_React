import React, { Component } from 'react';
import axiosInstance from '../axiosApi';

class Signup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            errors:{}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }


    async handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/create/', {
                username: this.state.username,
                password: this.state.password
            });
            return response;
        } catch (error) {
            console.log(error.stack);
            this.setState({
                errors:error.response.data
            });
        }
    }

  render() {
    return (
            <div>
                Регистрация
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Пользователь:
                        <input name="username" type="text" value={this.state.username} onChange={this.handleChange}/>
                        { this.state.errors.username ? this.state.errors.username : null}
                    </label>
                    <br/>
                    <label>
                        Пароль:
                        <input name="password" type="password" value={this.state.password} onChange={this.handleChange}/>
                        { this.state.errors.password ? this.state.errors.password : null}
                    </label>
                    <br/>
                    <input type="submit" value="Регистрация"/>
                </form>
            </div>
    );
  }
}

export default Signup;
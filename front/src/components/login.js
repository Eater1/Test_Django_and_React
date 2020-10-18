import React, { Component } from 'react';
import axiosInstance from '../axiosApi';


class Login extends Component {

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

    // Метод отвечающий за добавление токена пользователю при входе
    async handleSubmit(event) {
        event.preventDefault();
        try {
            // Создаем post запрос добавляя в тело запроса логин пользователя и пароль
            const response = await axiosInstance.post('/token/obtain/', {
                username: this.state.username,
                password: this.state.password
            });
            // В экземпляр класса axiosInstance записываем токен доступа
            axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
            // В локальное хранилище помещаем токен доступа и обновления
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            // Если post запрос имеет статус 200 то перенаправляем основную страницу
            if (response.status==200)
                window.location.href = '/product_list/';
            return response;
        } catch (error) {
            this.setState({
                errors:error.response.data
            });
        }
    }

    render() {
        return (
            <div>
                Войти
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
                    <input type="submit" value="Войти"/>
                </form>
            </div>
       )
   }
}

export default Login;
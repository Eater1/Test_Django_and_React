import React, {Component} from 'react';
import {Switch, Route, Link} from 'react-router-dom'
import './App.css';
import Login from './components/login';
import Signup from './components/signup';
import axiosInstance from './axiosApi';
import Product_list from './components/product_list';


class App extends Component {

    constructor() {
        super();
        this.state = {
            logIn:true
        };
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount(){
        if(localStorage.getItem('access_token')) {
            this.setState({
                logIn:false
            })
        }
    }

    // Метод отвечающий за занесение токена в черный список
    async handleLogout() {
    try {
        const response = await axiosInstance.post('/blacklist/', {
            "refresh_token": localStorage.getItem("refresh_token")
        });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        axiosInstance.defaults.headers['Authorization'] = null;
        window.location.href = '/login/';
        return response;
    }
    catch (error) {
        console.log(error);
    }
};

    render() {
        return (
            <div className="site">
                <nav>
                    <Link className={"nav-link"} to={"/login/"}>Войти</Link>
                    {
                        this.state.logIn &&
                             <Link className={"nav-link"} to={"/signup/"}>Регистрация</Link>
                    }
                    <Link to={"/login/"}><button onClick={this.handleLogout}>Выйти</button></Link>
                </nav>
                <main>
                    <h1>Сервис: "Информация о товаре"</h1>

                    <Switch>
                        <Route exact path={"/login/"} component={Login}/>
                        <Route exact path={"/signup/"} component={Signup}/>
                        <Route exact path={"/product_list/"} component={Product_list}/>
                    </Switch>
                </main>
            </div>
        );
    }
}

export default App;

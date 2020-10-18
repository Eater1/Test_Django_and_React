import React, { Component } from 'react';
import axiosInstance from "../axiosApi";

class Product_list extends Component {

        constructor(props) {
        super(props);
        this.state = {
            message:"",
            cover: null,
            name_product: "",
            amount_product: "",
            bar_code: "",
            price: "",
            err_message: "",
            errors:{}
        };

        this.getMessage = this.getMessage.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTextSubmit = this.handleTextSubmit.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
    }

    async getMessage(){
    try {
        let response = await axiosInstance.get('/hello/');
        console.log(response.data.access);
        const message = response.data.hello;
        this.setState({
            message: message,
        });
        return message;
    }catch(error){
        console.log("Error: ", JSON.stringify(error, null, 4));
        throw error;
       }
    }

    handleChange(event) {
        this.setState({[event.target.id]: event.target.value});
    }

    handleTextChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleImageChange(event) {
        this.setState({cover: event.target.files[0]});
    }

    async handleSubmit(event) {
        event.preventDefault();
        try {
            console.log(localStorage.getItem('access_token'));
            // Создаем новый обьект FormData (HTML-форму)
            let form_data = new FormData();
            // В нашу форму добавляем информацию о загруженном файле
            form_data.append('cover', this.state.cover, this.state.cover.name);
            const response = await axiosInstance.post('/product/', form_data);
            console.log('+++');
            console.log(response.data.access);
            console.log(localStorage.getItem('access_token'));
            const message = response.data.err;

            if (!!message) {
                this.setState({
                     err_message: message,
                     name_product: "",
                     amount_product: "",
                     price: ""
                });
            } else {
                const name = response.data.map(product => product.name);
                const amount = response.data.map(product => product.amount);
                const price = response.data.map(product => product.price);
                this.setState({
                     name_product: name,
                     amount_product: amount,
                     price: price,
                     err_message: ""
                });
            }
            return response;
        } catch (error) {
            if (error.response) {
                console.log(error.stack);
                this.setState({
                     errors:error.response.data
               });
            } else if (error.request) {
               console.log(error.request);
            } else {
               console.log('Error', error.message);
            }
        }
    }


    async handleTextSubmit(event) {
        event.preventDefault();
        try {
            // Создаем post запрос добавляя в тело запроса логин пользователя и пароль
            console.log(localStorage.getItem('access_token'));
            const response = await axiosInstance.post('/product-text/', {
                vendor_code: this.state.bar_code
            });
            const message = response.data.err;

            if (!!message) {
                this.setState({
                    err_message: message,
                    name_product: "",
                    amount_product: "",
                    price: ""
                });
            } else {
                const name = response.data.map(product => product.name);
                const amount = response.data.map(product => product.amount);
                const price = response.data.map(product => product.price);
                this.setState({
                    name_product: name,
                    amount_product: amount,
                    price: price,
                    err_message: ""
                });
            }
            return response;
        } catch (error) {
            if (error.response) {
                console.log(error.stack);
                this.setState({
                     errors:error.response.data
               });
            } else if (error.request) {
               console.log(error.request);
            } else {
               console.log('Error', error.message);
            }
        }
    }

    componentDidMount(){
        this.getMessage();
    }

    render(){
        return (
            <div>
                <p>{this.state.message}</p>
                <p>Можете загрузить штрих код в виде файла или ввести вручную</p>
                <p>Название товара:</p><p>{this.state.name_product}</p>
                <p>Количество товара:</p><p>{this.state.amount_product}</p>
                <p>Цена товара (руб.):</p><p>{this.state.price}</p>
                <p>Загрузите файл картинки штрих кода:</p>
                <form onSubmit={this.handleSubmit}>
                    <p>
                        <input type='file' id='cover' accept='image/svg+xml, image/png, image/jpeg' onChange={this.handleImageChange} required/>
                    </p>
                    <input type='submit' value="Отправить файл"/>
                </form>
                <p>Введите числа изображённые на штрих коде:</p>
                <form onSubmit={this.handleTextSubmit}>
                    <label>
                        <input name="bar_code" type="text" value={this.state.bar_code} onChange={this.handleTextChange} maxLength="13"/>
                        { this.state.errors.bar_code ? this.state.errors.bar_code : null}
                    </label>
                    <input type="submit" value="Отправить текст"/>
                </form>
                <p>{this.state.err_message}</p>
            </div>
        )
    }
}
export default Product_list;
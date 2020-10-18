import axios from 'axios'

const baseURL = 'http://127.0.0.1:8000/api/';
// Создаем экземпляр axiosInstance благодаря этому при каждом
// вызове он будет автоматически заполнять поля нужными данными
const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        'Authorization': localStorage.getItem('access_token') ? "JWT " + localStorage.getItem('access_token') : null,
        // 'Content-Type': 'application/json',
        'accept': 'application/json'
    }
});

console.log(localStorage.getItem('access_token'));
console.log(localStorage.getItem('refresh_token'));
// Перехватчик
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;
        // Предотвращает бесконечные циклы
        if (error.response.status === 401 && originalRequest.url === baseURL+'token/refresh/') {
            window.location.href = '/login/';
            return Promise.reject(error);
        }

        if (error.response.status === 401 &&
            error.response.statusText === "Unauthorized")
            {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken){
                    const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));
                    const now = Math.ceil(Date.now() / 1000);
                    console.log(tokenParts.exp);

                    if (tokenParts.exp > now) {
                        // Создаем post запрос на обновление нашего токена
                        return axiosInstance
                        .post('/token/refresh/', {refresh: refreshToken})
                        .then((response) => {

                            localStorage.setItem('access_token', response.data.access);
                            localStorage.setItem('refresh_token', response.data.refresh);

                            axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
                            originalRequest.headers['Authorization'] = "JWT " + response.data.access;
                            // Новый токен возвращаем исходному запросу
                            return axiosInstance(originalRequest);
                        })
                        .catch(err => {
                            console.log(err)
                        });
                    }else{
                        console.log("Refresh token is expired", tokenParts.exp, now);
                        window.location.href = '/login/';
                    }
                }else{
                    console.log("Refresh token not available.")
                    window.location.href = '/login/';
                }
        }
      return Promise.reject(error);
  }
);

export default axiosInstance;
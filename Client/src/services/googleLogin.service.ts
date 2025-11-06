// import { Product } from '../models/product.model';
// import { User } from '../models/user.model';
import api, { } from "./httpService"


class GoogleLoginService {

    BASE_URL: string = "/googleLogin";

    googleLogin(token: string) {
        console.log("In googleLogin service with token:", token);
        return api.post(`${this.BASE_URL}/google`, { token })
            .then(res => res.data)
            .catch(error => {
                console.error('Error during Google login:', error)
                throw error
            });
    }

    // loginUser(data: any) {
    //     return api.post(`${this.BASE_URL}/login`, data)
    //         .then(res => res.data)
    //         .catch(error => {
    //             console.error('Error during login:', error)
    //             throw error
    //         });

    // }
}


export default new GoogleLoginService()
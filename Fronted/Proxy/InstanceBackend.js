import axios from "axios";

const instanceBackend=axios.create({
    baseURL:'http://localhost:3001',
    withCredentials:true
})

export default instanceBackend;
import axios from "axios";

const instanceBackend=axios.create({
    baseURL:'http://localhost:3001',
})

export default instanceBackend;
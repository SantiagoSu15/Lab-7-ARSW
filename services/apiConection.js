import axios from 'axios'


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000,
})


export const bluePrintApi ={
  getByAuthor: async (author) =>{
    const res = await axios.get(`/blueprints/${author}`).catch((error)=>{
      throw new Error(error.response.data.message)
    });
    return res;
  },

  getByAuthorAndBname: async (author,bpname) =>{
    const res = await axios.get(`/blueprints/${author}/${bpname}`).catch((error)=>{
      throw new Error(error.response.data.message)
    });
    return res;
  },

  createBluePoint: async (bluePrintRequest) =>{
    const res = await axios.post(`/blueprints`,bluePrintRequest).catch((error)=>{
      throw new Error(error.response.data.message)
    });
    return res;
  },

  editBluePoint: async (author,bpname,points) =>{
    const res = await api.put(`/${author}/${bpname}/points`, points).catch((error)=>{
      throw new Error(error.response.data.message)
    });
    return res;
  },

  deleteBluePoint: async (author,bpname) =>{
    const res = await api.delete(`/${author}/${bpname}`).catch((error)=>{
      throw new Error(error.response.data.message)
    });
    return res;
  }
}


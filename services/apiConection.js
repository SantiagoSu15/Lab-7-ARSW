import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000,
})

export const bluePrintApi = {
  getByAuthor: async (author) => {
    const res = await api.get(`/blueprints/${author}`).catch((error) => {  
      throw new Error(error.response?.data?.message)
    });
    return res.data;  
  },

  getByAuthorAndBname: async (author, bpname) => {
    const res = await api.get(`/blueprints/${author}/${bpname}`).catch((error) => {  
      throw new Error(error.response?.data?.message)
    });
    return res.data;  
  },

  createBluePoint: async (bluePrintRequest) => {
    const res = await api.post(`/blueprints`, bluePrintRequest).catch((error) => {  
      throw new Error(error.response?.data?.message)
    });
    return res.data;
  },

  editBluePoint: async (author, bpname, point) => {
    const res = await api.put(`/blueprints/${author}/${bpname}/points`, point).catch((error) => {  
      throw new Error(error.response?.data?.message)
    });
    return res.data;
  },

  deleteBluePoint: async (author, bpname) => {
    const res = await api.delete(`/blueprints/${author}/${bpname}`).catch((error) => {
      throw new Error(error.response?.data?.message)
    });
    return res.data;
  }
}
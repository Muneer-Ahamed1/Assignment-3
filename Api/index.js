const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with the actual origin of your client
  credentials: true, // Allow credentials (e.g., cookies, HTTP authentication)
}));
app.post('/getAllValidation', async (req, res) => {
  console.log(req.body);
  const { token, instance_url } = req.body;
  
  try {
    const response = await axios.get(`${instance_url}/services/data/v35.0/tooling/query/?q=SELECT+Id,ValidationName,Active,Description,EntityDefinition.DeveloperName,ErrorDisplayField,ErrorMessage+FROM+ValidationRule`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);

    res.send(response.data);
  } catch (error) {
    console.error('Error fetching data from Salesforce:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







app.patch('/deployData', async (req, res) => {
  console.log(req.body)
  const {data,isLogin}=req.body
  const{token,instance_url}=isLogin;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log(isLogin)

  const promises = data.map(async (item) => {
    try {
      const response = await getByIdValidation(item.Id,instance_url,headers);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  const array = await Promise.all(promises);

  for (let i = 0; i < array.length; i++) {
    let vl = array[i];
    let itemIndex = data.findIndex((item) => item.Id === vl.Id);


    if (itemIndex !== -1) {
      vl.Active = !(data[itemIndex].Active);
      vl.Metadata.active = !(data[itemIndex].Active);
    }

    array[i] = vl;
  }

  console.log(array);

  res.send( Promise.all(
    array.map(async (vl) => {
      try {
        const response = await axios.patch(
          `${instance_url}/services/data/v35.0/tooling/sobjects/ValidationRule/${vl.Id}`,
          {
            Metadata: { ...vl.Metadata },
          },
          { headers: headers }
        );
        return response;
      } catch (e) {
        throw e;
      }
    })
  ));
});

const getByIdValidation = async (id,instance_url,headers) => {
  try {
    const response = await axios.get(
      `${instance_url}/services/data/v35.0/tooling/sobjects/ValidationRule/${id}`,
      {
        headers: headers,
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};



const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

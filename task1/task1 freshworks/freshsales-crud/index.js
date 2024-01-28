
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());


const crmContacts = [];
const databaseContacts = [];

app.post('/create-contact', async (req, res) => {
  try {
    const freshsalesApiUrl = 'https://student-671544122208231655.myfreshworks.com/crm/sales/api/contacts';
    const authToken = 'HkbMcgShUIQr0iEDKrBgAw'; 

    const headers = {
      'Authorization': `Token token=${authToken}`,
      'Content-Type': 'application/json',
    };

    const requestData = {
      contact: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        mobile_number: req.body.mobile_number,
      },
    };

    let response;
    if (req.body.data_store === 'CRM') {
      // Create contact in CRM
      response = await axios.post(freshsalesApiUrl, requestData, { headers });
      crmContacts.push(response.data);
    } else if (req.body.data_store === 'DATABASE') {
      // Create contact in simulated database
      databaseContacts.push(requestData.contact);
      response = { data: requestData.contact, status: 200 };
    } else {
      throw new Error('Invalid data_store parameter. Supported values: CRM, DATABASE');
    }


    console.log('Response:', response.data);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error:', error.message);

    res.status(400).json({ error: error.message });
  }
});

app.get('/get-contacts/:data_store', (req, res) => {

  const dataStore = req.params.data_store.toUpperCase();
  const contacts = dataStore === 'CRM' ? crmContacts : (dataStore === 'DATABASE' ? databaseContacts : []);

  res.json(contacts);
});
app.get('/get-contact/:data_store', async (req, res) => {
  const contactId = req.body.contact_id;
  const dataStore = req.params.data_store.toUpperCase();

  try {
    let contact;

    if (dataStore === 'CRM') {
      
      const freshsalesApiUrl = `https://student-671544122208231655.myfreshworks.com/crm/sales/api/contacts/${contactId}`;
      const authToken = 'HkbMcgShUIQr0iEDKrBgAw';
      const headers = {
        'Authorization': `Token token=${authToken}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.get(freshsalesApiUrl, { headers });
      contact = response.data;
    } else if (dataStore === 'DATABASE') {
      // Fetch the contact from the simulated database based on contact_id
      contact = contacts.find(c => c.id === contactId);
    } else {
      return res.status(400).json({ error: 'Invalid data_store parameter. Use "CRM" or "DATABASE".' });
    }

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error:', error.response.data);
    res.status(error.response.status || 500).json({ error: error.message });
  }
});
app.post('/update-contact/:data_store', async (req, res) => {
   const contactId = req.body.contact_id;
   const dataStore = req.params.data_store.toUpperCase();
 
   try {
     let updatedContact;
 
     if (dataStore === 'CRM') {
   
       const freshsalesApiUrl = `https://student-671544122208231655.myfreshworks.com/crm/sales/api/contacts/${contactId}`;
       const authToken = 'HkbMcgShUIQr0iEDKrBgAw';
       const headers = {
         'Authorization': `Token token=${authToken}`,
         'Content-Type': 'application/json',
       };
 
       const updateData = {
         contact: {
           email: req.body.email,
           mobile_number: req.body.mobile_number,
         },
       };
 
       const response = await axios.put(freshsalesApiUrl, updateData, { headers });
       updatedContact = response.data;
     } else if (dataStore === 'DATABASE') {
     
       const existingContactIndex = contacts.findIndex(c => c.id === contactId);
 
       if (existingContactIndex !== -1) {
         contacts[existingContactIndex].email = req.body.email;
         contacts[existingContactIndex].mobile_number = req.body.mobile_number;
         updatedContact = contacts[existingContactIndex];
       } else {
         return res.status(404).json({ error: 'Contact not found.' });
       }
     } else {
       return res.status(400).json({ error: 'Invalid data_store parameter. Use "CRM" or "DATABASE".' });
     }
 
     if (!updatedContact) {
       return res.status(404).json({ error: 'Contact not found.' });
     }
 
     res.json(updatedContact);
   } catch (error) {
     console.error('Error:', error.response.data);
     res.status(error.response.status || 500).json({ error: error.message });
   }
 });
 app.post('/delete-contact/:data_store', async (req, res) => {
   const contactId = req.body.contact_id;
   const dataStore = req.params.data_store.toUpperCase();
 
   try {
     let deletedContact;
 
     if (dataStore === 'CRM') {
      
       const freshsalesApiUrl = `https://student-671544122208231655.myfreshworks.com/crm/sales/api/contacts/${contactId}`;
       const authToken = 'HkbMcgShUIQr0iEDKrBgAw';
       const headers = {
         'Authorization': `Token token=${authToken}`,
         'Content-Type': 'application/json',
       };
 
       const response = await axios.delete(freshsalesApiUrl, { headers });
       deletedContact = response.data;
     } else if (dataStore === 'DATABASE') {
       
       const existingContactIndex = contacts.findIndex(c => c.id === contactId);
 
       if (existingContactIndex !== -1) {
         deletedContact = contacts.splice(existingContactIndex, 1)[0];
       } else {
         return res.status(404).json({ error: 'Contact not found.' });
       }
     } else {
       return res.status(400).json({ error: 'Invalid data_store parameter. Use "CRM" or "DATABASE".' });
     }
 
     if (!deletedContact) {
       return res.status(404).json({ error: 'Contact not found.' });
     }
 
     res.json(deletedContact);
   } catch (error) {
     console.error('Error:', error.response.data);
     res.status(error.response.status || 500).json({ error: error.message });
   }
 });
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const connection = mysql.createConnection({
   host: '127.0.0.1',
   user: 'root',
   password: 'root',
   database: 'root'
});

connection.connect(err => {
   if (err) {
      console.error('Error connecting to MySQL:', err);
   } else {
      console.log('Connected to MySQL database');
   }
});


app.post('/createContact', (req, res) => {
   const { first_name, last_name, email, mobile_number } = req.body;

   const sql = 'INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)';
   connection.query(sql, [first_name, last_name, email, mobile_number], (err, results) => {
      if (err) {
         console.error('Error creating contact:', err);
         return res.status(500).json({ error: 'Internal server error' });
      }

      const newContact = { id: results.insertId, first_name, last_name, email, mobile_number };
      res.status(201).json({ message: 'Contact created', contact: newContact });
   });
});

app.get('/getAllContacts', (req, res) => {
   const sql = 'SELECT * FROM contacts';
   connection.query(sql, (err, results) => {
      if (err) {
         console.error('Error retrieving contacts:', err);
         return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ contacts: results });
   });
});


app.put('/updateContact/:id', (req, res) => {
   const { first_name, last_name, email, mobile_number } = req.body;
   const contactId = req.params.id;

   const sql = 'UPDATE contacts SET first_name=?, last_name=?, email=?, mobile_number=? WHERE id=?';
   connection.query(sql, [first_name, last_name, email, mobile_number, contactId], (err, results) => {
      if (err) {
         console.error('Error updating contact:', err);
         return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ message: 'Contact updated' });
   });
});

app.delete('/deleteContact/:id', (req, res) => {
   const contactId = req.params.id;

   const sql = 'DELETE FROM contacts WHERE id=?';
   connection.query(sql, [contactId], (err, results) => {
      if (err) {
         console.error('Error deleting contact:', err);
         return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ message: 'Contact deleted' });
   });
});


app.get('/getContact/:id', (req, res) => {
   const contactId = req.params.id;

   const sql = 'SELECT * FROM contacts WHERE id=?';
   connection.query(sql, [contactId], (err, results) => {
      if (err) {
         console.error('Error retrieving contact:', err);
         return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
         return res.status(404).json({ error: 'Contact not found' });
      }

      res.status(200).json({ contact: results[0] });
   });
});

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});

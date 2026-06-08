const express = require('express');
const app = express();

app.get('/bills/:id', (req, res) => res.send('MATCHED /bills/:id'));
app.get('/bills/:id/pdf', (req, res) => res.send('MATCHED /bills/:id/pdf'));

const request = require('supertest');
request(app)
  .get('/bills/7cfffb3c-eb1c-49ee-9479-1070eaa7b312/pdf')
  .expect(200)
  .end((err, res) => {
    console.log(res.text);
  });

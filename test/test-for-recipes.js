const chai = require('chai');
const chaiHttp = require('chai-http');

let {app} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    })
    .on('error', err => {
      reject(err);
    });
  });
}

//... closeServer defined here

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

describe('Recipes', function() {
    it('should list items on GET', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        // because we create three items on app load
        res.body.length.should.be.at.least(1);
        // each item should be an object with key/value pairs
        // for `id`, `name` and `checked`.
        const expectedKeys = ['name', 'ingredients'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });
});

it('should add an item on POST', function() {
  const newItem = {name: 'KFC', ingredients: ['chicken', '11 secret herbs and spices']};
  return chai.request(app)
    .post('/recipes')
    .send(newItem)
    .then(function(res) {
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.include.keys('id', 'name', 'ingredients');
      res.body.id.should.not.be.null;
      // response should be deep equal to `newItem` from above if we assign
      // `id` to it from `res.body.id`
      res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
    });
});

it('should update items on PUT', function() {
    const updateData = {
      name: 'foo',
      ingredients: ['bacon', 'lettuce', 'tomato']
    };
    return chai.request(app)
      // first have to get so we have an idea of object to update
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData)
      })
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });
  });

it('should delete items on DELETE', function() {
  return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
    .get('/recipes')
    .then(function(res) {
      return chai.request(app)
        .delete(`/recipes/${res.body[0].id}`);
    })
    .then(function(res) {
      res.should.have.status(204);
    });
});
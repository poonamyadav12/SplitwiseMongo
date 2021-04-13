import chai, { should } from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
chai.use(chaiHttp);
chai.use(should)

console.log = function () { };

describe('Task Get User Specific Activities', () => {

  describe("Test GET route /user/activity", () => {
    it("should return all tasks", (done) => {
      chai.request(app)
        .get("/user/activity?userId=hritik@gmail.com")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body.length.should.not.be.eq(0);
          done();
        });
    });
  })
});

describe('/POST signup', () => {
  it('should return signed up user response', (done) => {

    let user = {
      "user":
      {
        "avatar": "https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby47-100px.png",
        "default_currency": "USD",
        "email": "priya.yadav@gmail.com",
        "first_name": "Priya",
        "last_name": "Yadav",
        "password": "Abc@1234",
        "registration_status": "JOINED",
        "time_zone": "Europe/Berlin"
      }
    }
    chai.request(app)
      .post('/user/signup')
      .send(user)
      .end((err, res) => {
        console.log("Response signup", res);
        res.should.have.status(500);
        done();
      });
  });
});

describe('/POST login', () => {
  it('should return invalid login user response', (done) => {

    let user = {
      id: "michael@gmail.com",
      password: "Abc@12345"
    }
    chai.request(app)
      .post('/user/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);

        done();
      });
  });

});

describe('/POST login correct', () => {
  it('should return correct login user response', (done) => {

    let user = {
      id: "michael@gmail.com",
      password: "Abc@1234"
    }
    chai.request(app)
      .post('/user/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        done();
      });
  });
});

describe('/Get transaction request', () => {
  it('should return user transaction response', (done) => {

    chai.request(app)
      .get('/user/transactions?userId=hritik@gmail.com')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });
});

describe('/Put transaction request', () => {
  it('should return user transaction response', (done) => {
    let user = {
      "user":
      {
        "avatar": "https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby47-100px.png",
        "default_currency": "USD",
        "email": "hritik@gmail.com",
        "first_name": "Hritik",
        "last_name": "Roshan",
        "password": "Abc@1234",
        "registration_status": "JOINED",
        "time_zone": "Europe/Berlin"
      }
    }
    chai.request(app)
      .put('/user/update')
      .send(user)
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.a('object');
        done();
      });
  });
});

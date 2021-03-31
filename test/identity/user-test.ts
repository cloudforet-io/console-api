import { describe } from 'mocha';
import { supertest, assert } from '../index';


export default {
    UserserviceCommon() {
        describe('API User Service tests', () => {
            const server = supertest.agent('http://localhost:3000');
            // @ts-ignore
            it('getAllusers', () => {
                server.post('/api/users')
                    .set('Content-Type', 'application/json')
                    .send({
                        userName: 'dummyTest',
                        password: 'this_is_my_secret_paassword',
                        userFirstName: 'draken',
                        userLastName: 'Guard',
                        email: 'ka@hotmail.com'
                    }).expect(200)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        res.status.should.equal(200);
                    });
            });

      //TODO: Please Create a rest of API's in this module.
      /* it('getUsersByFirstName', () => {
        assert.equal(1, 1);
      });
      it('getUsersByLastName', () => {
        assert.equal(1, 1);
      });
      it('getSingleUser', () => {
        assert.equal(1, 1);
      });
      it('getSingleUserByFirstName', () => {
        assert.equal(1, 1);
      });
      it('getSingleUserByLastName', () => {
        assert.equal(1, 1);
      });
      it('createUser', () => {
        assert.equal(1, 1);
      });
      it('deleteUser', () => {
        assert.equal(1, 1);
      });
      it('createUser', () => {
        assert.equal(1, 1);
      });
      it('updateUser', () => {
        assert.equal(1, 1);
      }); */
        });
    }
};

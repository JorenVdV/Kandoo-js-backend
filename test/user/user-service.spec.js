/**
 * Created by steve on 2/9/2017.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const userService = require('../../services/user-service');
const User = require('../../models/user');

describe('User service tests', function () {
    it('Creating a single user', async function () {
        let user = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
        assert.isOk(user);
        assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
        assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
        assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
        assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
        assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');

        let successful = await userService.removeUser(user._id);
        assert.isTrue(successful);
    });

    describe('Creating two users - different email', function () {
        let createUser_user1;
        let createUser_user2;

        it('user1', async function () {
            createUser_user1 = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(createUser_user1);
        });

        it('user2', async function () {
            createUser_user2 = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp2@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(createUser_user2);

        });

        after('Remove users', async function () {
            let successful = await userService.removeUser(createUser_user1._id);
            assert.isTrue(successful);

            successful = await userService.removeUser(createUser_user2._id);
            assert.isTrue(successful);
        })
    });

    describe('Creating two users - same email', function () {
        let createUser_user1;

        it('user1', async function () {
            createUser_user1 = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(createUser_user1);
        });

        it('user2', async function () {
                try {
                    let user = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
                    assert.isNotOk(user);
                } catch (err) {
                    assert.isOk(err);
                    assert.strictEqual(err.message, 'Email address is already in use', 'user should not have been created');
                }
            }
        );

        after('Remove user', async function () {
            let successful = await userService.removeUser(createUser_user1._id);
            assert.isTrue(successful);
        })
    });

    describe('Find a user', function () {
        let findUser_user;
        before('Create a user to find', async function () {
            findUser_user = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(findUser_user);
        });

        it('by email - existing email', async function () {
            let user = await userService.getUserByEmail(findUser_user.emailAddress);
            assert.isOk(user);

            assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
            assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
            assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
            assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
            assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');
        });

        it('by email - non existing email', async function () {
            try {
                let user = await userService.getUserByEmail('blablaEmail@nonexistant.com');
                assert.isNotOk(user);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, "Unable to find user with email: " + 'blablaEmail@nonexistant.com', "Should not be able to find this user");
            }
        });

        it('by id - existing id', async function () {
            let user = await userService.getUserById(findUser_user._id);
            assert.isOk(user);
            assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
            assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
            assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
            assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
            assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');
        });

        it('by id - non existing id', async function () {
            try {
                let user = await userService.getUserById('00aa0aa000a000000a0000aa');
                assert.isNotOk(user);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, "Unable to find user with id: " + '00aa0aa000a000000a0000aa', "Should not be able to find this user");
            }
        });

        after('Remove the created user', async function () {
            let successful = await userService.removeUser(findUser_user._id);
            assert.isTrue(successful, 'user should have succesfully been deleted');
        });

    });

    describe('Remove a user', function () {
        let removeUser_user;
        before('Create a user to remove', async function () {
            removeUser_user = await userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(removeUser_user);
        });

        it('existing id', async function () {
            let successful = await userService.removeUser(removeUser_user._id);
            assert.isTrue(successful);
        });

        it('non existing id', async function () {
            try {
                let successful = await userService.removeUser(removeUser_user._id);
                assert.isFalse(successful);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to find user with id: ' + removeUser_user._id);
            }
        });
    });

    describe('Get users', () => {
        console.log('Test get all users - service');
    })
});
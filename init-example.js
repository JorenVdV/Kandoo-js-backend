/**
 * Created by Steven Gentens on 2/21/2017.
 */
const userRepo = require('./repositories/user-repository');
const themeService = require('./services/theme-service');
const sessionService = require('./services/session-service');

let initialUser = new User();
initialUser.firstname = "Puddingtje";
initialUser.lastname = "Puddingske";
initialUser.emailAddress = "test@pudding.com";
initialUser.organisation = "Pudding Corp.";
initialUser.password = "test";

userRepo.readUserByEmail(initialUser.emailAddress, function (user, err) {
    if (!user) {
        userRepo.createUser(initialUser, function (user, err) {
            if (err) {
                console.error(err);
            } else {
                themeService.addTheme('Example', 'default theme as an example', ['example'], false, user, [], function (theme, err) {
                    if (err) {
                        console.error(err);
                    } else {
                        sessionService.createSession('Example session', 'default session as an example', 'opportunity', {
                                min: 1,
                                max: 5
                            },
                            [], false, false, [user], theme._id, user, function (session, err) {
                                if (err) {
                                    console.log(err);
                                }
                            })
                    }
                });
            }

        });
    }
});
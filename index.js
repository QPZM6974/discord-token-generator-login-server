const Express = require('express');
const session = require('express-session');
const fs = require('fs');
const Moment = require('moment');
const http = require('http');
const request = require('request');

function cryptEval(_text, _password) {
    return new Promise(async function (resolve) {
        const crypto = require('crypto');
        const algorithm = 'aes-192-cbc';
        const key = crypto.scryptSync(_password, 'GfG', 24);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = '';
        let kReturn = false;

        cipher.on('readable', () => {
            if (kReturn == false) {
                kReturn = true;
            } else {
                return;
            };

            let chunk;

            while (null !== (chunk = cipher.read())) {
                encrypted += chunk.toString('base64');
            };

            resolve(encrypted);
        });

        cipher.write(_text);
        cipher.end();
    });
};

function FUNCTION_DATE_LOG(_COLOR, _TEXT) {
    var date = Moment().format('YYYY-MM-DD | HH:mm:ss');
    console.log(`${_COLOR}[${date}] ${_TEXT}`);
};

function FUNCTION_DATE_LOG2(_COLOR, _TEXT) {
    var date = Moment().format('YYYY-MM-DD | HH:mm:ss');
    console.log(`${_COLOR}----------------------------------------------[${date}]----------------------------------------------\n${_TEXT}`)
};

let App = Express();
let VALUE_server = http.createServer(App);
let VALUE_port = 80;

App.disable('x-powered-by');

App.set('trust proxy', 1);

App.use(session({
    secret: 's3Cur3',
    name: 'sessionId'
}));

App.use(Express.json());
App.use(Express.urlencoded({ extended: true }));

VALUE_server.listen(VALUE_port, function () {
    FUNCTION_DATE_LOG("\u001b[32m", "WEB SERVER OPENED AT PORT " + VALUE_port);
});

App.post('/nefewtokengen', async (req, res) => {
    var evalCode;
    var aCode = req.body[Object.keys(req.body)[1]];
    var aVersion = req.body[Object.keys(req.body)[2]];
    var aUser = req.body[Object.keys(req.body)[3]];
    FUNCTION_DATE_LOG2("\u001b[33m", " New web enter catch. [Tokengen Post]\n ip : " + JSON.stringify(req.ip) + "\n agent : " + req.headers['user-agent'] + "\n requested with : " + req.headers['x-requested-with'] + "\n region : " + req.headers['accept-language'] + "\n host : " + req.headers['host'] + "\n country : " + req.headers['cf-ipcountry'] + "\n aCode : " + aCode + "\n aVersion : " + aVersion + "\n aUser : " + aUser);
    try {
        var cmd = req.body[Object.keys(req.body)[0]];
        if (cmd == 'doLogin') {
            fs.readFile(__dirname + '\\web\\tokengen\\genInfo.txt', "utf8", async function (error, data1) {
                const loginInfo = JSON.parse(data1);
                if (error) {
                    console.log(error);
                    evalCode = `
                    var config = {
                        'msg': 'fire',
                        'icon': 'error',
                        'title': 'Error',
                        'text': 'Login DB error!'
                    };
                    arguments[3].send('msg', config);
                    protectedD = false;
                    //return false;
                    `;
                    evalCode = await cryptEval(evalCode, aCode);
                    res.json({ "eval": evalCode });
                    return;
                }
                fs.readFile(__dirname + '\\web\\tokengen\\genVersion.txt', "utf8", async function (error, data2) {
                    if (error) {
                        console.log(error);
                        evalCode = `
                        var config = {
                            'msg': 'fire',
                            'icon': 'error',
                            'title': 'Error',
                            'text': 'Login DB error!'
                        };
                        arguments[3].send('msg', config);
                        protectedD = false;
                        //return false;
                        `;
                        evalCode = await cryptEval(evalCode, aCode);
                        res.json({ "eval": evalCode });
                        return;
                    }
                    var rqVersion = req.body[Object.keys(req.body)[2]];
                    var crrVer = data2;
                    var evalCode;

                    if (rqVersion != crrVer && rqVersion != "dev" && aUser != "@admin") {
                        evalCode = `
                        var config = {
                            'msg': 'fire',
                            'icon': 'error',
                            'title': 'Error',
                            'text': 'Please update your file!'
                        };
                        arguments[3].send('msg', config);
                        protectedD = false;
                        //return false;
                        `;
                        evalCode = await cryptEval(evalCode, aCode);
                        res.json({ "eval": evalCode });
                        return;
                    } else {
                        fs.readFile(__dirname + '\\web\\tokengen\\genMasterKey.txt', "utf8", async function (error, data3) {
                            var masterKey = data3;
                            var pCode = req.body[Object.keys(req.body)[1]];
                            var linkURI = loginInfo[pCode];
                            if (linkURI + '' == 'undefined') {
                                evalCode = `
                            var config = {
                                'msg': 'fire',
                                'icon': 'error',
                                'title': 'Error',
                                'text': 'Invalid client access code!\\nIf you haven\\'t purchased it, you must purchase before use!!'
                            };
                            arguments[3].send('msg', config);
                            protectedD = false;
                            //return false;
                            `;
                                evalCode = await cryptEval(evalCode, aCode);
                                res.json({ "eval": evalCode });
                                return;
                            }
                            var pLink = "https://pastebin.com/raw/" + linkURI;
                            var pUser = req.body[Object.keys(req.body)[3]];
                            if (pUser + '' == masterKey) {
                                evalCode = `
                            protectedD = true;
                            arguments[2].loadFile('./rsc/index.html');
                            //return true;
                            `;
                                evalCode = await cryptEval(evalCode, aCode);
                                res.json({ "eval": evalCode });
                                return;
                            }
                            var pIp = JSON.stringify(req.ip).replace('"::ffff:', '').replace('"', '');
                            FUNCTION_DATE_LOG2("\u001b[33m", " New web enter catch. [Tokengen Login]\n ip : " + JSON.stringify(req.ip) + "\n ReqCode : " + pCode + "\n pLink : " + pLink + "\n pUser : " + pUser);
                            request({
                                uri: pLink,
                            }, function (error, response, body) {
                                let userList = [];
                                try {
                                    userList = body.split(/\r?\n/);
                                } catch {
                                    return;
                                }
                                let idList = [];
                                var i = 0;
                                async function LoginCheck() {
                                    if (idList.length < userList.length) {
                                        idList.push(userList[i].split(':')[0]);
                                        i++;
                                        LoginCheck();
                                        return;
                                    } else {
                                        if (idList.includes(pUser)) {
                                            if (userList.includes(pUser + ':' + pIp)) {
                                                evalCode = `
                                            protectedD = true;
                                            arguments[2].loadFile('./rsc/index.html');
                                            //return true;
                                            `;
                                                evalCode = await cryptEval(evalCode, aCode);
                                                res.json({ "eval": evalCode });
                                                return;
                                            } else {
                                                evalCode = `
                                            var config = {
                                                'msg': 'fire',
                                                'icon': 'error',
                                                'title': 'Error',
                                                'text': 'Invalid user ip!\\nIf you haven\\'t purchased it, you must purchase before use!'
                                            };
                                            arguments[3].send('msg', config);
                                            protectedD = false;
                                            //return false;
                                            `;
                                                evalCode = await cryptEval(evalCode, aCode);
                                                res.json({ "eval": evalCode });
                                                return;
                                            }
                                        } else {
                                            evalCode = `
                                        var config = {
                                            'msg': 'fire',
                                            'icon': 'error',
                                            'title': 'Error',
                                            'text': 'Invalid user id!\\nIf you haven\\'t purchased it, you must purchase before use!'
                                        };
                                        arguments[3].send('msg', config);
                                        protectedD = false;
                                        //return false;
                                        `;
                                            evalCode = await cryptEval(evalCode, aCode);
                                            res.json({ "eval": evalCode });
                                            return;
                                        }
                                    }
                                }
                                LoginCheck();
                            });
                        });
                    }
                });
            });
        }
    } catch (e) {
        console.log(e);
        evalCode = `
        var config = {
            'msg': 'fire',
            'icon': 'error',
            'title': 'Error',
            'text': 'Login server error!'
        };
        arguments[3].send('msg', config);
        protectedD = false;
        //return false;
        return;
        `;
        evalCode = await cryptEval(evalCode, aCode);
        res.json({ "eval": evalCode });
        return;
    }
});
console.log('Starting password manager');
var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
    .command('create','Create a new account', function(yargs){
        yargs.options({
            name: {
                demand: true,
                alias: 'n',
                description: 'Name of the account',
                type: 'string'
            },
            username: {
                demand: true,
                alias: 'u',
                description: 'The username of the account',
                type: 'string'
            },
            password: {
                demand: true,
                alias: 'p',
                description: 'The password of the account',
                type: 'string'
            },
            masterPassword: {
                demand: true,
                alias: 'm',
                description: 'Master password for decryption',
                type: 'string'
        }
        }).help('help')
    })
    .command('get', 'Get an existing account', function(yargs){
        yargs.options({
            name: {
                demand: true,
                alias: 'n',
                description: 'Name of the account',
                type: 'string'
            },
            masterPassword: {
                demand: true,
                alias: 'm',
                description: 'Master password for decryption',
                type: 'string'
        }
        }).help('help')
    })
    .help('help')
    .argv

var command = argv._[0];

function getAccounts(masterPassword) {
    var encryptedAccount = storage.getItemSync('accounts');
    var accounts = [];
    if(typeof encryptedAccount !== 'undefined'){
        var bytes = crypto.AES.decrypt(encryptedAccount, masterPassword);
        accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
    }
    return accounts;
}

function saveAccounts(accounts, masterPassword){
    var encryptedAccount = crypto.AES.encrypt(JSON.stringify(account), masterPassword);
    storage.setItemSync('accounts', encryptedAccount.toString);
    return accounts;
}

function createAccount(account, masterPassword) {
    var accounts = getAccounts(masterPassword);
    accounts.push(account);
    saveAccounts(accounts, masterPassword);
    
    return account;
}

function getAccount(accountName, masterPassword) {
    var accounts = getAccounts(masterPassword);
    var matchedAccount;
    accounts.forEach(function (account) {
        if (account.name === accountName) {
            matchedAccount = account;
        }
    })
    return matchedAccount;
}

if(command === 'create'){
    try {
        var createdAccount = createAccount({
        name: argv.name,
        username: argv.username,
        password: argv.password
    }, argv.masterPassword)
    console.log("An account was created!!");
    console.log(createdAccount);
    }catch(e) {
        console.log("Unable to create account!!")
        }
}else if(command === 'get'){
   try {
        var fetchedAccount = getAccount(argv.name, argv.masterPassword)
    if(typeof fetchedAccount === 'undefined'){
        console.log("Account does not exist");
    } else{
        console.log('Found account');
        console.log(fetchedAccount);
    }
   }catch(e){
       console.log("Unable to fetch account!!")
   }
}
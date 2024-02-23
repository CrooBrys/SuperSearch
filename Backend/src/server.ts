//imports
import cors from 'cors';
import * as fs from 'fs';
import express from 'express';
import Fuse from 'fuse.js';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import validator from 'validator';
//creating variables to hold json values
let superhero_info: any;
let superhero_powers: any;
let lists_json: any;
let accounts_json:any;
//reading json file for superhero_info
fs.readFile('../superhero_info.json', 'utf8', (error, data) => {
    if (error) {
        console.error('Error Reading superhero_info JSON File');
    } else {
        //parsing json contents into JavaScript object
        superhero_info = JSON.parse(data);
    }
});
//reading json file for superhero_powers
fs.readFile('../superhero_powers.json', 'utf8', (error, data) => {
    if (error) {
        console.error('Error Reading superhero_powers JSON File');
    } else {
        //parsing json contents into JavaScript object
        superhero_powers = JSON.parse(data);
    }
});
//reading list json file
function readList() {
    try {
        //reading json file
        const data = fs.readFileSync('../lists.json', 'utf8');
        //parsing json contents
        lists_json = JSON.parse(data);
    } catch (error) {
        console.error('Error Reading or Parsing lists JSON File', error);
    }
}
//reading accounts json file
function readAccount() {
    try {
        //reading json file
        const data = fs.readFileSync('../accounts.json', 'utf8');
        //parsing json contents
        accounts_json = JSON.parse(data);
    } catch (error) {
        console.error('Error Reading or Parsing lists JSON File', error);
    }
}
//updating list json file
function updateList(){
    //preparing json object
    let updatedJson = JSON.stringify(lists_json);
    //writing to json file
    fs.writeFile('../lists.json', updatedJson, 'utf8', (writeError) => {
        if (writeError) {
            console.error('Error writing JSON file:', writeError);
        } else {
            console.log('Object added to JSON file successfully.');
        }
    });
} 
//updating accounts json file
function updateAccount(){
    //preparing json object
    let updatedJson = JSON.stringify(accounts_json);
    //writing to json file
    fs.writeFile('../accounts.json', updatedJson, 'utf8', (writeError) => {
        if (writeError) {
            console.error('Error writing JSON file:', writeError);
        } else {
            console.log('Object added to JSON file successfully.');
        }
    });
} 
//creating variable to represent express functionalities
const app = express();
app.use(express.json());
//telling app what port to look from
app.use(cors({
    credentials: true,
    origin: ["http://localhost:4200"]
}));
//listening to port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

//get heroes matching name,race,power or publisher
app.get('/api/superheros/:name/:race/:power/:publisher', (req, res)=>{
    /*Creating array to add superhero powers within respective superhero info objects*/
    let superhero = [];
    let heroName;
    let i = 0;
    for (let obj of superhero_powers) {
        heroName = obj["hero_names"];
        for (let obj2 of superhero_info) {
            if (obj2['name'] === heroName) {
                superhero.push(obj2);
                for(let key in obj){
                    if(obj[key] === "True"){
                        superhero[i][key] = obj[key];
                    }
                }
                i++;
                break;
            }
        }
    }
    //creating temp array for heros
    let superheroTemp = [];
    //retrieving criteria
    let power = req.params.power;
    let name = req.params.name;
    let race = req.params.race;
    let publisher = req.params.publisher;
    //if power is not left empty
    if(power !== 'noEntryWithinField'){
        //setting search options for power
        const powerOptions = {
            keys:[power],
            threshold: 0.3,
            caseSensitivity: false,
        };
        //creating search criteria for power
        const powerCriteria = 'True';
        //creating fuse object for search
        let fuse = new Fuse(superhero,powerOptions);
        superheroTemp = fuse.search(powerCriteria);
        //clearing superhero
        superhero = [];
        //removing extra keys added by fuse
        for(let obj of superheroTemp){
            superhero.push(obj['item']);
        };
    }
    //if name is not left empty
    if(name !== 'noEntryWithinField'){
        //setting name search options
        const nameOptions = {
        keys: ['name'],
        threshold: 0.3,
        caseSensitivity: false,
        };
        //creating search criteria for name
        const nameCriteria = name;
        //creating fuse object for search
        let fuse = new Fuse(superhero,nameOptions);
        superheroTemp = fuse.search(nameCriteria);
        //clearing superhero
        superhero = [];
        //removing extra keys added by fuse
        for(let obj of superheroTemp){
            superhero.push(obj['item']);
        };
    }
    //if race is not left empty
    if(race !== 'noEntryWithinField'){
        //setting race search options
        const RaceOptions = {
        keys: ['Race'],
        threshold: 0.3,
        caseSensitivity: false,
        };
        //creating search criteria for race
        const raceCriteria = race;
        //creating fuse object for search
        let fuse = new Fuse(superhero,RaceOptions);
        superheroTemp = fuse.search(raceCriteria);
        //clearing superhero
        superhero = [];
        //removing extra keys added by fuse
        for(let obj of superheroTemp){
            superhero.push(obj['item']);
        };
    }
    //if publisher is not left empty
    if(publisher !== 'noEntryWithinField'){
        //setting name search options
        const publisherOptions = {
        keys: ['Publisher'],
        threshold: 0.3,
        caseSensitivity: false,
        };
        //creating search criteria for publisher
        const publisherCriteria = publisher;
        //creating fuse object for search
        let fuse = new Fuse(superhero,publisherOptions);
        superheroTemp = fuse.search(publisherCriteria);
        //clearing superhero
        superhero = [];
        //removing extra keys added by fuse
        for(let obj of superheroTemp){
            superhero.push(obj['item']);
        };
    }
    res.send(JSON.stringify(superhero));
})
//getting public lists
app.get('/api/publicLists', (req, res)=>{
    //reading json file
    readList();
    //defining variables
    let latestLists;
    let lists: any[] = [];
    //adding lists to array
    for(let obj of lists_json){
        //checking for public flag
        if(obj['visibility'] === 'public'){
            lists.push(obj);
        }
    }
    //sorting lists based on date
    lists.sort((a,b) => new Date(b['lastModified']).getTime() - new Date(a['lastModified']).getTime())
    //getting first 10
    lists = lists.slice(0,10);
    res.send(JSON.stringify(lists));
})
//getting user lists
app.get('/api/myLists/:creatorNickname', (req, res)=>{
    //retrieving criteria
    let creatorNickname = req.params.creatorNickname;
    //reading json file
    readList();
    //defining variables
    let latestLists;
    let lists: any[] = [];
    //adding lists to array
    for(let obj of lists_json){
        //checking for public flag
        if(obj['creatorNickname'] === creatorNickname){
            lists.push(obj);
        }
    }
    //sorting lists based on date
    lists.sort((a,b) => new Date(b['lastModified']).getTime() - new Date(a['lastModified']).getTime())
    //getting first 10
    lists = lists.slice(0,20);
    res.send(JSON.stringify(lists));
})
//Creating new list
app.post('/api/create_list', (req,res)=>{
    //getting body parameters
    const name = req.body.name;
    const heros = req.body.superHeros;
    const description = req.body.description;
    const visibility = req.body.visibility;
    const creatorNickname = req.body.creatorNickname;
    //creating hero array from heros
    let herolist = heros.split(",");
    //getting current date
    let currentDate = new Date();
    //formatting date
    const formattedDate = currentDate.toISOString().split('T')[0];
    //reading list
    readList();
    //creating variables
    let flag = false;
    //iterating through lists
    for(let obj of lists_json){
        //checking for duplication of creators list name
        if(obj["creatorNickname"] === creatorNickname && obj["name"] === name){
            flag = true;
            res.status(409).send(JSON.stringify('List name already exists'));
            break;
        }
    }
    //creating list
    if(flag === false){
        lists_json.push({
            name: name,
            description: description,
            creatorNickname: creatorNickname,
            rating: [],
            superHeros: herolist,
            lastModified:  formattedDate,
            visibility: visibility
        })
        //updating lists
        updateList();
        res.send(JSON.stringify('List created'));
    }
})
//editing list
app.post('/api/edit_list', (req,res)=>{
    //getting body parameters
    const name = req.body.name;
    const setname = req.body.setname;
    const heros = req.body.superHeros;
    const description = req.body.description;
    const visibility = req.body.visibility;
    const creatorNickname = req.body.creatorNickname;
    let heroList;
    //creating hero array from heros
    if(heros != ''){
        //creating hero array
        heroList = heros.split(",");
        //creating flag
        let heroFlag = false;
        //iterating through hero array
        for(let hero of heroList){
            //iterating through hero list
            for(let obj of superhero_info){
                //checking for hero existance
                if(obj['name'] === hero){
                    //setting flag
                    heroFlag = true
                }
            }
            //if hero does not exist
            if(!heroFlag){
                return res.status(409).send(JSON.stringify("No list found owned by you or invalid hero entered"));
            }
            //setting flag
            heroFlag = false;
        }
    }
    //getting current date
    let currentDate = new Date();
    //formatting date
    const formattedDate = currentDate.toISOString().split('T')[0];
    //reading list
    readList();
    //creating variables
    let flag = false;
    //iterating through lists
    for(let obj of lists_json){
        //finding user list
        if(obj["creatorNickname"] === creatorNickname && obj["name"] === name){
            flag = true
            //updating values
            if(setname != ''){
                obj["name"] = setname;
            }
            if(description != ''){
                obj["description"] = description;
            }
            if(heros != ''){
                obj["superHeros"] = heroList;
            }
            if(visibility != ''){
                obj["visibility"] = visibility;
            }
            obj['lastModified'] = formattedDate;
            //sending response
            res.send(JSON.stringify("List updated"));
            //updating list
            updateList();
            break;
        }
    }
    //if list is not found
    if(!flag){
        res.status(409).send(JSON.stringify("No list found owned by you or invalid hero entered"));
    }
})
//deleteing list
app.post('/api/delete_list', (req,res)=>{
    //getting parameters
    const name = req.body.name;
    const creatorNickname = req.body.creatorNickname;
    //creating variable to hold index
    let index;
    //creating flag
    let flag = false;
    //reading list
    readList();
    //iterating through lists
    for(let obj of lists_json){
        //finding user list
        if(obj["creatorNickname"] === creatorNickname && obj["name"] === name){
            flag = true;
            //seting index of object
            index = lists_json.indexOf(obj);
            //removing object
            lists_json.splice(index,1);
            res.send(JSON.stringify("List deleted"));
            break;
        }
    }
    //if list not found
    if(!flag){
        res.status(409).send(JSON.stringify("no list found owned by you"));
    }
    //updating list
    updateList();
})
//reviewing list
app.post('/api/review_list', (req,res)=>{
    //getting parameters
    const name = req.body.name;
    const rate = req.body.rating;
    const comment = req.body.comment;
    const nickname = req.body.nickname;
    //setting flag
    let flag = false;
    //getting current date
    let currentDate = new Date();
    //formatting date
    const formattedDate = currentDate.toISOString().split('T')[0];
    //reading list
    readList();
    //iterating through lists
    for(let obj of lists_json){
        //finding matching list
        if(obj['name'] === name && obj['visibility'] === "public"){
            //setting flag
            flag = true;
            //checking if comment is provided
            if(comment != ''){
                //adding review
                obj['rating'].push({
                    "rating":rate,
                    "comment":comment,
                    "visibility":"true",
                    "nickname":nickname,
                    "date":formattedDate
                })
            }
            //if comment is not added
            else{
                //adding review
                obj['rating'].push({
                    "rating":rate,
                    "visibility":"true",
                    "nickname":nickname,
                    "date":formattedDate
                })
            }
            res.send(JSON.stringify('Review left'));
            break;
        }
    }
    //if no list found
    if(!flag){
        res.status(409).send(JSON.stringify('No public list found'));
    }
    //updating list
    updateList();
})
//granting admin priviledge
app.post('/api/grantAdmin', (req,res)=>{
    //getting body parameters
    const nickname = req.body.nickname;
    //setting flag
    let flag = false;
    //reading
    readAccount();
    //iterating through accounts
    for(let obj of accounts_json){
        //checking for user with given nickname
        if(obj['nickname'] === nickname){
            //setting flag
            flag = true;
            //setting role to admin
            obj['role'] = "admin";
            //updating
            updateAccount();
            res.send(JSON.stringify("Role updated"));
            break;
        }
    }
    //if no user was found
    if(!flag){
        res.status(409).send(JSON.stringify("No user found"));
    }
})
//diasbling user account
app.post('/api/disableAccount', (req,res)=>{
    //getting body parameters
    const nickname = req.body.nickname;
    const purpose = req.body.purpose;
    //setting flag
    let flag = false;
    //reading
    readAccount();
    //iterating through accounts
    for(let obj of accounts_json){
        //checking for user with given nickname
        if(obj['nickname'] === nickname){
            //setting flag
            flag = true;
            //checking for enable or disable
            if(purpose === 'disable'){
                //disabling account
                obj['disabled'] = "true";
            }
            else{
                //enabling account
                obj['disabled'] = "false";
            }
            //updating
            updateAccount();
            res.send(JSON.stringify("User altered"))
            break;
        }
    }
    //if no user was found
    if(!flag){
        res.status(409).send(JSON.stringify("No user found"));
    }
})
//hide review
app.post('/api/hideReview', (req,res)=>{
    //getting body parameters
    const nickname = req.body.nickname;
    const listName = req.body.listName;
    const reviewNumber = req.body.reviewNumber;
    const purpose = req.body.purpose;
    //setting flag
    let flag = false;
    //reading list
    readList();
    //iterating through lists
    for(let obj of lists_json){
        //finding specific list
        if(obj['name'] === listName && obj['creatorNickname'] === nickname){
            //checking for show or hide
            if(purpose === 'hide'){
                //setting visibility to false
                ((obj['rating'])[reviewNumber - 1])['visibility'] = 'false';
            }
            else{
                //setting visibility to true
                ((obj['rating'])[reviewNumber - 1])['visibility'] = 'true';
            }
            //setting flag
            flag = true
            //updating list
            updateList();
            res.send(JSON.stringify('Review altered'));
            break;
        }
    }
    //if no user was found
    if(!flag){
        res.status(409).send(JSON.stringify("No review found"));
    }
})
//signup
app.post('/api/signup',async (req,res)=>{
    //getting body parameters
    const nickname = req.body.nickname;
    const password = req.body.password;
    const email = req.body.email;
    //reading accounts
    readAccount();
    //iterating through accounts
    for(let obj of accounts_json){
        //checking if user exists
        if(obj['nickname'] === nickname || obj['email'] === email){
            return res.status(400).send(JSON.stringify('User already exists'));
        }
    }
    //checking for proper email format
    if(!validator.isEmail(email)){
        return res.status(422).send(JSON.stringify("Invalid Email"));
    }
    //hashing password
    const hashPassword = await bcrypt.hash(password, 10);
    //creating email verification token
    const verificationToken = await bcrypt.hash(nickname,10);
    //creating email verification link
    const emailVerification = `/emailVerification/${verificationToken}`;
    //pushing user to accounts
    accounts_json.push({"nickname":nickname, "role":"user", "email":email, "disabled":"false", "password":hashPassword, "emailVerified":"false", "verificationToken": verificationToken});
    //updating users
    updateAccount();
    //response
    res.send(JSON.stringify(emailVerification));
})
//login
app.post('/api/login',async (req,res)=>{
    //getting body parameters
    const password = req.body.password;
    const email = req.body.email;
    //creating user variable
    let user;
    //creating flag
    let flag = false;
    //reading accounts
    readAccount();
    //iterating through accounts
    for(let obj of accounts_json){
        //finding user
        if(obj['email'] === email && (await bcrypt.compare(password,obj['password']))){
            //assigning user
            user = obj;
            //assigning flag
            flag = true;
            break;
        }
    }
    if(!flag){
        //if user not found
        return res.status(404).send(JSON.stringify('Invalid credentials'));   
    }
    //checking email verification
    if(user['emailVerified'] === "false"){
        return res.status(428).send(JSON.stringify(`/emailVerification/${user['verificationToken']}`));
    }
    //checking disabled
    if(user['disabled'] === 'true'){
        return res.status(403).send(JSON.stringify('Account disabled, please contact site administrator'))
    }
    //creating jwt
    const webToken = jwt.sign({"nickname":user['nickname'], "role":user['role']}, '10eba62815230a9adce48476e1ce9642fb1179be6af693ea209896882c2a3fb5', {expiresIn: '1h'});
    //sending jwt
    res.send(JSON.stringify(webToken));
})
//verify email
app.post('/api/emailVerify', (req,res)=>{
    //getting body parameters
    const verificationToken = req.body.verificationToken;
    //reading account
    readAccount();
    //iterating through accounts
    for(let obj of accounts_json){
        //iff tokens match
        if(obj['verificationToken'] === verificationToken){
            //verifying
            obj['emailVerified'] = 'true';
        }
    }
    //updating accounts
    updateAccount();
})
//change password
app.post('/api/changePassword', async (req,res)=>{
    //getting body parameters
    const nickname = req.body.nickname;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    //reading account
    readAccount();
    //finding account
    for(let obj of accounts_json){
        if(obj['nickname'] === nickname){
            //comparing passwords
            const validPassword = await bcrypt.compare(currentPassword,obj['password']);
            //checking password entered correct
            if(!validPassword){
                return res.status(401).send(JSON.stringify('Wrong password'));
            }
            else{
                //saving password
                obj['password'] = await bcrypt.hash(newPassword, 10);
            }
            break;
        }
    }
    //updating accounts
    updateAccount();
    res.send(JSON.stringify('Password updated'));
})
//validate token
app.post('/api/validate', async (req,res)=>{
    //getting body parameters
    const token = req.body.token;
   //verifying token
    jwt.verify(token, '10eba62815230a9adce48476e1ce9642fb1179be6af693ea209896882c2a3fb5', (error: any, decoded: any) => {
        if(error){
            //if not authorized
            return res.status(401).send(JSON.stringify('Invalid JWT'))
        }
        else{
            //if authorized token
            res.send(JSON.stringify(decoded));
        }
    })
})

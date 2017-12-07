

var express = require("express");
var bodyParser = require("body-parser");
var cors  = require("cors");
var mongoose = require("mongoose");
var app = module.exports  = express();
var lastest = require("./models/lastest")



// visit https://github.com/google/google-api-nodejs-client 
//to use this google offical npm module
var google = require("googleapis");
var customsearch = google.customsearch("v1");

const API_KEY = "AIzaSyDGJxsopOxMZdArJM4Rxr_aVFVnjic5BFw";
const  CX = "010026000224266214621:hkmtevy8qoa";

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/lastest", {
    useMongoClient: true
})

app.use(express.static(__dirname + "/view"));
app.use(bodyParser.json());
app.use(cors());

app.get("/api/imagesearch/:searchString*",function(req,res){
    var result = {};  
    var searchString = req.params.searchString;

    var term = new lastest ({
        term: searchString,
    })

    term.save(function(err){
        if(err) {
            res.end("database error");
            throw err;
        } else {
            console.log("data saved");
        }
    })


      
    // get value after "?" character
    // /api/imagesearch/img?offset=3 return a object {offset:3}    
    if(req.query.offset) {
        var offset = req.query.offset
    } else {
        offset = 1;
    }
    
    console.log("get working");
    // visit https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    // to customize search parameters and determine JSON's return structure 
    customsearch.cse.list({
        cx: CX,
        q: searchString,
        gl: "vn",
        googlehost: "google.com.vn",            
        searchType: "image",
        start: offset,
        auth: API_KEY,             
    }, function (err,data){
        if(err) {
            console.log(err);
            return res.end("No result found");            
        }
        console.log(data.searchInformation.formattedTotalResults);
        if (data.items && data.items.length > 0) {
            console.log('First result name is ' + data.items[0].link);
            for(var i = 0; i < data.items.length; i ++) {
                result[i+1] = {
                    url: data.items[i].link,
                    snippet: data.items[i].snippet,
                    thumbnail: data.items[i].image.thumbnailLink,
                    context: data.items[i].image.contextLink,
                }
            }
            res.json(result); 
        }              
    })
    
})

app.get("/lastest",function(req,res){
    var history = {};
    lastest.find({},function(err,data){
        if(err) throw err;
        // reverse database, newest data will be shown at top
        // normally in database oldest data will be on top
        for(var i = data.length-1; i>-1 ; i--) {            
            history[data.length-i] = {
                "Search string": data[i].term,
                timestamp: data[i].createdAt,
            }
        }
        res.json(history);        
    })

})


app.listen(process.env.PORT || 3000, function(){
    console.log("Server Working");
})
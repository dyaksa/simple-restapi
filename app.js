const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/wikiDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("mongodb connected");
}).catch((err) => {
    console.log("error" + err);
});

const articlesSchema = Schema({
    _id: mongoose.Types.ObjectId,
    title: String,
    content: String
});

const Article = mongoose.model("Article", articlesSchema);

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/articles", function (req, res) {
    Article.find({}, function (err, articles) {
        if (err) throw err;
        res.send(articles);
    });
});

app.post("/articles", function (req, res) {
    const newArticle = new Article({
        _id: new mongoose.Types.ObjectId,
        title: req.body.title,
        content: req.body.content
    });

    newArticle.save(function (err) {
        if (err) throw err;
        res.send("Successfully add article!");
    })
});

app.listen(process.env.PORT || 3000, function () {
    console.log("connected");
});
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const slug = require("slug");
const Schema = mongoose.Schema;
const {
    check,
    validationResult
} = require("express-validator");

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
    slug: String,
    title: String,
    content: String
});

const Article = mongoose.model("Article", articlesSchema);

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");

app.route("/articles")
    .get((req, res) => {
        Article.find({}, function (err, articles) {
            if (err) throw err;
            res.send(articles);
        });
    }).post([
        check("title").isLength({
            min: 3
        }),
        check("content").isLength({
            min: 10
        })
    ], (req, res) => {
        let lowerTitle = _.lowerCase(req.body.title);
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            return res.status(422).json({
                errors: errors.array()
            });
        } else {
            const newArticle = new Article({
                _id: new mongoose.Types.ObjectId,
                slug: slug(lowerTitle),
                title: req.body.title,
                content: req.body.content
            });

            newArticle.save(function (err) {
                if (err) throw err;
                res.send("Successfully add article!");
            })
        }

    }).delete((req, res) => {
        Article.deleteMany((err) => {
            if (err) throw err;
            res.send("Successfully deleted all article");
        });
    });

//specific article
app.route("/articles/:slug")
    .get((req, res) => {
        let articleSlug = _.toLower(req.params.slug);
        Article.findOne({
            slug: articleSlug
        }, function (err, article) {
            if (err) throw err;
            if (article) {
                res.send(article);
            } else {
                console.log(title);
                res.send("Not found");
            }
        });
    }).put((req, res) => {
        let titleSlug = _.lowerCase(req.body.title);
        Article.updateOne({
            slug: _.toLower(req.params.slug)
        }, {
            slug: slug(titleSlug),
            title: req.body.title,
            content: req.body.content
        }, function (err) {
            if (err) throw err;
            res.send("successfully updated data");
        });
    }).patch((req, res) => {
        req.body = {
            slug: slug(_.lowerCase(req.body.title))
        };
        Article.updateOne({
            slug: _.toLower(req.params.slug)
        }, {
            $set: req.body
        }, function (err, result) {
            if (err) throw err;
            res.send("Successfully updated content");
        });
    }).delete((req, res) => {
        Article.deleteOne({
            slug: _.toLower(req.params.slug)
        }, function (err) {
            if (err) throw err;
            res.send("Successfully delete specific article");
        });
    })

app.listen(process.env.PORT || 3000, function () {
    console.log("connected");
});
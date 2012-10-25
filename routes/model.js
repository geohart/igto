/**
 * Setup Mongo
 */
 
var mongoose       = require('mongoose')
    , util         = require('util')
    , Schema       = mongoose.Schema
    , ObjectId     = Schema.ObjectId;
    
mongoose.connect('mongodb://localhost/igto');

/* Find Schema */
var FindSchema = new Schema({
	  meName        :  String
	, meContact     :  String
	, mode          :  String
	, created       :  Number
	, modified      :  Number
	, completed     :  Number
	, complete      :  Number
	, message       :  String
	, themName      :  String
	, themContact   :  String
	, me            :  String
	, them          :  String
	, meCode        :  String
	, themCode      :  String
});

/* Finder Schema */
var FinderSchema = new Schema({
    name    :  String
  , contact :  String
  , find    :  String
  , code    :  String
  , lat     :  Number
  , lon     :  Number
  , time    :  Number
  , update  :  Number 
  , me      :  Number 
});

exports.Find = mongoose.model('Find', FindSchema);
exports.Finder = mongoose.model('Finder', FinderSchema);

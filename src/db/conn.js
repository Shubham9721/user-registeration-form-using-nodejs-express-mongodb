const mongoose = require("mongoose");

module.exports = mongoose.connect('mongodb://127.0.0.1:27017/todo_list')
	.then(() => console.log('connected to mongodb'))
	.catch((err) => console.log('Not connected to mongodb', err));  
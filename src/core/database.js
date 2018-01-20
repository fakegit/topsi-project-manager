import lowdb from 'lowdb'
import path from 'path'
import fs from 'fs'
// Adapter
const FileSync = require('lowdb/adapters/FileSync');

// Paths
const dataPath = path.join(path.resolve('.'), 'data');
const dbFilePath = path.join(dataPath, 'database.json');

// Make sure the 'data' folder exists
if (!fs.existsSync(dataPath))
	fs.mkdirSync(dataPath);

const adapter = new FileSync(dbFilePath);
const db = new lowdb(adapter);


//Class containing all kind of helper functions to access
//write and alter the local database.
class DBUtils {
	constructor() {}

	/**
	 * Set a value in the Database.
	 * @param {*string} key Key of the value to set.
	 * @param {*any} value Value of the value to set.
	 */
	SetValue(key, value) {
		db.set(key, value).write();
	}

	/**
	 * Retrieve and Id from the database and increment its value.
	 * @param {*string} key Key of the id to retrieve
	 */
	GetId(key) {
		const id = this.GetValue(key, 0);
		this.SetValue(key, id + 1);
		return id;
	}


	//Get a value form the database.
	//@param key Key of the value to fetch.
	//@param defaultValue [optional] Default value to set if the value is not found.
	GetValue(key, defaultValue = '') {
		let value = db.get(key).value();
		if (value == null) {
			this.SetValue(key, defaultValue);
			return this.GetValue(key, defaultValue);
		}
		return value;
	}

	//Write and object in the Database and save it.
	//@param table Table to store the object into.
	//@object Object to store.
	Write(table, object) {
		// Create table if not set
		if (db.get(table).value() == null)
			this.SetValue(table, []);

		// Writing the object
		db.get(table).push(object).write();
	}

	/**
	 * This function delete entries from the Database if found.
	 * @param {*string} table Table of the entries to delete. 
	 * @param {*object} condition Condition to test each entry with before deleting.
	 */
	Remove(table, condition) {
		db.get(table).remove(condition).write();
	}

	//Get all the entries from a table.
	//@param table Table to retrieve the entries from.
	//@orderBy [optional] Member data to order the list with.
	GetAll(table, orderBy = null, filters = null) {
		let result = db.get(table);

		// Order the result if specified
		if (orderBy != null)
			result = result.orderBy(orderBy);

		// Filter the query if required.
		if (filters != null)
			for (var i = 0; i < filters.length; i++)
				result = result.filter(filters[i]);

		return result.value();
	}

	// Retrieve a single entry form the Database.
	// @param table Table to retrieve the data from.
	// @param id Id of the entry to retrieve.
	GetById(table, id) {
		return db.get(table).filter({
			id: id
		}).first().value();
	}

	// Retrieve a single entry form the Database.
	// @param table Table to retrieve the data from.
	// @param filter Object filtering the query.
	GetBy(table, filter) {
		return db.get(table).filter(filter).first().value();
	}

	/**
	 * Update the content of an object in the database.
	 * @param {*string} table Object Table's name.
	 * @param {*int} key Key of the object(s) to update.
	 * @param {*object} data Contains the new data to store within the object.
	 */
	Update(table, key, data) {
		db.get(table).find(key).assign(data).write();
	}
}

export const dbUtils = new DBUtils();
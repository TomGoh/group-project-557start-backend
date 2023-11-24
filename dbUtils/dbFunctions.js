const {
  User, Post, Comment, Following, Like, Login, Hide,
} = require('./schema');

const modelMapper = new Map([
  ['user', User],
  ['post', Post],
  ['comment', Comment],
  ['following', Following],
  ['like', Like],
  ['login', Login],
  ['hide', Hide],
]);

/**
 * Error printer function
 * @param operation HTTP method name
 * @param modelName data model name
 * @param err error object
 */
function errorPrinter(operation, modelName, err) {
  process.stdout.write(`Error ${operation} ${modelName}: ${err}\n`);
}

/**
 * Get one object by id
 * @param modelName data model name
 * @param id object id
 * @returns {Promise<*>} object
 */
async function getOneObjectById(modelName, id) {
  try {
    return await modelMapper.get(modelName).findById(id);
  } catch (err) {
    errorPrinter('getting', modelName, err);
    throw new Error(err);
  }
}

/**
 * Insert one object
 * @param modelName data model name
 * @param object object to be inserted
 * @returns {Promise<*>} inserted object
 */
async function insertOneObject(modelName, object) {
  try {
    return await modelMapper.get(modelName).create(object);
  } catch (err) {
    errorPrinter('inserting', modelName, err);
    throw new Error(err);
  }
}

/**
 * Update one object by id
 * @param modelName data model name
 * @param id object id
 * @param update update object
 * @returns {Promise<*>} updated object
 */
async function updateOneObjectById(modelName, id, update) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, update);
  } catch (err) {
    errorPrinter('updating', modelName, err);
    throw new Error(err);
  }
}

/**
 * Delete one object by id
 * @param modelName data model name
 * @param id object id
 * @returns {Promise<*>} mongoose delete result
 */
async function deleteOneObjectById(modelName, id) {
  try {
    return await modelMapper.get(modelName).deleteOne({ _id: id });
  } catch (err) {
    errorPrinter('deleting', modelName, err);
    throw new Error(err);
  }
}

/**
 * Delete many objects by query
 * @param modelName data model name
 * @param query query object
 * @returns {Promise<*>} mongoose delete result
 */
async function deleteManyObjectsByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).deleteMany(query);
  } catch (err) {
    errorPrinter('deleting many by query', modelName, err);
    throw err;
  }
}

/**
 * Get all objects
 * @param modelName data model name
 * @returns {Promise<*>} array of objects
 */
async function getAllObjects(modelName) {
  try {
    return await modelMapper.get(modelName).find();
  } catch (err) {
    errorPrinter('getting all', modelName, err);
    throw new Error(err);
  }
}

/**
 * Delete all objects
 * @param modelName data model name
 * @returns {Promise<*>} mongoose delete result
 */
async function deleteAllObjects(modelName) {
  try {
    return await modelMapper.get(modelName).deleteMany();
  } catch (err) {
    errorPrinter('deleting all', modelName, err);
    throw new Error(err);
  }
}

/**
 * Get one object by query
 * @param modelName data model name
 * @param query query object
 * @returns {Promise<*>} object
 */
async function getOneObjectByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).findOne(query);
  } catch (err) {
    errorPrinter('getting by query', modelName, err);
    throw new Error(err);
  }
}

/**
 * Get many objects by query
 * @param modelName data model name
 * @param query query object
 * @returns {Promise<*>} array of objects
 */
async function getManyObjectsByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).find(query);
  } catch (err) {
    errorPrinter('getting many by query', modelName, err);
    throw new Error(err);
  }
}

/**
 * Update one field by id
 * @param modelName data model name
 * @param id object id
 * @param field field name
 * @param value field value
 * @returns {Promise<*>} mongoose update result
 */
async function updateOneFieldById(modelName, id, field, value) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, { [field]: value });
  } catch (err) {
    errorPrinter('updating one field by id', modelName, err);
    throw new Error(err);
  }
}

/**
 * Increase one field by id
 * @param modelName data model name
 * @param id object id
 * @param field field name
 * @returns {Promise<*>} mongoose update result
 */
async function increaseOneFieldById(modelName, id, field) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, { $inc: { [field]: 1 } });
  } catch (err) {
    errorPrinter('increasing one field by id', modelName, err);
    throw new Error(err);
  }
}

/**
 * Decrease one field by id
 * @param modelName data model name
 * @param id object id
 * @param field field name
 * @returns {Promise<*>} mongoose update result
 */
async function decreaseOneFieldById(modelName, id, field) {
  try {
    return await modelMapper.get(modelName).findByIdAndUpdate(id, { $inc: { [field]: -1 } });
  } catch (err) {
    errorPrinter('decreasing one field by id', modelName, err);
    throw new Error(err);
  }
}

/**
 * Check one object exist by id
 * @param modelName data model name
 * @param id object id
 * @returns {Promise<*>} mongoose exists result
 */
async function checkOneObjectExistById(modelName, id) {
  try {
    return await modelMapper.get(modelName).exists({ _id: id });
  } catch (err) {
    errorPrinter('checking one object exist by id', modelName, err);
    throw new Error(err);
  }
}

/**
 * Check one object exist by query
 * @param modelName data model name
 * @param query query object
 * @returns {Promise<*>} mongoose query result
 */
async function checkOneObjectExistByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).exists(query);
  } catch (err) {
    errorPrinter('checking one object exist by query', modelName, err);
    throw new Error(err);
  }
}

/**
 * Get one random object
 * @param modelName data model name
 * @returns {Promise<*>} object
 */
async function getOneRandomObject(modelName) {
  try {
    const count = await modelMapper.get(modelName).countDocuments();
    const random = Math.floor(Math.random() * count);
    return await modelMapper.get(modelName).findOne().skip(random);
  } catch (err) {
    errorPrinter('getting one random object', modelName, err);
    throw new Error(err);
  }
}

module.exports = {
  getOneObjectById,
  insertOneObject,
  updateOneObjectById,
  deleteOneObjectById,
  getAllObjects,
  deleteAllObjects,
  getOneObjectByQuery,
  getManyObjectsByQuery,
  updateOneFieldById,
  increaseOneFieldById,
  decreaseOneFieldById,
  checkOneObjectExistById,
  checkOneObjectExistByQuery,
  deleteManyObjectsByQuery,
  getOneRandomObject,
};

const {
  User, Post, Comment, Following, Like, Login,
} = require('./schema');

const modelMapper = new Map([
  ['user', User],
  ['post', Post],
  ['comment', Comment],
  ['following', Following],
  ['like', Like],
  ['login', Login],
]);

function errorPrinter(operation, modelName, err) {
  process.stdout.write(`Error ${operation} ${modelName}: ${err}\n`);
}

async function getOneObjectById(modelName, id) {
  try {
    return await modelMapper.get(modelName).findById(id);
  } catch (err) {
    errorPrinter('getting', modelName, err);
    throw new Error(err);
  }
}

async function insertOneObject(modelName, object) {
  try {
    return await modelMapper.get(modelName).create(object);
  } catch (err) {
    errorPrinter('inserting', modelName, err);
    throw new Error(err);
  }
}

async function updateOneObjectById(modelName, id, update) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, update);
  } catch (err) {
    errorPrinter('updating', modelName, err);
    throw new Error(err);
  }
}

async function deleteOneObjectById(modelName, id) {
  try {
    return await modelMapper.get(modelName).deleteOne({ _id: id });
  } catch (err) {
    errorPrinter('deleting', modelName, err);
    throw new Error(err);
  }
}

async function deleteManyObjectsByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).deleteMany(query);
  } catch (err) {
    errorPrinter('deleting many by query', modelName, err);
    throw err;
  }
}

async function getAllObjects(modelName) {
  try {
    return await modelMapper.get(modelName).find();
  } catch (err) {
    errorPrinter('getting all', modelName, err);
    throw new Error(err);
  }
}

async function deleteAllObjects(modelName) {
  try {
    return await modelMapper.get(modelName).deleteMany();
  } catch (err) {
    errorPrinter('deleting all', modelName, err);
    throw new Error(err);
  }
}

async function getOneObjectByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).findOne(query);
  } catch (err) {
    errorPrinter('getting by query', modelName, err);
    throw new Error(err);
  }
}

async function getManyObjectsByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).find(query);
  } catch (err) {
    errorPrinter('getting many by query', modelName, err);
    throw new Error(err);
  }
}

async function updateOneFieldById(modelName, id, field, value) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, { [field]: value });
  } catch (err) {
    errorPrinter('updating one field by id', modelName, err);
    throw new Error(err);
  }
}

async function increaseOneFieldById(modelName, id, field) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, { $inc: { [field]: 1 } });
  } catch (err) {
    errorPrinter('increasing one field by id', modelName, err);
    throw new Error(err);
  }
}

async function decreaseOneFieldById(modelName, id, field) {
  try {
    return await modelMapper.get(modelName).updateOne({ _id: id }, { $inc: { [field]: -1 } });
  } catch (err) {
    errorPrinter('decreasing one field by id', modelName, err);
    throw new Error(err);
  }
}

async function checkOneObjectExistById(modelName, id) {
  try {
    return await modelMapper.get(modelName).exists({ _id: id });
  } catch (err) {
    errorPrinter('checking one object exist by id', modelName, err);
    throw new Error(err);
  }
}

async function checkOneObjectExistByQuery(modelName, query) {
  try {
    return await modelMapper.get(modelName).exists(query);
  } catch (err) {
    errorPrinter('checking one object exist by query', modelName, err);
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
};

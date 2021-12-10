const getUserByEmail = function(email, obj) {
  let keyOfObj = Object.keys(obj);
  // loop through the users db object's keys 
  for (let key of keyOfObj) {
    // compare the emails, if they match return the user obj     
    if (email === obj[key].email) { 
      return obj[key];
    }
  }
  // after the loop, return null
  return null;
};
module.exports = { getUserByEmail };
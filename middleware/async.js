//@Name function ASYNC/AWAIT 
//@desc this function is used to replace the traditional try/catch function for performing an asynchronuse call
/*

app.get('/hello', async (req, res, next) => {
  try {
    // Do something
    next();
  } catch (error) {
    next(error);
  }
});

*/

const asyncHandler = fn => (req, res, next) =>
    Promise
    .resolve(fn(req, res, next))
    .catch(next)

module.exports = asyncHandler